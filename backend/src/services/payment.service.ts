import { Payment, Preference } from "mercadopago";

import { getBackendUrl, getFrontendUrl, getMercadoPagoClient } from "../config/mercadopago.js";
import { supabase } from "../config/supabase.js";
import { getOrderById, setOrderPreference, updateOrderStatus } from "./order.service.js";
import { restockProduct } from "./product.service.js";

interface OrderForPreference {
  id: number;
  total: number;
  buyerId: number;
  items: { title: string; unitPrice: number; quantity: number }[];
}

export async function createPreferenceForOrder(order: OrderForPreference, buyerEmail: string) {
  const client = getMercadoPagoClient();
  const preference = new Preference(client);
  const frontendUrl = getFrontendUrl();
  const isLocalFrontendUrl = /^https?:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/i.test(frontendUrl);

  const result = await preference.create({
    body: {
      items: order.items.map(item => ({
        id: String(order.id),
        title: item.title,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        currency_id: "BRL",
      })),
      payer: { email: buyerEmail },
      back_urls: {
        success: `${frontendUrl}/checkout/success`,
        failure: `${frontendUrl}/checkout/failure`,
        pending: `${frontendUrl}/checkout/pending`,
      },
      // O Mercado Pago exige back_urls.success publicamente acessível para
      // usar auto_return; em FRONTEND_URL=localhost (dev) ele rejeita o
      // preference inteiro com "auto_return invalid", então só habilitamos
      // o redirecionamento automático quando a URL não é local.
      ...(isLocalFrontendUrl ? {} : { auto_return: "approved" as const }),
      notification_url: `${getBackendUrl()}/payments/webhook`,
      external_reference: String(order.id),
    },
  });

  if (!result.id || !result.init_point) {
    throw new Error("Não foi possível criar a preferência de pagamento.");
  }

  await setOrderPreference(order.id, result.id);

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
    throw new Error(error.message);
  }

  return { preferenceId: result.id, initPoint: result.init_point };
}

const APPROVED_STATUSES = new Set(["approved"]);
const FAILED_STATUSES = new Set(["rejected", "cancelled", "refunded", "charged_back"]);

export async function processPaymentNotification(paymentId: string) {
  const client = getMercadoPagoClient();
  const payment = new Payment(client);
  const result = await payment.get({ id: paymentId });

  const orderId = result.external_reference ? Number(result.external_reference) : null;
  const status = result.status ?? "pending";

  if (!orderId) {
    return;
  }

  const { error: paymentUpdateError } = await supabase
    .from("payments")
    .update({
      status,
      mp_payment_id: String(result.id),
      update_date: new Date().toISOString(),
    })
    .eq("id_orders", orderId);

  if (paymentUpdateError) {
    throw new Error(paymentUpdateError.message);
  }

  const order = await getOrderById(orderId);

  if (!order || order.status === "paid" || order.status === "cancelled") {
    return;
  }

  if (APPROVED_STATUSES.has(status)) {
    await updateOrderStatus(orderId, "paid");
  } else if (FAILED_STATUSES.has(status)) {
    await updateOrderStatus(orderId, "cancelled");
    for (const item of order.items) {
      await restockProduct(item.productId, item.quantity).catch(() => undefined);
    }
  }
}

export async function getPaymentStatusForOrder(orderId: number) {
  const { data, error } = await supabase
    .from("payments")
    .select("status, value, payment_method, creation_date")
    .eq("id_orders", orderId)
    .order("creation_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data
    ? {
        status: data.status as string,
        value: Number(data.value),
        method: data.payment_method as string,
      }
    : null;
}
