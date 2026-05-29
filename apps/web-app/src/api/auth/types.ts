import type { OrganizationRole, Role } from "../shared/types";

// ── Shared user shape returned by all auth responses ──────────────────────
export interface AuthUser {
    id: string;
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
    createdAt: string;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    tokenType: 'Bearer';
    expiresIn: number;
    user: AuthUser;
}

// ── Register ──────────────────────────────────────────────────────────────
export interface RegisterRequest {
    fullName: string;
    email: string;
    password: string;
    phone?: string;
}

export interface RegisterResponse {
    message: string;
}

// ── Login ─────────────────────────────────────────────────────────────────
export interface LoginRequest {
    email: string;
    password: string;
}

/** `message` is only present when an ADMIN account is pending verification */
export type LoginResponse = AuthTokens & { message?: string };

// ── Google Sign-In ────────────────────────────────────────────────────────
export interface GoogleSignInRequest {
    provider: 'google';
    idToken: string;
}

export type GoogleSignInResponse = AuthTokens & { isNewUser: boolean };

// ── Token refresh ─────────────────────────────────────────────────────────
export interface RefreshRequest {
    refreshToken?: string; // also accepted from HttpOnly cookie
}

export interface RefreshResponse {
    accessToken: string;
    tokenType: 'Bearer';
    expiresIn: number;
}

// ── Email OTP ─────────────────────────────────────────────────────────────
export interface VerifyEmailOTPRequest {
    email: string;
    otp: string;
}

/** Returns full auth tokens so the frontend can log in immediately after verification */
export type VerifyEmailOTPResponse = AuthTokens & { message: string };

export interface ResendOTPRequest {
    email: string;
    type: 'email_verification' | 'password_reset';
}

export interface ResendOTPResponse {
    message: string;
}

// ── Password reset ────────────────────────────────────────────────────────
export interface ForgotPasswordRequest {
    email: string;
}

export interface ForgotPasswordResponse {
    message: string;
}

export interface ResetPasswordRequest {
    email: string;
    otp: string;
    newPassword: string;
}

export interface ResetPasswordResponse {
    message: string;
}

// ── Admin invite flow ─────────────────────────────────────────────────────
export interface InviteAdminRequest {
    fullName: string;
    email: string;
    organizationRole?: OrganizationRole;
}

export interface InviteAdminResponse {
    message: string;
}

export interface VerifyInviteRequest {
    token: string;
}

export interface VerifyInviteResponse {
    name: string;
    email: string;
    orgName: string;
}

export interface AcceptInviteRequest {
    token: string;
    password: string;
}

/** Returns full auth tokens so the frontend logs the admin in immediately */
export type AcceptInviteResponse = AuthTokens & { message: string };

// ── Logout ────────────────────────────────────────────────────────────────
export interface LogoutResponse {
    message: string;
}
