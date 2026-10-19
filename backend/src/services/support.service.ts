import { supabase } from "../config/supabase.js";

export async function createTicket(
    userId: number,
    subject: string,
    category: string,
    initialMessage: string,
) {
    const { data: ticket, error: ticketError } = await supabase
        .from("support_tickets")
        .insert({
            id_user: userId,
            subject,
            category,
            status: "aberto",
        })
        .select(
            "id_ticket, id_user, subject, category, status, created_at, update_at",
        )
        .single();

    if (ticketError) {
        throw new Error(ticketError.message);
    }

    const { data: message, error: messageError } = await supabase
        .from("support_messages")
        .insert({
            id_ticket: ticket.id_ticket,
            id_user: userId,
            message: initialMessage,
        })
        .select("id_message, id_ticket, id_user, message, created_at")
        .single();

    if (messageError) {
        throw new Error(messageError.message);
    }

    return {
        ticket: {
            id: ticket.id_ticket,
            userId: ticket.id_user,
            subject: ticket.subject,
            category: ticket.category,
            status: ticket.status,
            createdAt: ticket.created_at,
            updateAt: ticket.update_at, 
        },

        message: {
            id: message.id_message,
            ticketId: message.id_ticket,
            userId: message.id_user,
            message: message.message,
            createdAt: message.created_at,
        },
    };
}

export async function listTickets(userId: number) {
    const { data, error } = await supabase
        .from("support_tickets")
        .select(
            "id_ticket, id_user, subject, category, status, created_at, update_at",
        )
        .eq("id_user", userId)
        .order("update_at", { ascending: false });

    if (error) {
        throw new Error(error.message);
    }

    return (data ?? []).map((ticket) => ({
        id: ticket.id_ticket,
        userId: ticket.id_user,
        subject: ticket.subject,
        category: ticket.category,
        status: ticket.status,
        createdAt: ticket.created_at,
        updatedAt: ticket.update_at,
    }));
}

export async function getTicketById(ticketId: number) {
    const { data, error } = await supabase
        .from("support_tickets")
        .select(
            "id_ticket, id_user, subject, category, status, created_at, update_at",
        )
        .eq("id_ticket", ticketId)
        .maybeSingle();

    if (error) {
        throw new Error(error.message);
    }

    if (!data) {
        return null;
    }

    return {
        id: data.id_ticket,
        userId: data.id_user,
        subject: data.subject,
        category: data.category,
        status: data.status,
        createdAt: data.created_at,
        updatedAt: data.update_at,
    };
}

export async function listTicketMessages(ticketId: number) {
    const { data, error } = await supabase
        .from("support_messages")
        .select("id_message, id_ticket, id_user, message, created_at")
        .eq("id_ticket", ticketId)
        .order("created_at", { ascending: true });

    if (error) {
        throw new Error(error.message);
    }

    return (data ?? []).map((message) => ({
        id: message.id_message,
        ticketId: message.id_ticket,
        userId: message.id_user,
        message: message.message,
        createdAt: message.created_at,
    }));
}

export async function createTicketMessage(
    ticketId: number,
    userId: number,
    message: string,
) {
    const { data, error } = await supabase
        .from("support_messages")
        .insert({
            id_ticket: ticketId,
            id_user: userId,
            message,
        })
        .select("id_message, id_ticket, id_user, message, created_at")
        .single();

    if (error) {
        throw new Error(error.message);
    }

    const { error: updateError } = await supabase
        .from("support_tickets")
        .update({
            update_at: new Date().toISOString(),
        })
        .eq("id_ticket", ticketId);

    if (updateError) {
        throw new Error(updateError.message);
    }

    return {
        id: data.id_message,
        ticketId: data.id_ticket,
        userId: data.id_user,
        message: data.message,
        createdAt: data.created_at,
    };
}
