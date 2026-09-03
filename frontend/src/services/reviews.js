import { apiRequest } from "./api";

export function listProductReviewsRequest(productId) {
  return apiRequest(`/products/${productId}/reviews`);
}

export function createProductReviewRequest(productId, data) {
  return apiRequest(`/products/${productId}/reviews`, { method: "POST", body: data });
}

export function listSellerReviewsRequest(sellerId) {
  return apiRequest(`/sellers/${sellerId}/reviews`);
}

export function createSellerReviewRequest(sellerId, data) {
  return apiRequest(`/sellers/${sellerId}/reviews`, { method: "POST", body: data });
}

export function getSellerRequest(sellerId) {
  return apiRequest(`/sellers/${sellerId}`);
}
