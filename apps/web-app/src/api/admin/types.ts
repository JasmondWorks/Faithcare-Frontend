import type { BaseEntity, ApplicationStatus, OrganizationRole, Role } from '../shared/types';

// ── Admin Applications ────────────────────────────────────────────────────
export interface SubmitApplicationRequest {
    organizationId: string;
}

export interface ApplicationApproval {
    adminId: string;
    approvedAt: string;
}

export interface AdminApplication extends BaseEntity {
    applicantId: {
        id: string;
        name: string;
        email: string;
        createdAt: string;
    };
    organizationId: string;
    status: ApplicationStatus;
    approvals: ApplicationApproval[];
    rejectionReason: string | null;
    expiresAt: string;
}

export interface SubmitApplicationResponse {
    message: string;
    data: AdminApplication;
}

export interface GetMyApplicationResponse {
    data: AdminApplication | null;
}

export interface ListOrgApplicationsResponse {
    data: AdminApplication[];
}

export interface ApproveApplicationResponse {
    approved: boolean;
    message: string;
}

export interface RejectApplicationRequest {
    reason?: string;
}

export interface RejectApplicationResponse {
    message: string;
}

// ── User management (SUPER_ADMIN / ADMIN) ─────────────────────────────────
export interface AdminUserView extends BaseEntity {
    name: string;
    email: string;
    role: Role;
    isEmailVerified: boolean;
    isAdminVerified: boolean;
    isOnboarded: boolean;
    isInvited: boolean;
    isOrgCreator: boolean;
    organizationId: string | null;
    pendingOrganizationId: string | null;
    organizationRole: OrganizationRole | null;
}

export interface CreateUserRequest {
    name: string;
    email: string;
    password: string;
}

export interface UpdateUserRequest {
    name?: string;
    email?: string;
    password?: string;
}

export interface GetUsersResponse {
    data: AdminUserView[];
}

export interface GetUserResponse {
    data: AdminUserView;
}

// ── Organization-user settings ────────────────────────────────────────────
export interface NotificationSettings {
    newFirstTimers: boolean;
    newPrayerRequests: boolean;
    pendingFollowUpReminders: boolean;
}

export interface OrgUserSettings extends BaseEntity {
    userId: string;
    organizationId: string;
    notifications: NotificationSettings;
    theme: 'LIGHT' | 'DARK';
    is2FAEnabled: boolean;
    language: 'EN' | 'FR';
    timeZone: 'WAT' | 'ET';
}

export interface CreateOrgUserSettingsRequest {
    userId: string;
    organizationId: string;
    notifications?: Partial<NotificationSettings>;
    theme?: 'LIGHT' | 'DARK';
    is2FAEnabled?: boolean;
    language?: 'EN' | 'FR';
    timeZone?: 'WAT' | 'ET';
}

export type UpdateOrgUserSettingsRequest = Partial<CreateOrgUserSettingsRequest>;
