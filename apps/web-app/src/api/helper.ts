import { baseUrl } from "@/constants/api";
import { enqueueMutation } from "@/lib/offlineQueue";
import type { HttpMethod } from "@/lib/offlineQueue";
import type { ApiResponse } from "./shared/types";

type RequestOptions = RequestInit & {
  params?: Record<string, string>;
};

let inMemoryToken: string | null = null;
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const OFFLINE_QUEUE_EXCLUDED_PREFIXES = [
  "/auth/login",
  "/auth/register",
  "/auth/refresh",
  "/auth/logout",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/verify-email",
  "/auth/resend-otp",
  "/auth/google",
];

export function setInMemoryToken(token: string | null) {
  inMemoryToken = token;
}

export function getInMemoryToken() {
  return inMemoryToken;
}

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onRrefreshed(token: string) {
  refreshSubscribers.map((cb) => cb(token));
  refreshSubscribers = [];
}

function isExcludedFromOfflineQueue(endpoint: string): boolean {
  return OFFLINE_QUEUE_EXCLUDED_PREFIXES.some((prefix) =>
    endpoint.startsWith(prefix),
  );
}

function shouldQueueOffline(method: string | undefined, endpoint: string): boolean {
  if (!method || method === "GET" || method === "HEAD") return false;
  if (isExcludedFromOfflineQueue(endpoint)) return false;
  return true;
}

function isNetworkFailure(error: unknown): boolean {
  return error instanceof TypeError;
}

function parseRequestBody(body: BodyInit | null | undefined): object | undefined {
  if (!body || typeof body !== "string") return undefined;
  try {
    return JSON.parse(body) as object;
  } catch {
    return undefined;
  }
}

async function queueOfflineRequest(
  endpoint: string,
  options: RequestOptions,
): Promise<Response> {
  await enqueueMutation({
    method: options.method as HttpMethod,
    path: endpoint,
    body: parseRequestBody(options.body),
  });

  return new Response(
    JSON.stringify({ success: true, queued: true, message: "Saved offline" }),
    { status: 202, headers: { "Content-Type": "application/json" } },
  );
}

export async function apiRequest(
  endpoint: string,
  options: RequestOptions = {},
): Promise<Response> {
  const { params, headers, ...rest } = options;

  let url = `${baseUrl}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  const token = inMemoryToken;

  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };

  const config: RequestInit = {
    ...rest,
    headers: defaultHeaders,
    credentials: "include",
  };

  if (!navigator.onLine && shouldQueueOffline(options.method, endpoint)) {
    return queueOfflineRequest(endpoint, options);
  }

  let response: Response;

  try {
    response = await fetch(url, config);
  } catch (error) {
    if (shouldQueueOffline(options.method, endpoint) && isNetworkFailure(error)) {
      return queueOfflineRequest(endpoint, options);
    }
    throw error;
  }

  if (response.status === 401) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refreshResponse = await fetch(`${baseUrl}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          });

          if (refreshResponse.ok) {
            const data = await refreshResponse.json();
            const newToken = data.accessToken ?? data.data?.accessToken;

            setInMemoryToken(newToken);

            onRrefreshed(newToken);
            isRefreshing = false;

            const retryHeaders = {
              ...defaultHeaders,
              Authorization: `Bearer ${newToken}`,
            };
            return fetch(url, { ...config, headers: retryHeaders });
          } else {
            isRefreshing = false;
            setInMemoryToken(null);
            return response;
          }
        } catch {
          isRefreshing = false;
          return response;
        }
      }

      return new Promise<Response>((resolve) => {
        subscribeTokenRefresh((newToken) => {
          const retryHeaders = {
            ...defaultHeaders,
            Authorization: `Bearer ${newToken}`,
          };
          resolve(fetch(url, { ...config, headers: retryHeaders }));
        });
      });
  }

  return response;
}

// ── Typed CRUD helpers ────────────────────────────────────────────────────────

function unwrapEnvelope<T>(json: unknown): T {
  if (json !== null && typeof json === "object" && "data" in json) {
    return (json as { data: T }).data;
  }
  return json as T;
}

function parseApiJson<T>(json: Record<string, unknown>): ApiResponse<T> {
  if (json.queued === true) {
    return { success: true, queued: true, status: 202 };
  }
  return {
    success: true,
    data: unwrapEnvelope<T>(json),
    meta: json.meta as ApiResponse<T>["meta"],
  };
}

export async function apiGet<T>(path: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
  try {
    const res = await apiRequest(path, params ? { params } : {});
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || `Request failed: GET ${path}`);
    return parseApiJson<T>(json);
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function apiPost<T>(path: string, body: object): Promise<ApiResponse<T>> {
  try {
    const res = await apiRequest(path, { method: "POST", body: JSON.stringify(body) });
    const json = await res.json();
    if (!res.ok && res.status !== 202) throw new Error(json.message || `Request failed: POST ${path}`);
    return parseApiJson<T>(json);
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function apiPatch<T>(path: string, body?: object): Promise<ApiResponse<T>> {
  try {
    const res = await apiRequest(path, {
      method: "PATCH",
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const json = await res.json();
    if (!res.ok && res.status !== 202) throw new Error(json.message || `Request failed: PATCH ${path}`);
    return parseApiJson<T>(json);
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function apiPut<T>(path: string, body: object): Promise<ApiResponse<T>> {
  try {
    const res = await apiRequest(path, { method: "PUT", body: JSON.stringify(body) });
    const json = await res.json();
    if (!res.ok && res.status !== 202) throw new Error(json.message || `Request failed: PUT ${path}`);
    return parseApiJson<T>(json);
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function apiDelete(path: string): Promise<ApiResponse<void>> {
  try {
    const res = await apiRequest(path, { method: "DELETE" });
    if (res.status === 202) {
      return { success: true, queued: true, status: 202 };
    }
    if (!res.ok) {
      const json = await res.json();
      throw new Error(json.message || `Request failed: DELETE ${path}`);
    }
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : String(e) };
  }
}
