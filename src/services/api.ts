import { env } from "../config/env";

type RequestOptions = {
  body?: unknown;
  method?: "GET" | "POST";
  token?: string | null;
};

async function apiRequest(path: string, options: RequestOptions = {}) {
  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    body: options.body ? JSON.stringify(options.body) : undefined,
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {})
    },
    method: options.method || "GET"
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({ error: `Request failed: ${response.status}` }));
    throw new Error(errorPayload.error || `Request failed: ${response.status}`);
  }

  return response.json();
}

export function apiGet(path: string, token?: string | null) {
  return apiRequest(path, { method: "GET", token });
}

export function apiPost(path: string, body: unknown, token?: string | null) {
  return apiRequest(path, { body, method: "POST", token });
}
