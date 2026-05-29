import type { BaseEntity, FocusTimerStatus } from '../shared/types';

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
    userId: string;
    location: string | null;
    /** Populated Organization object when fetched via GET /users/metadata/me */
    organization: PopulatedChurch | string | null;
    churchName: string | null;
    spiritualGoals: SpiritualGoals | null;
    dailyBibleReadingStreakCount: number;
}

export interface CreateUserMetadataRequest {
    location?: string;
    organization?: string; // organizationId
    churchName?: string;
    spiritualGoals?: Partial<SpiritualGoals>;
    dailyBibleReadingStreakCount?: number;
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
    date: string;           // ISO date string
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
    duration: number;         // minutes
    status: FocusTimerStatus;
    currentProgress: number;  // minutes elapsed
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
