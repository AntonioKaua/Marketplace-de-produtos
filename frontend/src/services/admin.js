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
