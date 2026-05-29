import type { ApiResponse, FilterRequest } from "../shared/types";
import { apiRequest, apiGet, apiPost, apiPatch, apiPut, apiDelete } from "../helper";
import type {
  JournalEntry,
  CreateJournalEntryRequest,
  UpdateJournalEntryRequest,
  FocusSession,
  CreateFocusSessionRequest,
  UpdateFocusSessionRequest,
  UserMetadata,
  CreateUserMetadataRequest,
  UpdateUserMetadataRequest,
  GetScriptureHistoryResponse,
  GetTodayScriptureResponse,
} from "./types";

// ── User metadata ─────────────────────────────────────────────────────────────

export function completeIndividualOnboarding(payload: CreateUserMetadataRequest): Promise<ApiResponse<null>> {
  return apiPost<null>("/users/metadata", payload);
}

export function getMetadataById(id: string): Promise<ApiResponse<UserMetadata>> {
  return apiGet<UserMetadata>(`/users/metadata/${id}`);
}

export function updateIndividualMetadata(id: string, payload: UpdateUserMetadataRequest): Promise<ApiResponse<UserMetadata>> {
  return apiPatch<UserMetadata>(`/users/metadata/${id}`, payload);
}

export function deleteIndividualMetadata(id: string): Promise<ApiResponse<void>> {
  return apiDelete(`/users/metadata/${id}`);
}

export function getMyMetadata(): Promise<ApiResponse<UserMetadata>> {
  return apiGet<UserMetadata>("/users/metadata/me");
}

export function getMetadataByUserId(userId: string): Promise<ApiResponse<UserMetadata>> {
  return apiGet<UserMetadata>(`/users/metadata/user/${userId}`);
}

// ── Journal entries ───────────────────────────────────────────────────────────

export function createJournalEntry(payload: CreateJournalEntryRequest): Promise<ApiResponse<JournalEntry>> {
  return apiPost<JournalEntry>("/journal/entries", payload);
}

export function getJournalEntries(params?: FilterRequest): Promise<ApiResponse<JournalEntry[]>> {
  return apiGet<JournalEntry[]>("/journal/entries", params as Record<string, string>);
}

export function updateJournalEntry(id: string, payload: UpdateJournalEntryRequest): Promise<ApiResponse<JournalEntry>> {
  return apiPut<JournalEntry>(`/journal/entries/${id}`, payload);
}

export function deleteJournalEntry(id: string): Promise<ApiResponse<void>> {
  return apiDelete(`/journal/entries/${id}`);
}

// ── Focus timer ───────────────────────────────────────────────────────────────
// Timer endpoints can return empty bodies, so we use response.text() to avoid
// JSON parse errors. We extract the `data` field explicitly (using `in` rather
// than `??`) so that `data: null` is preserved instead of falling through to
// the whole response object — matching the same fix applied to unwrapEnvelope.

function extractTimerData<T>(parsed: any): T {
  if (parsed !== null && typeof parsed === "object" && "data" in parsed) {
    return parsed.data as T;
  }
  return parsed as T;
}

export async function createTimerSession(payload: CreateFocusSessionRequest): Promise<ApiResponse<FocusSession>> {
  try {
    const res = await apiRequest("/timer/sessions", { method: "POST", body: JSON.stringify(payload) });
    const text = await res.text();
    const json = text ? JSON.parse(text) : {};
    if (!res.ok) throw new Error(json.message || "Failed to create timer session");
    return { success: true, data: extractTimerData<FocusSession>(json) };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function getTimerSessions(userId: string, params?: Record<string, string>): Promise<ApiResponse<FocusSession[]>> {
  try {
    const res = await apiRequest("/timer/sessions", { method: "GET", params: { userId, ...params } });
    const text = await res.text();
    const json = text ? JSON.parse(text) : [];
    if (!res.ok) throw new Error(json.message || "Failed to fetch timer sessions");
    return { success: true, data: extractTimerData<FocusSession[]>(json), meta: json?.meta };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function updateTimerSession(id: string, payload: UpdateFocusSessionRequest): Promise<ApiResponse<FocusSession>> {
  try {
    const res = await apiRequest(`/timer/sessions/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
    const text = await res.text();
    const json = text ? JSON.parse(text) : {};
    if (!res.ok) throw new Error(json.message || "Failed to update timer session");
    return { success: true, data: extractTimerData<FocusSession>(json) };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function completeTimerSession(id: string): Promise<ApiResponse<FocusSession>> {
  try {
    const res = await apiRequest(`/timer/sessions/${id}/complete`, { method: "PATCH" });
    const text = await res.text();
    const json = text ? JSON.parse(text) : {};
    if (!res.ok) throw new Error(json.message || "Failed to complete timer session");
    return { success: true, data: extractTimerData<FocusSession>(json) };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function getActiveTimerSession(userId: string): Promise<ApiResponse<FocusSession>> {
  try {
    const res = await apiRequest("/timer/sessions/active", { method: "GET", params: { userId } });
    const text = await res.text();
    if (!res.ok) {
      const json = text ? JSON.parse(text) : {};
      throw new Error(json.message || "Failed to fetch active session");
    }
    const json = text ? JSON.parse(text) : null;
    return { success: true, data: extractTimerData<FocusSession>(json) };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export function deleteTimerSession(id: string): Promise<ApiResponse<void>> {
  return apiDelete(`/timer/sessions/${id}`);
}

// ── Daily scripture (legacy — use @/api/scripture for new features) ───────────

export async function getTodayScripture(): Promise<GetTodayScriptureResponse> {
  try {
    const res = await apiRequest("/scripture/global/today");
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || `Failed to fetch scripture (${res.status})`);
    return data;
  } catch (error: any) {
    return error.message;
  }
}

export async function markScriptureAsRead(scriptureId: string): Promise<ApiResponse<void>> {
  try {
    const res = await apiRequest(`/scripture/${scriptureId}/complete`, { method: "PATCH" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || `Failed to mark scripture as read (${res.status})`);
    return data;
  } catch (error: any) {
    return error.message;
  }
}

export async function getScriptureHistory(params: FilterRequest): Promise<ApiResponse<GetScriptureHistoryResponse>> {
  try {
    const res = await apiRequest("/scripture/history", {
      params: params as unknown as Record<string, string>,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || `Failed to fetch scripture history (${res.status})`);
    return data;
  } catch (error: any) {
    return error.message;
  }
}

