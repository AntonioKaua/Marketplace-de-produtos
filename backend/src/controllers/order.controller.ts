import { Request, Response } from "express";

import {
  createOrder,
  getOrderById,
  isOrderParticipant,
  listOrdersByBuyer,
  listOrdersBySeller,
  OrderError,
  OrderItemInput,
  ShippingInput,
} from "../services/order.service.js";
import { createPreferenceForOrder } from "../services/payment.service.js";

function parseOrderInput(body: unknown) {
  const input = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const errors: Record<string, string> = {};

  const rawItems = Array.isArray(input.items) ? input.items : [];
  const items: OrderItemInput[] = rawItems
    .map((item: any) => ({
      productId: Number(item?.productId),
      quantity: Number(item?.quantity),
    }))
    .filter(item => Number.isInteger(item.productId) && Number.isInteger(item.quantity) && item.quantity > 0);

  if (items.length === 0) {
    errors.items = "Adicione ao menos um produto ao pedido.";
  }

  const shippingInput = input.shipping && typeof input.shipping === "object"
    ? (input.shipping as Record<string, unknown>)
    : {};

  const cep = typeof shippingInput.cep === "string" ? shippingInput.cep.replace(/\D/g, "") : "";
  const address = typeof shippingInput.address === "string" ? shippingInput.address.trim() : "";
  const city = typeof shippingInput.city === "string" ? shippingInput.city.trim() : "";
  const state = typeof shippingInput.state === "string" ? shippingInput.state.trim().toUpperCase() : "";

  if (cep.length !== 8) {
    errors.cep = "Informe um CEP válido com 8 dígitos.";
  }

  if (address.length < 5 || address.length > 200) {
    errors.address = "Informe um endereço válido.";
  }

  if (city.length < 2 || city.length > 100) {
    errors.city = "Informe a cidade.";
  }

  if (state.length !== 2) {
    errors.state = "Informe a UF (2 letras).";
  }

  const shipping: ShippingInput = { cep, address, city, state };

  return { data: { items, shipping }, errors };
}

export async function postOrder(req: Request, res: Response) {
  try {
    const { data, errors } = parseOrderInput(req.body);

    if (Object.keys(errors).length > 0) {
      return res.status(422).json({ success: false, message: "Verifique os dados informados.", errors });
    }

    const order = await createOrder(res.locals.auth.userId, data.items, data.shipping);
    const fullOrder = await getOrderById(order.id);

    const { initPoint } = await createPreferenceForOrder(
      { id: order.id, total: order.total, buyerId: res.locals.auth.userId, items: fullOrder!.items },
      res.locals.auth.email,
    );

    return res.status(201).json({ success: true, order, initPoint });
  } catch (error) {
    if (error instanceof OrderError) {
      return res.status(error.status).json({ success: false, message: error.message, field: error.field });
    }

    console.error("Erro ao criar pedido:", error);
    return res.status(500).json({ success: false, message: "Erro interno ao criar pedido." });
  }
}

export async function postOrderCheckout(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({ success: false, message: "Pedido inválido." });
    }

    const order = await getOrderById(id);

    if (!order || order.buyerId !== res.locals.auth.userId) {
      return res.status(404).json({ success: false, message: "Pedido não encontrado." });
    }

    if (order.status !== "pending") {
      return res.status(409).json({ success: false, message: "Este pedido não está mais pendente de pagamento." });
    }

    const { initPoint } = await createPreferenceForOrder(
      { id: order.id, total: order.total, buyerId: res.locals.auth.userId, items: order.items },
      res.locals.auth.email,
    );

    return res.status(200).json({ success: true, initPoint });
  } catch (error) {
    console.error("Erro ao gerar novo link de pagamento:", error);
    return res.status(500).json({ success: false, message: "Erro interno ao gerar novo link de pagamento." });
  }
}

export async function getMyOrders(_req: Request, res: Response) {
  try {
    const orders = await listOrdersByBuyer(res.locals.auth.userId);
    return res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Erro ao listar pedidos:", error);
    return res.status(500).json({ success: false, message: "Erro interno ao listar pedidos." });
  }
}

export async function getSellingOrders(_req: Request, res: Response) {
  try {
    const orders = await listOrdersBySeller(res.locals.auth.userId);
    return res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Erro ao listar vendas:", error);
    return res.status(500).json({ success: false, message: "Erro interno ao listar vendas." });
  }
}

export async function getOrder(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({ success: false, message: "Pedido inválido." });
    }

    const order = await getOrderById(id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Pedido não encontrado." });
    }

    const allowed =
      res.locals.auth.role === "admin" ||
      (await isOrderParticipant(order, res.locals.auth.userId));

    if (!allowed) {
      return res.status(403).json({ success: false, message: "Você não tem acesso a este pedido." });
    }

    return res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Erro ao buscar pedido:", error);
    return res.status(500).json({ success: false, message: "Erro interno ao buscar pedido." });
  }
}
