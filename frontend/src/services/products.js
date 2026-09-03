import { apiRequest } from "./api";

export function listProductsRequest(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, value);
    }
  });

  const search = query.toString();
  return apiRequest(`/products${search ? `?${search}` : ""}`);
}

export function getProductRequest(id) {
  return apiRequest(`/products/${id}`);
}

export function getMyProductsRequest() {
  return apiRequest("/products/mine");
}

export function createProductRequest(data) {
  return apiRequest("/products", { method: "POST", body: data });
}

export function updateProductRequest(id, data) {
  return apiRequest(`/products/${id}`, { method: "PUT", body: data });
}

export function deleteProductRequest(id) {
  return apiRequest(`/products/${id}`, { method: "DELETE" });
}

export function uploadProductImagesRequest(id, files) {
  const formData = new FormData();
  Array.from(files).forEach(file => formData.append("images", file));

  return apiRequest(`/products/${id}/images`, { method: "POST", body: formData });
}

export function deleteProductImageRequest(id, imageId) {
  return apiRequest(`/products/${id}/images/${imageId}`, { method: "DELETE" });
}
