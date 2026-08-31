const API_PREFIX = "/api";

export class ApiError extends Error {
  constructor(message, status, errors = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

async function apiRequest(path, { body, ...options } = {}) {
  let response;

  try {
    response = await fetch(`${API_PREFIX}${path}`, {
      ...options,
      credentials: "include",
      headers: body
        ? { "Content-Type": "application/json", ...options.headers }
        : options.headers,
      body: body ? JSON.stringify(body) : undefined,
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

export function logoutRequest() {
  return apiRequest("/users/logout", {
    method: "POST",
  });
}
