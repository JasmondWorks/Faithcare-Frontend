export interface BulkUploadRequest {
    file: File
}

export interface MessageResponse {
    message: string
}

export type Status = 'PENDING' | 'COMPLETED'


// ── Base ──────────────────────────────────────────────────────────────────
export interface BaseEntity {
    id: string;
    __v: number;
    isDeleted: boolean;
    deletedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

// ── Enums (string unions instead of TS enums for better DX) ───────────────
export type Role = 'USER' | 'ADMIN' | 'SUPER_ADMIN';

export type OrganizationRole =
    | 'SENIOR_PASTOR'
    | 'ASSOCIATE_PASTOR'
    | 'YOUTH_PASTOR'
    | 'WORSHIP_LEADER'
    | 'CHURCH_ADMIN'
    | 'VOLUNTEER_LEADER'
    | 'OTHER';

export type Denomination =
    | 'NON_DENOMINATIONAL'
    | 'BAPTIST'
    | 'METHODIST'
    | 'PRESBYTERIAN'
    | 'PENTECOSTAL'
    | 'LUTHERAN'
    | 'EPISCOPAL'
    | 'OTHER';

export type MemberCountRange =
    | '0-50'
    | '51-100'
    | '101-250'
    | '251-500'
    | '501-1000'
    | '1000+';

export type MessageChannel = 'whatsapp' | 'sms' | 'email' | 'in_person';

export type FollowUpStatus = 'PENDING' | 'CONTACTED' | 'REPLIED' | 'CLOSED';
export type DeliveryStatus = 'not_sent' | 'sent' | 'failed';
export type Priority = 'HIGH' | 'MEDIUM' | 'LOW';
export type TargetType = 'first_timer' | 'second_timer' | 'member';
export type VisitType = 'first_time' | 'second_time';
export type FollowUpTag = 'FIRST_TIMER' | 'MEMBER' | 'OTHER';

export type FocusTimerStatus =
    | 'NOT_STARTED'
    | 'IN_PROGRESS'
    | 'PAUSED'
    | 'COMPLETED'
    | 'CANCELLED';

export type SalvationStatus = 'PENDING' | 'CONTACTED' | 'FOLLOWED_UP';
export type PrayerRequestStatus = 'PENDING' | 'CONTACTED' | 'FOLLOWED_UP';
export type MemberStatus = 'ACTIVE' | 'INACTIVE';
export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

// ── Shared response wrappers ───────────────────────────────────────────────
export interface BulkUploadResult {
    inserted: number;
    skippedDuplicates: number;
    invalidRows: Array<{ row: number; errors: string[] }>;
}

export interface PaginationMetaInfo {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    meta?: PaginationMetaInfo | null;
    error?: string;
    status?: number;
}

export interface FilterRequest {
    page?: number;
    limit?: number;
    total?: number;
    search?: string;
    userId?: string;
    [key: string]: string | number | undefined;
}