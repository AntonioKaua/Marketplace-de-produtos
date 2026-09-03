import { apiRequest } from "./api";

export function listCategoriesRequest() {
  return apiRequest("/categories");
}

export function createCategoryRequest(data) {
  return apiRequest("/categories", { method: "POST", body: data });
}

export function updateCategoryRequest(id, data) {
  return apiRequest(`/categories/${id}`, { method: "PUT", body: data });
}

export function deleteCategoryRequest(id) {
  return apiRequest(`/categories/${id}`, { method: "DELETE" });
}
