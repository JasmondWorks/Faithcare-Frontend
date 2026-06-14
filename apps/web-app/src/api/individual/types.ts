import type { BaseEntity, FocusTimerStatus } from "../shared/types";

// ── User profile ──────────────────────────────────────────────────────────
export interface UserProfile extends BaseEntity {
  name: string;
  email: string;
  role: string;
  isEmailVerified: boolean;
  isAdminVerified: boolean;
  isOnboarded: boolean;
  isInvited: boolean;
  isOrgCreator: boolean;
  organizationId: string | null;
  pendingOrganizationId: string | null;
}

// ── User metadata ─────────────────────────────────────────────────────────
export interface SpiritualGoals {
  dailyBibleReading: boolean;
  dailyPrayer: boolean;
  consistentPrayerLife: boolean;
  scriptureMemorization: boolean;
  scripturalJournaling: boolean;
  betterTimeManagement: boolean;
  deeperFaith: boolean;
}

export interface PopulatedChurch {
  id: string;
  name: string;
  slug: string;
  city: string;
  state: string;
}

export interface UserMetadata extends BaseEntity {
  lastBibleReadingDate: string | null;
  journalStreakCount: number;
  lastJournalDate: string | null;
  userId: string;
  location: string | null;
  currentFocusTimerId: string | null;
  dailyBibleReadingStreakCount: number;
  lastLoginDate: string | null;
  loginStreakCount: number;
  /** Populated Organization object when fetched via GET /users/metadata/me */
  organization: PopulatedChurch | string | null;
  churchName: string | null;
  spiritualGoals: SpiritualGoals | null;
}

export interface CreateUserMetadataRequest {
  location?: string;
  organization?: string; // organizationId
  churchName?: string;
  spiritualGoals?: Partial<SpiritualGoals>;
  dailyBibleReadingStreakCount?: number;
  loginStreakCount?: number;
  journalStreakCount?: number;
}

export type UpdateUserMetadataRequest = Partial<CreateUserMetadataRequest>;

export interface ConnectChurchRequest {
  /** Pass the org's MongoDB ID when the user selected a church from search */
  organization?: string;
  /** Pass a free-text name when the church is not in the system */
  churchName?: string;
}

// ── Journal entries ───────────────────────────────────────────────────────
export interface JournalEntry extends BaseEntity {
  userId: string;
  title: string;
  scriptureReference: string | null;
  content: string;
}

export interface CreateJournalEntryRequest {
  title: string;
  content: string;
  scriptureReference?: string;
}

export type UpdateJournalEntryRequest = Partial<CreateJournalEntryRequest>;

export interface GetJournalEntriesResponse {
  data: JournalEntry[];
}

// ── Daily scripture ───────────────────────────────────────────────────────
export interface GlobalDailyVerse {
  date: string;
  reference: string;
  text: string;
  version: string;
}

export interface UserDailyScripture {
  id: string;
  userId: string;
  title: string;
  scriptureReference: string;
  content: string;
  date: string; // ISO date string
  isCompleted: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

// GET /scripture/today — returns single record or null
export type GetTodayScriptureResponse = UserDailyScripture | null;

// PATCH /scripture/:id/complete — returns updated record
export type MarkScriptureCompleteResponse = UserDailyScripture;

// GET /scripture/history — returns array
export type GetScriptureHistoryResponse = UserDailyScripture[];

// ── Focus timer ───────────────────────────────────────────────────────────
export interface FocusSession extends BaseEntity {
  userId: string;
  duration: number; // minutes
  status: FocusTimerStatus;
  currentProgress: number; // minutes elapsed
}

export interface CreateFocusSessionRequest {
  duration: number;
  status?: FocusTimerStatus;
  currentProgress?: number;
}

export type UpdateFocusSessionRequest = Partial<CreateFocusSessionRequest>;

export interface GetFocusSessionsResponse {
  data: FocusSession[];
}

// ── Shared base ────────────────────────────────────────────────────────────

// ── Nested shapes ──────────────────────────────────────────────────────────

interface Verse extends BaseEntity {
  reference: string;
  text: string;
  translation: string;
  audioUrl: string | null;
  organizationId: string;
}

type MemoryStatus = "learning" | "reviewing" | "mastered" | "archived";
type ReviewGrade = "perfect" | "hesitant" | "failed";

interface ReviewHistoryEntry {
  reviewedAt: string;
  grade: ReviewGrade;
  intervalBefore: number;
  intervalAfter: number;
}

interface LatestMeditation extends BaseEntity {
  userId: string;
  reference: string;
  verseId: Verse; // populated
  preferredTranslation: "KJV" | "ASV" | "WEB";
  organizationId: string;
  status: MemoryStatus;
  interval: number;
  easeFactor: number;
  nextReviewAt: string;
  totalReps: number;
  streak: number;
  lastGrade: ReviewGrade | null;
  masteredAt: string | null;
  reviewHistory: ReviewHistoryEntry[];
}

interface ReadingPlan {
  planName: string;
  totalDays: number;
  currentDay: number;
  progressPercent: number; // 0–100
}

interface GoalEntry {
  label: string;
  enabled: boolean;
  tracked: boolean;
  completedToday: boolean;
}

interface GoalProgress {
  dailyBibleReading: GoalEntry;
  scripturalJournaling: GoalEntry;
  scriptureMemorization: GoalEntry;
  betterTimeManagement: GoalEntry;
  dailyPrayer: GoalEntry;
  consistentPrayerLife: GoalEntry;
  deeperFaith: GoalEntry;
}

export interface Consistency {
  window: DashboardWindow;
  dailyFrom: string;    // ISO date — start of scripture/focus range
  weeklyFrom: string;   // ISO date — start of journal range (always wider)
  to: string;           // ISO date — shared end date (today)
  journalDates: string[];   // days a journal was written, within weeklyFrom→to
  scriptureDates: string[]; // days scripture was completed, within dailyFrom→to
  focusDates: string[];     // days a focus session completed, within dailyFrom→to
}

// ── Dashboard response ─────────────────────────────────────────────────────

export type DashboardWindow = 'week' | 'month' | 'quarter' | 'year';

export interface Streak {
  count: number;
  unit: 'day' | 'week';
}

export interface DashboardStreaks {
  loginStreak: Streak;    // unit: 'day'
  journalStreak: Streak;  // unit: 'week'
  scriptureStreak: Streak; // unit: 'day'
}

export interface DashboardTotals {
  scriptures: number;
  focusSessions: number;
  meditationsThisMonth: number;
}

export interface DashboardData {
  streaks: DashboardStreaks;
  totals: DashboardTotals;
  recentFocusSessions: FocusSession[];
  latestMeditations: LatestMeditation[];
  readingPlan: ReadingPlan | null;
  goalProgress: GoalProgress;
  consistency: Consistency;
}

export interface DashboardResponse {
  success: boolean;
  data: DashboardData;
}
