
import { apiRequest } from "./api";

// Lista os chamados do usuário autenticado.
export function getSupportTickets() {
    return apiRequest("/support/tickets");
}

// Cria um novo chamado.
export function createSupportTicket(data) {
    return apiRequest("/support/tickets", {
        method: "POST",
        body: data,
    });
}

// Consulta os dados de um chamado específico.
export function getSupportTicket(ticketId) {
    return apiRequest(`/support/tickets/${ticketId}`);
}

// Lista as mensagens de um chamado.
export function getSupportMessages(ticketId) {
    return apiRequest(`/support/tickets/${ticketId}/messages`);
}

// Envia uma mensagem em um chamado.
export function sendSupportMessage(ticketId, message) {
    return apiRequest(`/support/tickets/${ticketId}/messages`, {
        method: "POST",
        body: { message },
    });
}
