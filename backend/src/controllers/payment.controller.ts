import { createHmac } from "node:crypto";
import { Request, Response } from "express";

import { getOrderById, isOrderParticipant } from "../services/order.service.js";
import { getPaymentStatusForOrder, processPaymentNotification } from "../services/payment.service.js";

function isSignatureValid(req: Request, dataId: string) {
  const secret = process.env.MP_WEBHOOK_SECRET;

  if (!secret) {
    return true;
  }

  const signatureHeader = req.header("x-signature");
  const requestId = req.header("x-request-id");

  if (!signatureHeader || !requestId) {
    return false;
  }

  const parts = Object.fromEntries(
    signatureHeader.split(",").map(part => {
      const [key, value] = part.split("=");
      return [key?.trim(), value?.trim()];
    }),
  );

  const ts = parts.ts;
  const v1 = parts.v1;

  if (!ts || !v1) {
    return false;
  }

  const manifest = `id:${dataId.toLowerCase()};request-id:${requestId};ts:${ts};`;
  const expected = createHmac("sha256", secret).update(manifest).digest("hex");

  return expected === v1;
}

export async function postWebhook(req: Request, res: Response) {
  try {
    const body = req.body ?? {};
    const type = body.type ?? req.query.type ?? req.query.topic;
    const dataId = body.data?.id ?? req.query["data.id"] ?? req.query.id;

    if (type !== "payment" || !dataId) {
      return res.status(200).json({ success: true });
    }

    if (!isSignatureValid(req, String(dataId))) {
      console.warn("Assinatura de webhook do Mercado Pago inválida.");
      return res.status(401).json({ success: false });
    }

    await processPaymentNotification(String(dataId));

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Erro ao processar webhook do Mercado Pago:", error);
    return res.status(200).json({ success: false });
  }
}

export async function getOrderPaymentStatus(req: Request, res: Response) {
  try {
    const orderId = Number(req.params.orderId);

    if (!Number.isInteger(orderId)) {
      return res.status(400).json({ success: false, message: "Pedido inválido." });
    }

    const order = await getOrderById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: "Pedido não encontrado." });
    }

    const allowed =
      res.locals.auth.role === "admin" || (await isOrderParticipant(order, res.locals.auth.userId));

    if (!allowed) {
      return res.status(403).json({ success: false, message: "Você não tem acesso a este pedido." });
    }

    const payment = await getPaymentStatusForOrder(orderId);

    return res.status(200).json({ success: true, orderStatus: order.status, payment });
  } catch (error) {
    console.error("Erro ao consultar status do pagamento:", error);
    return res.status(500).json({ success: false, message: "Erro interno ao consultar status do pagamento." });
  }
}
