import { Payment, Preference } from "mercadopago";

import {
  getBackendUrl,
  getFrontendUrl,
  getMercadoPagoClient,
} from "../config/mercadopago.js";

import { supabase } from "../config/supabase.js";

import {
  getOrderById,
  setOrderPreference,
  updateOrderStatus,
} from "./order.service.js";

import { restockProduct } from "./product.service.js";

interface OrderForPreference {
  id: number;
  total: number;
  buyerId: number;
  items: {
    title: string;
    unitPrice: number;
    quantity: number;
  }[];
}

// Prazo de validade do QR Code PIX (em minutos). Configurável pelo .env
// (PIX_EXPIRATION_MINUTES). O Mercado Pago aceita de 1 minuto a 30 dias.
// Enquanto o PIX não expira ou é pago, o estoque do pedido fica reservado;
// ao expirar, o webhook cancela o pedido e devolve o estoque.
function getPixExpirationMinutes() {
  const minutes = Number(process.env.PIX_EXPIRATION_MINUTES);
  return Number.isFinite(minutes) && minutes >= 1 && minutes <= 43200 ? minutes : 30;
}

const APPROVED_STATUSES = new Set(["approved"]);

const FAILED_STATUSES = new Set([
  "rejected",
  "cancelled",
  "refunded",
  "charged_back",
]);

// _buyerEmail é mantido na assinatura por compatibilidade com os controllers,
// mas NÃO é enviado ao Mercado Pago. Quando o e-mail do comprador pertence a
// uma conta Mercado Pago, o checkout exige login e passa a oferecer apenas
// "Dinheiro em conta" / cartões salvos, escondendo cartão novo e PIX.
export async function createPreferenceForOrder(
  order: OrderForPreference,
  _buyerEmail?: string
) {
  const client = getMercadoPagoClient();
  const preference = new Preference(client);

  const frontendUrl = getFrontendUrl();
  const backendUrl = getBackendUrl();

  // Identifica localhost e 127.0.0.1.
  const isLocalFrontendUrl =
    /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(
      frontendUrl
    );

  const result = await preference.create({
    body: {
      items: order.items.map((item, index) => ({
        id: `${order.id}-${index}`,
        title: item.title,
        quantity: item.quantity,
        unit_price: Number(item.unitPrice),
        currency_id: "BRL",
      })),

      // Libera todos os meios de pagamento (cartão de crédito/débito, PIX,
      // boleto e saldo em conta). Não usar purpose: "wallet_purchase" nem
      // payer.email, pois ambos forçam o login com conta Mercado Pago.
      payment_methods: {
        excluded_payment_methods: [],
        excluded_payment_types: [],
        installments: 12,
        default_installments: 1,
      },

      // Validade do pagamento por PIX.
      date_of_expiration: new Date(
        Date.now() + getPixExpirationMinutes() * 60 * 1000
      ).toISOString(),

      back_urls: {
        success: `${frontendUrl}/checkout/success`,
        failure: `${frontendUrl}/checkout/failure`,
        pending: `${frontendUrl}/checkout/pending`,
      },

      // Auto return só é habilitado quando a URL é pública.
      ...(isLocalFrontendUrl
        ? {}
        : {
            auto_return: "approved" as const,
          }),

      notification_url: `${backendUrl}/payments/webhook`,

      external_reference: String(order.id),
    },
  });

  if (!result.id || !result.init_point) {
    throw new Error(
      "Não foi possível criar a preferência de pagamento do Mercado Pago."
    );
  }

  // Salva a preferência no pedido.
  await setOrderPreference(order.id, result.id);

  // Registra o pagamento no banco.
  const { error } = await supabase.from("payments").insert({
    value: order.total,
    status: "pending",
    payment_method: "mercado_pago",
    id_orders: order.id,
    id_user: order.buyerId,
    mp_preference_id: result.id,
    creation_date: new Date().toISOString(),
  });

  if (error) {
    throw new Error(
      `Erro ao registrar pagamento: ${error.message}`
    );
  }

  return {
    preferenceId: result.id,
    initPoint: result.init_point,
  };
}

export async function processPaymentNotification(
  paymentId: string
) {
  const client = getMercadoPagoClient();
  const payment = new Payment(client);

  let result;

  try {
    result = await payment.get({
      id: paymentId,
    });
  } catch (error: any) {
    if (
      error?.status === 404 ||
      error?.cause?.status === 404 ||
      error?.error === "not_found"
    ) {
      console.warn(
        `Pagamento ${paymentId} não encontrado no Mercado Pago.`
      );

      return;
    }

    throw error;
  }
  const orderId = result.external_reference
    ? Number(result.external_reference)
    : null;

  const status = result.status ?? "pending";

  if (!orderId || !Number.isFinite(orderId)) {
    return;
  }

  // Atualiza os dados do pagamento.
  const { error: paymentUpdateError } = await supabase
    .from("payments")
    .update({
      status,
      mp_payment_id: String(result.id),
      // Registra o meio realmente usado: credit_card, debit_card,
      // bank_transfer (PIX), account_money...
      payment_method:
        result.payment_type_id ?? "mercado_pago",
      update_date: new Date().toISOString(),
    })
    .eq("id_orders", orderId);

  if (paymentUpdateError) {
    throw new Error(
      `Erro ao atualizar pagamento: ${paymentUpdateError.message}`
    );
  }

  const order = await getOrderById(orderId);

  if (
    !order ||
    order.status === "paid" ||
    order.status === "cancelled"
  ) {
    return;
  }

  // Pagamento aprovado.
  if (APPROVED_STATUSES.has(status)) {
    await updateOrderStatus(orderId, "paid");
    return;
  }

   // Pagamento recusado, cancelado ou estornado.
  if (FAILED_STATUSES.has(status)) {
    await updateOrderStatus(orderId, "cancelled");

    for (const item of order.items) {
      await restockProduct(
        item.productId,
        item.quantity
      ).catch((error) => {
        console.error(
          `Erro ao devolver estoque do produto ${item.productId}:`,
          error
        );
      });
    }
  }
}

export async function getPaymentStatusForOrder(
  orderId: Number
) {
  const { data, error } = await supabase
    .from("payments")
    .select(
      "status, value, payment_method, creation_date"
    )
    .eq("id_orders", orderId)
    .order("creation_date", {
      ascending: false,
    })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Erro ao consultar pagamento: ${error.message}`
    );
  }

  if (!data) {
    return null;
  }

  return {
    status: data.status as string,
    value: Number(data.value),
    method: data.payment_method as string,
  };
}