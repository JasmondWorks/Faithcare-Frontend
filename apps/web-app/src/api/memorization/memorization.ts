import { apiGet, apiPost, apiDelete } from "../helper";
import type { ApiResponse } from "../shared/types";
import type {
  QueueResponse,
  ReviewRequest,
  ReviewResponse,
  ProgressResponse,
  VerseCollectionItem,
  VerseSearchResult,
  GroupStats,
} from "./types";

export function getQueue(limit = 10): Promise<ApiResponse<QueueResponse>> {
  return apiGet<QueueResponse>(`/memorization/queue`, { limit: String(limit) });
}

export function submitReview(body: ReviewRequest): Promise<ApiResponse<ReviewResponse>> {
  return apiPost<ReviewResponse>("/memorization/review", body);
}

export function addVerse(body: {
  verseId?: string;
  reference?: string;
  translation?: string;
}): Promise<ApiResponse<{ memory: unknown }>> {
  return apiPost("/memorization/add", body);
}

export function removeVerse(verseId: string): Promise<ApiResponse<void>> {
  return apiDelete(`/memorization/remove/${verseId}`);
}

export function getProgress(): Promise<ApiResponse<ProgressResponse>> {
  return apiGet<ProgressResponse>("/memorization/progress");
}

export function getCollections(theme?: string): Promise<ApiResponse<VerseCollectionItem[]>> {
  return apiGet<VerseCollectionItem[]>(
    "/memorization/collections",
    theme ? { theme } : undefined,
  );
}

export function enqueueCollection(
  collectionId: string,
): Promise<ApiResponse<{ added: number; total: number }>> {
  return apiPost<{ added: number; total: number }>(
    `/memorization/collections/${collectionId}/enqueue`,
    {},
  );
}

export function searchVerse(
  reference: string,
  translation = "KJV",
): Promise<ApiResponse<VerseSearchResult>> {
  return apiGet<VerseSearchResult>("/memorization/verse/search", {
    reference,
    translation,
  });
}

export function getGroupStats(groupId: string): Promise<ApiResponse<GroupStats>> {
  return apiGet<GroupStats>(`/memorization/stats/group/${groupId}`);
}
