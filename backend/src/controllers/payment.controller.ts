
import { createHmac, timingSafeEqual } from "node:crypto";
import { Request, Response } from "express";

import { getOrderById, isOrderParticipant } from "../services/order.service.js";
import {
  getPaymentStatusForOrder,
  processPaymentNotification,
} from "../services/payment.service.js";

// Valida a assinatura HMAC enviada pelo Mercado Pago.
function getSignatureError(req: Request, dataId: string): string | null {
  const secret = process.env.MP_WEBHOOK_SECRET;

  // Em produção, nunca aceitar notificações sem o segredo.
  if (!secret) {
    return "secret_missing";
  }

  const signatureHeader = req.header("x-signature");
  const requestId = req.header("x-request-id");

  if (!signatureHeader) return "x_signature_missing";
  if (!requestId) return "x_request_id_missing";

  const parts = Object.fromEntries(
    signatureHeader.split(",").map((part) => {
      const [key, ...values] = part.split("=");
      return [key?.trim(), values.join("=").trim()];
    }),
  );

  const ts = parts.ts;
  const v1 = parts.v1;

  if (!ts || !v1 || !/^[a-f0-9]{64}$/i.test(v1)) {
    return "signature_format_invalid";
  }

  const manifest = `id:${dataId.toLowerCase()};request-id:${requestId};ts:${ts};`;

  const expected = createHmac("sha256", secret)
    .update(manifest)
    .digest();

  const received = Buffer.from(v1, "hex");

  if (received.length !== expected.length) {
    return "signature_length_invalid";
  }

  return timingSafeEqual(expected, received) ? null : "hmac_mismatch";
}

// Endpoint chamado pelo Mercado Pago.
export async function postWebhook(req: Request, res: Response) {
  try {
    const body = req.body ?? {};

    const type = String(
      body.type ?? req.query.type ?? req.query.topic ?? "",
    );

    // Outros eventos não relacionados a pagamentos são ignorados.
    if (type !== "payment") {
      return res.status(200).json({ success: true });
    }

    const rawDataId =
      req.query["data.id"] ??
      body.data?.id ??
      req.query.id;

    if (!rawDataId || Array.isArray(rawDataId)) {
      return res.status(400).json({
        success: false,
        message: "Identificador do pagamento ausente ou inválido.",
      });
    }

    const dataId = String(rawDataId);

    const signatureError = getSignatureError(req, dataId);
    if (signatureError) {
      // Registra somente diagnóstico estrutural: nunca segredo, assinatura,
      // corpo completo ou identificadores de pagamentos/clientes.
      console.warn("Assinatura do webhook do Mercado Pago inválida.", {
        reason: signatureError,
        hasQueryDataId: typeof req.query["data.id"] === "string",
        hasLegacyQueryId: typeof req.query.id === "string",
        hasLegacyTopic: typeof req.query.topic === "string",
        hasBodyDataId: body.data?.id != null,
        queryBodyIdMatches:
          req.query["data.id"] != null && body.data?.id != null
            ? String(req.query["data.id"]) === String(body.data.id)
            : null,
      });

      return res.status(401).json({
        success: false,
        message: "Assinatura inválida.",
      });
    }

    await processPaymentNotification(dataId);

    return res.status(200).json({ success: true });
  
  } catch (error) {
    console.error("Erro ao processar webhook do Mercado Pago:", error);

    // Retorna 500 para permitir nova tentativa da notificação.
    return res.status(500).json({
      success: false,
      message: "Falha ao processar notificação.",
    });
  }

}

// Consulta o status do pagamento para participantes do pedido.
export async function getOrderPaymentStatus(req: Request, res: Response) {
  try {
    const orderId = Number(req.params.orderId);

    if (!Number.isInteger(orderId) || orderId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Pedido inválido.",
      });
    }

    const order = await getOrderById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Pedido não encontrado.",
      });
    }

    const allowed =
      res.locals.auth.role === "admin" ||
      (await isOrderParticipant(order, res.locals.auth.userId));

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: "Você não tem acesso a este pedido.",
      });
    }

    const payment = await getPaymentStatusForOrder(orderId);

    return res.status(200).json({
      success: true,
      orderStatus: order.status,
      payment,
    });
  } catch (error) {
    console.error("Erro ao consultar status do pagamento:", error);

    return res.status(500).json({
      success: false,
      message: "Erro interno ao consultar status do pagamento.",
    });
  }
}
