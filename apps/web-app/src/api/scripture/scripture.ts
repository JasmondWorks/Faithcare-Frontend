import { apiRequest, apiGet, apiPost, apiPatch, apiDelete } from "../helper";
import type { ApiResponse } from "../shared/types";
import type {
  TodayResponse,
  UserDailyScripture,
  Bible,
  AudioBible,
  BibleBook,
  BibleChapterSummary,
  ChapterContent,
  AudioChapter,
  ReadingPlan,
  UserReadingPlan,
  BookmarkedVerse,
  CreateBookmarkRequest,
  GlobalTodayResponse,
} from "./types";

// ── Today & reading ───────────────────────────────────────────────────────────

export async function getTodayScriptureAuth(translationId?: string): Promise<ApiResponse<TodayResponse>> {
  try {
    const url = translationId ? `/scripture/today?translationId=${translationId}` : "/scripture/today";
    const res = await apiRequest(url);
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Failed to fetch today's scripture");
    return { success: true, data: (json?.data ?? json) as TodayResponse };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function getTodaysGlobalScripture(): Promise<GlobalTodayResponse> {
  const res = await apiGet<GlobalTodayResponse>("/scripture/global/today");

  return res.data as GlobalTodayResponse;
}

export function markScriptureComplete(id: string): Promise<ApiResponse<UserDailyScripture>> {
  return apiPatch<UserDailyScripture>(`/scripture/${id}/complete`);
}

export function saveScriptureNotes(id: string, notes: string): Promise<ApiResponse<UserDailyScripture>> {
  return apiPatch<UserDailyScripture>(`/scripture/${id}/notes`, { notes });
}

// ── Bible browsing ────────────────────────────────────────────────────────────

export function getBibles(): Promise<ApiResponse<Bible[]>> {
  return apiGet<Bible[]>("/scripture/bibles");
}

export function getAudioBibles(): Promise<ApiResponse<AudioBible[]>> {
  return apiGet<AudioBible[]>("/scripture/bibles/audio");
}

export function getBooks(bibleId: string): Promise<ApiResponse<BibleBook[]>> {
  return apiGet<BibleBook[]>(`/scripture/bibles/${bibleId}/books`);
}

export function getChapters(bibleId: string, bookId: string): Promise<ApiResponse<BibleChapterSummary[]>> {
  return apiGet<BibleChapterSummary[]>(`/scripture/bibles/${bibleId}/books/${bookId}/chapters`);
}

export function getChapter(bibleId: string, chapterId: string): Promise<ApiResponse<ChapterContent>> {
  return apiGet<ChapterContent>(`/scripture/bibles/${bibleId}/chapters/${chapterId}`);
}

export function getAudioChapter(audioBibleId: string, chapterId: string): Promise<ApiResponse<AudioChapter>> {
  return apiGet<AudioChapter>(`/scripture/audio/${audioBibleId}/chapters/${chapterId}`);
}

// ── Reading plans ─────────────────────────────────────────────────────────────

export function getReadingPlans(): Promise<ApiResponse<ReadingPlan[]>> {
  return apiGet<ReadingPlan[]>("/scripture/plans");
}

export function subscribeToplan(planId: string, translationId: string): Promise<ApiResponse<UserReadingPlan>> {
  return apiPost<UserReadingPlan>("/scripture/plans/subscribe", { planId, translationId });
}

export function getMyPlan(): Promise<ApiResponse<UserReadingPlan | null>> {
  return apiGet<UserReadingPlan | null>("/scripture/plans/mine");
}

export function getAllMyPlans(): Promise<ApiResponse<UserReadingPlan[]>> {
  return apiGet<UserReadingPlan[]>("/scripture/plans/mine/all");
}

export function pausePlan(): Promise<ApiResponse<UserReadingPlan>> {
  return apiPatch<UserReadingPlan>("/scripture/plans/mine/pause");
}

export function resumePlan(userPlanId: string): Promise<ApiResponse<UserReadingPlan>> {
  return apiPatch<UserReadingPlan>("/scripture/plans/mine/resume", { userPlanId });
}

// ── Bookmarks ─────────────────────────────────────────────────────────────────

export function getBookmarks(): Promise<ApiResponse<BookmarkedVerse[]>> {
  return apiGet<BookmarkedVerse[]>("/scripture/bookmarks");
}

export function addBookmark(payload: CreateBookmarkRequest): Promise<ApiResponse<BookmarkedVerse>> {
  return apiPost<BookmarkedVerse>("/scripture/bookmarks", payload);
}

export function removeBookmark(id: string): Promise<ApiResponse<void>> {
  return apiDelete(`/scripture/bookmarks/${id}`);
}

// ── History ───────────────────────────────────────────────────────────────────

export function getScriptureHistoryAuth(): Promise<ApiResponse<UserDailyScripture[]>> {
  return apiGet<UserDailyScripture[]>("/scripture/history");
}

// ── Search ────────────────────────────────────────────────────────────────────

export interface BibleReferenceSearchResult {
  reference: string;
  book: string;
  chapter: number;
  verse: number;
}

export function searchBibleReferences(query: string): Promise<ApiResponse<BibleReferenceSearchResult[]>> {
  return apiGet<BibleReferenceSearchResult[]>("/bible/references", { q: query });
}
