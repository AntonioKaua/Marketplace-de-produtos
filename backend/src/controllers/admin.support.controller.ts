
import { Request, Response } from "express";

import {
    createTicketMessage,
    getTicketById,
    listAllTickets,
    listTicketMessages,
    updateTicketStatus,
} from "../services/support.service.js";

export async function getAdminTickets(_req: Request, res: Response) {
    try {
        const tickets = await listAllTickets();

        return res.status(200).json({
            success: true,
            tickets,
        });
    } catch (error) {
        console.error("Erro ao listar chamados administrativos:", error);

        return res.status(500).json({
            success: false,
            message: "Erro ao listar chamados.",
        });
    }
}

export async function getAdminTicketMessages(req: Request, res: Response) {
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

        const messages = await listTicketMessages(ticketId);

        return res.status(200).json({
            success: true,
            ticket,
            messages,
        });
    } catch (error) {
        console.error("Erro ao consultar mensagens administrativas:", error);

        return res.status(500).json({
            success: false,
            message: "Erro ao consultar mensagens.",
        });
    }
}

export async function postAdminTicketMessage(req: Request, res: Response) {
    try {
        const ticketId = Number(req.params.id);
        const content =
            typeof req.body?.message === "string"
                ? req.body.message.trim()
                : "";

        if (!Number.isInteger(ticketId) || ticketId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Atendimento inválido.",
            });
        }

        if (content.length === 0 || content.length > 2000) {
            return res.status(422).json({
                success: false,
                message: "Mensagem inválida.",
            });
        }

        const ticket = await getTicketById(ticketId);

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: "Atendimento não encontrado.",
            });
        }

        if (ticket.status === "resolvido") {
            return res.status(422).json({
                success: false,
                message: "Este atendimento já foi resolvido.",
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
        console.error("Erro ao responder chamado:", error);

        return res.status(500).json({
            success: false,
            message: "Erro ao enviar resposta.",
        });
    }
}

export async function patchAdminTicketStatus(req: Request, res: Response) {
    try {
        const ticketId = Number(req.params.id);
        const status = req.body?.status;

        if (!Number.isInteger(ticketId) || ticketId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Atendimento inválido.",
            });
        }

        if (!["aberto", "em_andamento", "resolvido"].includes(status)) {
            return res.status(422).json({
                success: false,
                message: "Status inválido.",
            });
        }

        const ticket = await updateTicketStatus(ticketId, status);

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: "Atendimento não encontrado.",
            });
        }

        return res.status(200).json({
            success: true,
            ticket,
        });
    } catch (error) {
        console.error("Erro ao atualizar status do chamado:", error);

        return res.status(500).json({
            success: false,
            message: "Erro ao atualizar status.",
        });
    }
}
