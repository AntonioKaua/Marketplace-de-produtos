import { apiRequest } from "./api";

export function listFavoritesRequest() {
  return apiRequest("/favorites");
}

export function getFavoriteStatusRequest(productId) {
  return apiRequest(`/favorites/${productId}`);
}

export function addFavoriteRequest(productId) {
  return apiRequest(`/favorites/${productId}`, { method: "POST" });
}

export function removeFavoriteRequest(productId) {
  return apiRequest(`/favorites/${productId}`, { method: "DELETE" });
}
