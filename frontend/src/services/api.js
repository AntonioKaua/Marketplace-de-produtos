const API_PREFIX = "/api";

export class ApiError extends Error {
  constructor(message, status, errors = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

export async function apiRequest(path, { body, ...options } = {}) {
  let response;
  const isFormData = body instanceof FormData;

  try {
    response = await fetch(`${API_PREFIX}${path}`, {
      ...options,
      credentials: "include",
      headers: body && !isFormData
        ? { "Content-Type": "application/json", ...options.headers }
        : options.headers,
      body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
    });
  } catch {
    throw new ApiError(
      "Não foi possível conectar à API. Verifique se o backend está em execução.",
      0,
    );
  }

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(
      payload.message || "Não foi possível concluir a solicitação.",
      response.status,
      payload.errors,
    );
  }

  return payload;
}

export function registerUserRequest(userData) {
  return apiRequest("/users", {
    method: "POST",
    body: userData,
  });
}

export function loginRequest(email, password) {
  return apiRequest("/users/login", {
    method: "POST",
    body: { email, password },
  });
}

export function getCurrentUserRequest() {
  return apiRequest("/users/me");
}

export function updateProfileRequest(data) {
  return apiRequest("/users/me", {
    method: "PATCH",
    body: data,
  });
}

export function logoutRequest() {
  return apiRequest("/users/logout", {
    method: "POST",
  });
}
