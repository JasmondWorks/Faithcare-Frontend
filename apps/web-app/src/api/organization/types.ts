import type {
    BaseEntity,
    BulkUploadResult,
    Denomination,
    DeliveryStatus,
    FollowUpStatus,
    FollowUpTag,
    MemberCountRange,
    MemberStatus,
    MessageChannel,
    OrganizationRole,
    PrayerRequestStatus,
    Priority,
    SalvationStatus,
    TargetType,
    VisitType,
} from '../shared/types';

// ── Organization ──────────────────────────────────────────────────────────
export interface Organization extends BaseEntity {
    name: string;
    slug: string;
    email: string;
    createdBy: string;
    denomination: Denomination;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phoneNumber: string;
    websiteUrl: string | null;
    memberCountRange: MemberCountRange;
    firstTimerQrCode: string | null;
}

export interface CreateOrganizationRequest {
    name: string;
    slug?: string;
    email: string;
    denomination: Denomination;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phoneNumber: string;
    websiteUrl?: string;
    memberCountRange: MemberCountRange;
    organizationRole: OrganizationRole;
}

export type UpdateOrganizationRequest = Partial<CreateOrganizationRequest>;

export interface RegenerateQrCodeResponse {
    firstTimerQrCode: string;
}

/** Returned by GET /organizations?slug= */
export interface SearchOrganizationsResponse {
    data: Organization[];
}

// ── QR code verification (public — called before showing registration form) ──
export interface VerifyQrCodeRequest {
    token: string;
}

export interface VerifyQrCodeResponse {
    orgId: string;
    orgName: string;
    slug: string;
}

// ── First timers ──────────────────────────────────────────────────────────
export interface FirstTimer extends BaseEntity {
    organizationId: string;
    name: string;
    phoneNumber: string;
    email: string | null;
    prayerRequest: string | null;
    visitType: VisitType;
    firstTimerId: string | null;
    status: 'PENDING' | 'CONTACTED' | 'FOLLOWED_UP';
    serviceDate: string | null;
    notes: string | null;
    followUpScheduledAt: string | null;
}

/** Sent from the public QR registration form */
export interface RegisterFirstTimerRequest {
    qrToken: string;
    name: string;
    phoneNumber: string;
    visitType: VisitType;
    serviceDate: string;      // YYYY-MM-DD, auto-populated with today
    email?: string;
    prayerRequest?: string;
    firstTimerId?: string;    // for second-time visits
}

/** `created: false` means the phone was recognised and the record was updated */
export interface RegisterFirstTimerResponse {
    data: FirstTimer;
    created: boolean;
}

export interface GetFirstTimersRequest {
    status?: 'PENDING' | 'CONTACTED' | 'FOLLOWED_UP' | 'all';
    visit_type?: VisitType;
}

export interface GetFirstTimersResponse {
    data: FirstTimer[];
}

export interface UpdateFirstTimerStatusRequest {
    status: 'PENDING' | 'CONTACTED' | 'FOLLOWED_UP';
    notes?: string;
}

export interface BulkUploadFirstTimersResponse {
    data: BulkUploadResult;
}

// ── Second timers ─────────────────────────────────────────────────────────
export interface SecondTimer extends BaseEntity {
    organizationId: string;
    firstTimerId: string;
    name: string;
    phoneNumber: string;
    email: string;
    prayerRequest: string | null;
    status: 'FIRST_TIMER' | 'SECOND_TIMER';
}

export interface CreateSecondTimerRequest {
    firstTimerId: string;
    name: string;
    phoneNumber: string;
    email: string;
    prayerRequest?: string;
    status?: 'FIRST_TIMER' | 'SECOND_TIMER';
}

export type UpdateSecondTimerRequest = Partial<CreateSecondTimerRequest>;

// ── Members ───────────────────────────────────────────────────────────────
export interface Member extends BaseEntity {
    organizationId: string;
    name: string;
    phoneNumber: string;
    email: string | null;
    address: string | null;
    notes: string | null;
    joinedAt: string | null;
    status: MemberStatus;
}

export interface CreateMemberRequest {
    name: string;
    phoneNumber: string;
    email?: string;
    address?: string;
    notes?: string;
    joinedAt?: string; // YYYY-MM-DD
}

export type UpdateMemberRequest = Partial<CreateMemberRequest>;

export interface GetMembersRequest {
    search?: string;
}

