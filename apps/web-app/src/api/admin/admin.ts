import { apiGet, apiPost } from "../helper";
import type { ApiResponse } from "../shared/types";
import type {
  SubmitApplicationRequest,
  SubmitApplicationResponse,
  GetMyApplicationResponse,
  ApproveApplicationResponse,
  RejectApplicationResponse,
  AdminApplication,
} from "./types";

export function submitAdminApplication(payload: SubmitApplicationRequest): Promise<ApiResponse<SubmitApplicationResponse>> {
  return apiPost<SubmitApplicationResponse>("/admin-applications", payload);
}

export function approveAdminApplication(payload: { id: string }): Promise<ApiResponse<ApproveApplicationResponse>> {
  return apiPost<ApproveApplicationResponse>(`/admin-applications/${payload.id}/approve`, payload);
}

export function rejectAdminApplication(payload: { id: string; reason?: string }): Promise<ApiResponse<RejectApplicationResponse>> {
  return apiPost<RejectApplicationResponse>(`/admin-applications/${payload.id}/reject`, payload);
}

export function getMyAdminApplicationStatus(): Promise<ApiResponse<GetMyApplicationResponse>> {
  return apiGet<GetMyApplicationResponse>("/admin-applications/mine");
}

export function getPendingApplications(payload: { organizationId: string; page?: number; limit?: number }): Promise<ApiResponse<AdminApplication[]>> {
  const { organizationId, ...params } = payload;
  return apiGet<AdminApplication[]>(`/admin-applications/organization/${organizationId}`, params as Record<string, string>);
}
