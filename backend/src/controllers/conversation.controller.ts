import { Request, Response } from "express";

import {
  findOrCreateConversation,
  getConversationById,
  listConversations,
} from "../services/conversation.service.js";
import { createMessage, listMessages } from "../services/message.service.js";

async function assertParticipant(res: Response, conversationId: number) {
  const conversation = await getConversationById(conversationId);

  if (!conversation) {
    res.status(404).json({ success: false, message: "Conversa não encontrada." });
    return null;
  }

  const userId = res.locals.auth.userId;

  if (conversation.buyerId !== userId && conversation.sellerId !== userId) {
    res.status(403).json({ success: false, message: "Você não tem acesso a esta conversa." });
    return null;
  }

  return conversation;
}

export async function postConversation(req: Request, res: Response) {
  try {
    const sellerId = Number(req.body?.sellerId);
    const productId = req.body?.productId ? Number(req.body.productId) : null;
    const buyerId = res.locals.auth.userId;

    if (!Number.isInteger(sellerId)) {
      return res.status(400).json({ success: false, message: "Vendedor inválido." });
    }

    if (sellerId === buyerId) {
      return res.status(422).json({ success: false, message: "Você não pode iniciar uma conversa consigo mesmo." });
    }

    const conversationId = await findOrCreateConversation(buyerId, sellerId, productId);

    return res.status(201).json({ success: true, conversationId });
  } catch (error) {
    console.error("Erro ao iniciar conversa:", error);
    return res.status(500).json({ success: false, message: "Erro interno ao iniciar conversa." });
  }
}

export async function getConversations(_req: Request, res: Response) {
  try {
    const conversations = await listConversations(res.locals.auth.userId);
    return res.status(200).json({ success: true, conversations });
  } catch (error) {
    console.error("Erro ao listar conversas:", error);
    return res.status(500).json({ success: false, message: "Erro interno ao listar conversas." });
  }
}

export async function getMessages(req: Request, res: Response) {
  try {
    const conversationId = Number(req.params.id);

    if (!Number.isInteger(conversationId)) {
      return res.status(400).json({ success: false, message: "Conversa inválida." });
    }

    if (!(await assertParticipant(res, conversationId))) return;

    const messages = await listMessages(conversationId);
    return res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error("Erro ao listar mensagens:", error);
    return res.status(500).json({ success: false, message: "Erro interno ao listar mensagens." });
  }
}

export async function postMessage(req: Request, res: Response) {
  try {
    const conversationId = Number(req.params.id);

    if (!Number.isInteger(conversationId)) {
      return res.status(400).json({ success: false, message: "Conversa inválida." });
    }

    if (!(await assertParticipant(res, conversationId))) return;

    const content = typeof req.body?.content === "string" ? req.body.content.trim() : "";

    if (content.length === 0 || content.length > 2000) {
      return res.status(422).json({ success: false, message: "Mensagem inválida." });
    }

    const message = await createMessage(conversationId, res.locals.auth.userId, content);
    return res.status(201).json({ success: true, message });
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error);
    return res.status(500).json({ success: false, message: "Erro interno ao enviar mensagem." });
  }
}