// ── Follow-ups ────────────────────────────────────────────────────────────
export interface FollowUp extends BaseEntity {
    organizationId: string;
    targetType: TargetType | null;
    isFirstTimer: boolean;
    isSecondTimer: boolean;
    targetId: string | null;
    contactName: string;
    contactPhone: string;
    tags: FollowUpTag[];
    priority: Priority;
    description: string;
    dueDate: string;
    status: FollowUpStatus;
    channel: MessageChannel;
    sentMessage: string | null;
    receivedMessage: string | null;
    deliveryStatus: DeliveryStatus;
}

export interface CreateFollowUpRequest {
    targetType?: TargetType;
    isFirstTimer?: boolean;
    isSecondTimer?: boolean;
    targetId?: string;
    contactName: string;
    contactPhone: string;
    tags?: FollowUpTag[];
    priority?: Priority;
    description: string;
    dueDate: string; // ISO 8601
}

export type UpdateFollowUpRequest = Partial<CreateFollowUpRequest>;

export interface SendFollowUpMessageRequest {
    channel: 'whatsapp' | 'sms';
    message: string;
    contactPhone?: string;
}

/** `deliveryError` is only present when `delivered: false` */
export type SendFollowUpMessageResponse = FollowUp & {
    delivered: boolean;
    deliveryError?: string;
};

export interface LogFollowUpReplyRequest {
    receivedMessage: string;
}

/** A single entry in the message conversation thread for a contact */
export interface FollowUpConversationEntry {
    followUpId: string;
    contactName: string;
    isFirstTimer: boolean;
    isSecondTimer: boolean;
    channel: MessageChannel;
    sentMessage: string | null;
    receivedMessage: string | null;
    deliveryStatus: DeliveryStatus;
    status: FollowUpStatus;
    sentAt: string;
    createdAt: string;
}

// ── Communities ───────────────────────────────────────────────────────────
export interface Community extends BaseEntity {
    organizationId: string;
    name: string;
    description: string;
    members: string[];
    profileImage: string | null;
}

export interface CreateCommunityRequest {
    name: string;
    description: string;
    members?: string[];
    profileImage?: string;
}

export type UpdateCommunityRequest = Partial<CreateCommunityRequest>;

export interface AddRemoveCommunityMemberRequest {
    userId: string;
}

// ── Prayer requests ───────────────────────────────────────────────────────
export interface PrayerRequest extends BaseEntity {
    organizationId: string;
    name: string;
    description: string;
    status: PrayerRequestStatus;
}

/** Submitted by users (Role.USER) */
export interface SubmitPrayerRequestRequest {
    name: string;
    description: string;
}

/** Used by admins to update status */
export interface UpdatePrayerRequestRequest {
    name?: string;
    description?: string;
    status?: PrayerRequestStatus;
}

// ── Salvation records ─────────────────────────────────────────────────────
export interface SalvationRecord extends BaseEntity {
    organizationId: string;
    name: string;
    phoneNumber: string | null;
    email: string | null;
    decisionDate: string;
    notes: string | null;
    status: SalvationStatus;
}

export interface CreateSalvationRecordRequest {
    name: string;
    decisionDate: string;
    phoneNumber?: string;
    email?: string;
    notes?: string;
    status?: SalvationStatus;
}

export type UpdateSalvationRecordRequest = Partial<CreateSalvationRecordRequest>;

// ── Dashboard ─────────────────────────────────────────────────────────────
export interface DashboardSummary {
    pending: number;
    contacted: number;
    replied: number;
    closed: number;
    total: number;
}

export interface WeeklyDataPoint {
    week: string;
    firstTimers: number;
    followUps: number;
}

export interface DashboardTrendsRequest {
    weeks?: number; // defaults to 4
}

export interface DashboardTrendsResponse {
    data: WeeklyDataPoint[];
}

// ── Message templates ─────────────────────────────────────────────────────
export type TemplateTrigger =
    | 'on_registration'
    | 'day_1'
    | 'day_3'
    | 'day_7'
    | 'manual';

export interface MessageTemplate extends BaseEntity {
    organizationId: string | null; // null for system presets
    name: string;
    channel: 'whatsapp' | 'sms' | 'email';
    trigger: TemplateTrigger;
    body: string;
    variables: string[];
    isPreset: boolean;
    isActive: boolean;
}

export interface CreateMessageTemplateRequest {
    name: string;
    channel: 'whatsapp' | 'sms' | 'email';
    trigger: TemplateTrigger;
    body: string;
    variables?: string[];
    isActive?: boolean;
}

export type UpdateMessageTemplateRequest = Partial<CreateMessageTemplateRequest>;
