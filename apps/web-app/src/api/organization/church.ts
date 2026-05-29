import { apiRequest, apiGet, apiPost, apiPatch, apiDelete, getInMemoryToken } from "../helper";
import type {
  RegisterFirstTimerRequest,
  DashboardTrendsRequest,
  DashboardTrendsResponse,
  FirstTimer,
  FollowUp,
  CreateFollowUpRequest,
  UpdateFollowUpRequest,
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
  Organization,
  Community,
  CreateCommunityRequest,
  UpdateCommunityRequest,
  PrayerRequest,
  UpdatePrayerRequestRequest,
  SalvationRecord,
  CreateSalvationRecordRequest,
  VerifyQrCodeResponse,
  VerifyQrCodeRequest,
  MessageTemplate,
  CreateMessageTemplateRequest,
} from "./types";
import type { ApiResponse, MessageResponse } from "../shared/types";

// ── Dashboard ─────────────────────────────────────────────────────────────────

export function getDashboardTrends(payload?: DashboardTrendsRequest): Promise<ApiResponse<DashboardTrendsResponse>> {
  return apiGet<DashboardTrendsResponse>("/church/dashboard/trends", payload as Record<string, string>);
}

// ── First timers ──────────────────────────────────────────────────────────────

export async function getFirstTimers(
  filters: {
    organizationId?: string;
    page?: number;
    limit?: number;
    status?: "PENDING" | "CONTACTED" | "FOLLOWED_UP" | "all";
    visit_type?: "first_time" | "second_time";
    search?: string;
    from_date?: string;
    to_date?: string;
  } = {},
) {
  const params: Record<string, string> = {};
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined) params[key] = value.toString();
  });
  return apiGet("/church/first-timers", params);
}

export function createFirstTimer(payload: RegisterFirstTimerRequest) {
  return apiPost("/church/first-timers", payload);
}

export function getFirstTimerById(id: string): Promise<ApiResponse<FirstTimer>> {
  return apiGet<FirstTimer>(`/church/first-timers/${id}`);
}

export function updateFirstTimerStatus(
  id: string,
  payload: { status: "PENDING" | "CONTACTED" | "FOLLOWED_UP" | "PROMOTED"; notes?: string },
): Promise<ApiResponse<{ message: string }>> {
  return apiPatch<{ message: string }>(`/church/first-timers/${id}/status`, payload);
}

