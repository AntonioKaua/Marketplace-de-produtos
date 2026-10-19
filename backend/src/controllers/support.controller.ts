
import { Request, Response } from "express";

import {
    createTicket,
    createTicketMessage,
    getTicketById,
    listTicketMessages,
    listTickets,
} from "../services/support.service.js";

export async function postTicket(req: Request, res: Response) {
    try {
        const userId = res.locals.auth.userId;

        const subject =
            typeof req.body?.subject === "string"
                ? req.body.subject.trim()
                : "";

        const category =
            typeof req.body?.category === "string"
                ? req.body.category.trim()
                : "";

        const initialMessage =
            typeof req.body?.message === "string"
                ? req.body.message.trim()
                : "";

        if (subject.length === 0 || subject.length > 150) {
            return res.status(422).json({
                success: false,
                message: "Assunto inválido.",
            });
        }

        if (category.length === 0 || category.length > 50) {
            return res.status(422).json({
                success: false,
                message: "Categoria inválida.",
            });
        }

        if (initialMessage.length === 0 || initialMessage.length > 2000) {
            return res.status(422).json({
                success: false,
                message: "Mensagem inválida.",
            });
        }

        const result = await createTicket(
            userId,
            subject,
            category,
            initialMessage,
        );

        return res.status(201).json({
            success: true,
            ...result,
        });
    } catch (error) {
        console.error("Erro ao criar atendimento:", error);

        return res.status(500).json({
            success: false,
            message: "Erro interno ao criar atendimento.",
        });
    }
}

export async function getTickets(_req: Request, res: Response) {
    try {
        const userId = res.locals.auth.userId;

        const tickets = await listTickets(userId);

        return res.status(200).json({
            success: true,
            tickets,
        });
    } catch (error) {
        console.error("Erro ao listar atendimentos:", error);

        return res.status(500).json({
            success: false,
            message: "Erro interno ao listar atendimentos.",
        });
    }
}

export async function getTicket(req: Request, res: Response) {
    try {
        const ticketId = Number(req.params.id);

        if (!Number.isInteger(ticketId) || ticketId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Atendimento inválido.",
            });
        }

        const ticket = await getTicketById(ticketId);

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: "Atendimento não encontrado.",
            });
        }

        if (ticket.userId !== res.locals.auth.userId) {
            return res.status(403).json({
                success: false,
                message: "Você não tem acesso a este atendimento.",
            });
        }

        return res.status(200).json({
            success: true,
            ticket,
        });
    } catch (error) {
        console.error("Erro ao consultar atendimento:", error);

        return res.status(500).json({
            success: false,
            message: "Erro interno ao consultar atendimento.",
        });
    }
}

export async function getTicketMessages(
    req: Request,
    res: Response,
) {
    try {
        const ticketId = Number(req.params.id);

        if (!Number.isInteger(ticketId) || ticketId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Atendimento inválido.",
            });
        }

        const ticket = await getTicketById(ticketId);

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: "Atendimento não encontrado.",
            });
        }

        if (ticket.userId !== res.locals.auth.userId) {
            return res.status(403).json({
                success: false,
                message: "Você não tem acesso a este atendimento.",
            });
        }

        const messages = await listTicketMessages(ticketId);

        return res.status(200).json({
            success: true,
            messages,
        });
    } catch (error) {
        console.error("Erro ao listar mensagens:", error);

        return res.status(500).json({
            success: false,
            message: "Erro interno ao listar mensagens.",
        });
    }
}

export async function postTicketMessage(
    req: Request,
    res: Response,
) {
    try {
        const ticketId = Number(req.params.id);

        if (!Number.isInteger(ticketId) || ticketId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Atendimento inválido.",
            });
        }

        const ticket = await getTicketById(ticketId);

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: "Atendimento não encontrado.",
            });
        }

        if (ticket.userId !== res.locals.auth.userId) {
            return res.status(403).json({
                success: false,
                message: "Você não tem acesso a este atendimento.",
            });
        }

        if (ticket.status === "resolvido") {
            return res.status(422).json({
                success: false,
                message: "Este atendimento já foi resolvido.",
            });
        }

        const content =
            typeof req.body?.message === "string"
                ? req.body.message.trim()
                : "";

        if (content.length === 0 || content.length > 2000) {
            return res.status(422).json({
                success: false,
                message: "Mensagem inválida.",
            });
        }

        const message = await createTicketMessage(
            ticketId,
            res.locals.auth.userId,
            content,
        );

        return res.status(201).json({
            success: true,
            message,
        });
    } catch (error) {
        console.error("Erro ao enviar mensagem:", error);

        return res.status(500).json({
            success: false,
            message: "Erro interno ao enviar mensagem.",
        });
    }
}
