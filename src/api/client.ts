import { buildApiUrl } from "../utils/urls";

type Primitive = string | number | boolean;
type QueryValue = Primitive | null | undefined;

type ApiRequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  token?: string | null;
  body?: BodyInit | FormData | Record<string, unknown> | null;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  query?: Record<string, QueryValue>;
};

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

const isFormData = (body: ApiRequestOptions["body"]): body is FormData =>
  typeof FormData !== "undefined" && body instanceof FormData;

const isBodyInit = (body: ApiRequestOptions["body"]): body is BodyInit =>
  typeof body === "string" ||
  body instanceof Blob ||
  body instanceof URLSearchParams ||
  body instanceof ArrayBuffer;

const buildQuery = (path: string, query?: Record<string, QueryValue>) => {
  if (!query) return path;
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value === null || value === undefined || value === "") return;
    params.set(key, String(value));
  });
  const serialized = params.toString();
  if (!serialized) return path;
  return `${path}${path.includes("?") ? "&" : "?"}${serialized}`;
};

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { method = "GET", token, body, headers = {}, signal, query } = options;

  const requestHeaders: HeadersInit = { ...headers };
  let requestBody: BodyInit | undefined;

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  if (body !== undefined && body !== null) {
    if (isFormData(body) || isBodyInit(body)) {
      requestBody = body;
    } else {
      requestHeaders["Content-Type"] = "application/json";
      requestBody = JSON.stringify(body);
    }
  }

  const response = await fetch(buildApiUrl(buildQuery(path, query)), {
    method,
    headers: requestHeaders,
    body: requestBody,
    signal,
  });

  // Fire a global event on 401 — SessionListener handles cleanup & redirect
  if (response.status === 401) {
    window.dispatchEvent(new CustomEvent("api:unauthorized"));
  }

  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const payload = isJson
    ? await response.json().catch(() => null)
    : await response.text().catch(() => "");

  if (!response.ok) {
    const message =
      (typeof payload === "object" &&
        payload !== null &&
        "error" in payload &&
        typeof payload.error === "string" &&
        payload.error) ||
      (response.status === 429
        ? "Muitas tentativas. Aguarde antes de tentar novamente."
        : "") ||
      `Erro ${response.status}`;

    throw new ApiError(message, response.status, payload);
  }

  return payload as T;
}

export const apiGet = <T>(
  path: string,
  options?: Omit<ApiRequestOptions, "method" | "body">,
) => apiRequest<T>(path, { ...options, method: "GET" });

export const apiPost = <T>(
  path: string,
  body?: ApiRequestOptions["body"],
  options?: Omit<ApiRequestOptions, "method" | "body">,
) => apiRequest<T>(path, { ...options, method: "POST", body });

export const apiPut = <T>(
  path: string,
  body?: ApiRequestOptions["body"],
  options?: Omit<ApiRequestOptions, "method" | "body">,
) => apiRequest<T>(path, { ...options, method: "PUT", body });

export const apiDelete = <T>(
  path: string,
  options?: Omit<ApiRequestOptions, "method">,
) => apiRequest<T>(path, { ...options, method: "DELETE" });
