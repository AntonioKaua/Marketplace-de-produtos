import { apiRequest } from "./api";

export function createOrderRequest(data) {
  return apiRequest("/orders", { method: "POST", body: data });
}

export function retryOrderCheckoutRequest(orderId) {
  return apiRequest(`/orders/${orderId}/checkout`, { method: "POST" });
}

export function listMyOrdersRequest() {
  return apiRequest("/orders/mine");
}

export function listSellingOrdersRequest() {
  return apiRequest("/orders/selling");
}

export function getOrderRequest(orderId) {
  return apiRequest(`/orders/${orderId}`);
}

export function getOrderPaymentStatusRequest(orderId) {
  return apiRequest(`/payments/order/${orderId}`);
}
