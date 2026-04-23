import { env } from "../config/env";

type FileResponse = {
  blob: Blob;
  fileName: string | null;
};

type RequestOptions = {
  body?: unknown;
  method?: "DELETE" | "GET" | "POST";
  responseType?: "blob" | "json";
  token?: string | null;
};

function getFileNameFromDisposition(contentDisposition: string | null) {
  if (!contentDisposition) {
    return null;
  }

  const utf8FileNameMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);

  if (utf8FileNameMatch?.[1]) {
    return decodeURIComponent(utf8FileNameMatch[1]);
  }

  const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/i);
  return fileNameMatch?.[1] ?? null;
}

async function apiRequest(path: string, options: RequestOptions = {}) {
  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    body: options.body ? JSON.stringify(options.body) : undefined,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {})
    },
    method: options.method || "GET"
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({ error: `Request failed: ${response.status}` }));
    throw new Error(errorPayload.error || `Request failed: ${response.status}`);
  }

  if (options.responseType === "blob") {
    const fileResponse: FileResponse = {
      blob: await response.blob(),
      fileName: getFileNameFromDisposition(response.headers.get("Content-Disposition"))
    };

    return fileResponse;
  }

  return response.json();
}

export function apiGet(path: string, token?: string | null) {
  return apiRequest(path, { method: "GET", token });
}

export function apiPost(path: string, body: unknown, token?: string | null) {
  return apiRequest(path, { body, method: "POST", token });
}

export function apiDelete(path: string, token?: string | null) {
  return apiRequest(path, { method: "DELETE", token });
}

export function apiGetFile(path: string, token?: string | null) {
  return apiRequest(path, { method: "GET", responseType: "blob", token });
}
