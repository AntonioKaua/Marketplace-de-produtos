import { apiRequest } from "./api";

export function listAdminUsersRequest() {
  return apiRequest("/admin/users");
}

export function updateUserRoleRequest(id, role) {
  return apiRequest(`/admin/users/${id}/role`, { method: "PATCH", body: { role } });
}

export function deleteUserRequest(id) {
  return apiRequest(`/admin/users/${id}`, { method: "DELETE" });
}

export function listAdminProductsRequest() {
  return apiRequest("/admin/products");
}

export function deleteAdminProductRequest(id) {
  return apiRequest(`/admin/products/${id}`, { method: "DELETE" });
}


// Lista todos os chamados recebidos pela equipe.
export function listAdminSupportTicketsRequest() {
  return apiRequest("/admin/support/tickets");
}

// Busca as mensagens de um chamado.
export function getAdminSupportMessagesRequest(ticketId) {
  return apiRequest(`/admin/support/tickets/${ticketId}/messages`);
}

// Envia uma resposta ao cliente.
export function sendAdminSupportMessageRequest(ticketId, message) {
  return apiRequest(`/admin/support/tickets/${ticketId}/messages`, {
    method: "POST",
    body: { message },
  });
}

// Atualiza o status do atendimento.
export function updateAdminSupportStatusRequest(ticketId, status) {
  return apiRequest(`/admin/support/tickets/${ticketId}/status`, {
    method: "PATCH",
    body: { status },
  });
}
