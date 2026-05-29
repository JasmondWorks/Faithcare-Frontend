import { apiRequest, apiGet, apiPost, apiPatch, apiDelete } from "../api/helper";
import type { ApiResponse, MessageResponse } from "../api/shared/types";
import type { PaginationMetaInfo } from "../api/shared/types";

// Re-export ApiResponse so files can import from @/lib/api
export type { ApiResponse, MessageResponse, PaginationMetaInfo };

/**
 * Helper to extract data array from any API response format
 * Handles:
 * 1. { data: [] }
 * 2. { data: { data: [] } }
 * 3. { data: { entries: [] } }
 * 4. []
 */
export const extractDataArray = (response: any): any[] => {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    if (response.data) {
        if (Array.isArray(response.data)) return response.data;
        if (response.data.data && Array.isArray(response.data.data))
            return response.data.data;
        if (response.data.entries && Array.isArray(response.data.entries))
            return response.data.entries;
        if (response.data.prayerRequests && Array.isArray(response.data.prayerRequests))
            return response.data.prayerRequests;
        if (response.data.communities && Array.isArray(response.data.communities))
            return response.data.communities;
        if (response.data.users && Array.isArray(response.data.users))
            return response.data.users;
    }
    return [];
};

/**
 * Helper to extract meta info from any API response format
 */
export const extractMeta = (response: any): PaginationMetaInfo | null => {
    if (!response?.meta) return null;
    return response.meta as PaginationMetaInfo;
};

// Re-export all helper functions
export {
    apiRequest,
    apiGet,
    apiPost,
    apiPatch,
    apiDelete,
};

// Re-export types
export type {
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
} from "../api/organization/types";
