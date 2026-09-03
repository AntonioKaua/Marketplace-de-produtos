import { apiRequest } from "./api";

export function listConversationsRequest() {
  return apiRequest("/conversations");
}

export function startConversationRequest({ sellerId, productId }) {
  return apiRequest("/conversations", { method: "POST", body: { sellerId, productId } });
}

export function listMessagesRequest(conversationId) {
  return apiRequest(`/conversations/${conversationId}/messages`);
}

export function sendMessageRequest(conversationId, content) {
  return apiRequest(`/conversations/${conversationId}/messages`, {
    method: "POST",
    body: { content },
  });
}