export async function updateFirstTimerVisitType(
  organizationId: string,
  id: string,
  payload: RegisterFirstTimerRequest,
): Promise<ApiResponse<null>> {
  // Orchestrates three steps: create second-timer record, mark old as PROMOTED, delete old.
  try {
    const today = new Date().toISOString().split("T")[0];
    const createRes = await apiRequest("/church/first-timers", {
      method: "POST",
      body: JSON.stringify({ ...payload, organizationId, firstTimerId: id, visitType: "second_time", serviceDate: today }),
    });
    if (!createRes.ok) {
      const err = await createRes.json();
      throw new Error(err.message || "Failed to create second timer record");
    }
    await updateFirstTimerStatus(id, { status: "PROMOTED", notes: "Promoted to second timer" });
    await deleteFirstTimer(organizationId, id);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function deleteFirstTimer(organizationId: string, id: string) {
  // Tries three known endpoint paths in order, returns on first success.
  try {
    for (const path of [
      `/church/first-timers/${id}`,
      `/church/members/${id}`,
    ]) {
      const res = await apiRequest(path, { method: "DELETE" });
      if (res.ok) return { success: true };
    }
    throw new Error("Deletion failed across all known paths");
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ── Follow-ups ────────────────────────────────────────────────────────────────

export function getFollowUps(payload?: { page?: number; limit?: number }): Promise<ApiResponse<FollowUp[]>> {
  const { page, limit } = payload ?? {};
  const params: Record<string, string> = {};
  if (page !== undefined) params.page = String(page);
  if (limit !== undefined) params.limit = String(limit);
  return apiGet<FollowUp[]>("/church/follow-ups", params);
}

export function createFollowUp(payload: CreateFollowUpRequest): Promise<ApiResponse<FollowUp>> {
  return apiPost<FollowUp>(`/church/follow-ups`, payload);
}

export function updateFollowUp(id: string, payload: UpdateFollowUpRequest): Promise<ApiResponse<FollowUp>> {
  return apiPatch<FollowUp>(`/church/follow-ups/${id}`, payload);
}

export function deleteFollowUp(id: string): Promise<ApiResponse<void>> {
  return apiDelete(`/church/follow-ups/${id}`);
}

export function getFollowUpsByMember(newMemberId: string): Promise<ApiResponse<FollowUp[]>> {
  return apiGet<FollowUp[]>(`/church/follow-ups/member/${newMemberId}`);
}

// ── Organization ──────────────────────────────────────────────────────────────

export function completeOrganizationOnboarding(payload: CreateOrganizationRequest): Promise<ApiResponse<Organization>> {
  return apiPost<Organization>("/organizations", payload);
}

export function createOrganization(payload: CreateOrganizationRequest): Promise<ApiResponse<Organization>> {
  return apiPost<Organization>("/organizations", payload);
}

export function updateOrganization(id: string, payload: UpdateOrganizationRequest): Promise<ApiResponse<Organization>> {
  return apiPatch<Organization>(`/organizations/${id}`, payload);
}

export function deleteOrganization(id: string): Promise<ApiResponse<void>> {
  return apiDelete(`/organizations/${id}`);
}

export function getOrganizationById(id: string): Promise<ApiResponse<Organization>> {
  return apiGet<Organization>(`/organizations/${id}`);
}

export function regenerateOrganizationQrCode(id: string): Promise<ApiResponse<null>> {
  return apiPost<null>(`/organizations/${id}/qr-code/regenerate`, {});
}

export function getMyOrganization(): Promise<ApiResponse<Organization>> {
  return apiGet<Organization>("/organizations/mine");
}

export function getOrganizationBySlug(slug: string): Promise<ApiResponse<Organization>> {
  return apiGet<Organization>("/organizations", { slug });
}

// ── Communities ───────────────────────────────────────────────────────────────

export function getCommunities(organizationId: string): Promise<ApiResponse<Community[]>> {
  return apiGet<Community[]>(`/church/communities`);
}

export function createCommunity(organizationId: string, payload: CreateCommunityRequest): Promise<ApiResponse<Community>> {
  return apiPost<Community>(`/church/communities`, payload);
}

export function updateCommunity(organizationId: string, id: string, payload: UpdateCommunityRequest): Promise<ApiResponse<Community>> {
  return apiPatch<Community>(`/church/communities/${id}`, payload);
}

export function deleteCommunity(organizationId: string, id: string): Promise<ApiResponse<void>> {
  return apiDelete(`/church/communities/${id}`);
}

// ── Prayer requests ───────────────────────────────────────────────────────────

export function createPrayerRequest(organizationId: string, payload: any): Promise<ApiResponse<any>> {
  return apiPost(`/church/prayer-requests`, payload);
}

export function getPrayerRequests(page?: number, limit?: number): Promise<ApiResponse<PrayerRequest[]>> {
  return apiGet<PrayerRequest[]>(`/church/prayer-requests`, { page: String(page || 1), limit: String(limit || 20) });
}

export function getPrayerRequestById(organizationId: string, id: string): Promise<ApiResponse<PrayerRequest>> {
  return apiGet<PrayerRequest>(`/church/prayer-requests/${id}`);
}

export function updatePrayerRequest(organizationId: string, id: string, payload: UpdatePrayerRequestRequest): Promise<ApiResponse<PrayerRequest>> {
  return apiPatch<PrayerRequest>(`/church/prayer-requests/${id}`, payload);
}

export function deletePrayerRequest(organizationId: string, id: string): Promise<ApiResponse<void>> {
  return apiDelete(`/church/prayer-requests/${id}`);
}

// ── Salvation records ─────────────────────────────────────────────────────────

export function getSalvationRecords(organizationId: string, page?: number, limit?: number): Promise<ApiResponse<SalvationRecord[]>> {
  return apiGet<SalvationRecord[]>(`/church/salvation-records`, { page: String(page || 1), limit: String(limit || 20) });
}

export function createSalvationRecord(organizationId: string, payload: CreateSalvationRecordRequest): Promise<ApiResponse<SalvationRecord>> {
  return apiPost<SalvationRecord>(`/church/salvation-records`, payload);
}

export function updateSalvationRecord(organizationId: string, id: string, payload: CreateSalvationRecordRequest): Promise<ApiResponse<SalvationRecord>> {
  return apiPatch<SalvationRecord>(`/church/salvation-records/${id}`, payload);
}

export function deleteSalvationRecord(organizationId: string, id: string): Promise<ApiResponse<void>> {
  return apiDelete(`/church/salvation-records/${id}`);
}

// ── Bulk upload (FormData — cannot use JSON helpers) ──────────────────────────

export async function bulkUploadMembers(organizationId: string, type: string, file: File) {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
    const baseUrl = import.meta.env.VITE_API_URL || "https://faithcare-13a2dc003ee9.herokuapp.com/api/v1";
    const token = getInMemoryToken();
    const res = await fetch(`${baseUrl}/church/members/bulk-upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Bulk upload failed");
    return { success: true, data: data?.data };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ── Public QR registration (no auth — raw fetch) ──────────────────────────────

export async function verifyQrToken(payload: VerifyQrCodeRequest): Promise<ApiResponse<VerifyQrCodeResponse>> {
  try {
    const { baseUrl } = await import("@/constants/api");
    const res = await fetch(`${baseUrl}/church/first-timers/register/verify?token=${encodeURIComponent(payload.token)}`);
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.message };
    return data;
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function registerFirstTimerPublic(payload: RegisterFirstTimerRequest): Promise<ApiResponse<MessageResponse>> {
  try {
    const { baseUrl } = await import("@/constants/api");
    const res = await fetch(`${baseUrl}/church/first-timers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (res.status === 401) return { success: false, error: data.message };
    if (!res.ok) return { success: false, error: data.message || "Registration failed." };
    return { success: true, data: data.data };
  } catch (e: any) {
    return { success: false, error: "Registration failed. Please check your connection and try again." };
  }
}

// ── Message templates ─────────────────────────────────────────────────────────

export function getMessageTemplatePresets(): Promise<ApiResponse<MessageTemplate[]>> {
  return apiGet<MessageTemplate[]>("/message-templates/presets");
}

export function getMessageTemplates(): Promise<ApiResponse<MessageTemplate[]>> {
  return apiGet<MessageTemplate[]>("/message-templates");
}

export function createMessageTemplate(payload: CreateMessageTemplateRequest): Promise<ApiResponse<MessageTemplate>> {
  return apiPost<MessageTemplate>("/message-templates", payload);
}

export function updateMessageTemplate(id: string, payload: Partial<CreateMessageTemplateRequest>): Promise<ApiResponse<MessageTemplate>> {
  return apiPatch<MessageTemplate>(`/message-templates/${id}`, payload);
}

export function deleteMessageTemplate(id: string): Promise<ApiResponse<void>> {
  return apiDelete(`/message-templates/${id}`);
}

// ── Bulk messaging ────────────────────────────────────────────────────────────

export function sendBulkMessage(
  organizationId: string,
  payload: { platform: "whatsapp" | "sms"; content: string; recipientIds: string[] },
): Promise<ApiResponse<any>> {
  return apiPost(`/church/messages/bulk`, payload);
}
