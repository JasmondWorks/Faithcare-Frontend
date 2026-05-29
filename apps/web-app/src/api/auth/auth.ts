import { baseUrl } from "@/constants/api";
import { apiRequest, apiPost } from "../helper";
import type { ApiResponse } from "../shared/types";
import type {
  AcceptInviteRequest, AcceptInviteResponse,
  ForgotPasswordRequest, GoogleSignInRequest, GoogleSignInResponse,
  LoginRequest, LoginResponse, RefreshRequest, RefreshResponse,
  RegisterRequest, RegisterResponse, ResendOTPRequest, ResetPasswordRequest,
  VerifyEmailOTPRequest, VerifyEmailOTPResponse,
  VerifyInviteRequest, VerifyInviteResponse,
} from "./types";

export async function login(payload: LoginRequest): Promise<ApiResponse<LoginResponse>> {
  try {
    const response = await apiRequest(`/auth/login`, {
      method: "POST",
      body: JSON.stringify(payload),
      credentials: "include", // Essential for saving the refresh cookie
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.message || "Login failed");

    return data;
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      status: error.status || 500,
    };
  }
}

export async function signUpUser(payload: RegisterRequest): Promise<ApiResponse<RegisterResponse>> {
  try {
    const response = await apiRequest("/auth/register/user", {
      method: "POST",
      body: JSON.stringify(payload),
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.message || "Registration failed");
    return {
      success: true,
      data,
      status: response.status,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      status: error.status || 500,
    };
  }
}

export async function signUpOrg(payload: RegisterRequest): Promise<ApiResponse<RegisterResponse>> {
  try {
    const response = await apiRequest("/auth/register/admin", {
      method: "POST",
      body: JSON.stringify(payload),
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.message || "Registration failed");
    return {
      success: true,
      data,
      status: response.status,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      status: error.status || 500,
    };
  }
}

export async function logout() {
  try {
    const response = await apiRequest("/auth/logout", {
      method: "POST",
    });

    if (response.status === 404) {
      return { success: true, status: 404 };
    }

    const data = await response.json();
    if (!response.ok) throw new Error("Logout failed");

    return {
      success: true,
      data,
      status: response.status,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      status: error.status || 500,
    };
  }
}

export async function refreshToken(payload?: RefreshRequest): Promise<ApiResponse<RefreshResponse>> {
  try {
    const response = await fetch(`${baseUrl}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      ...(payload && { body: JSON.stringify(payload) }),
    });

    const data = await response.json();

    if (!response.ok)
      throw new Error(data.message || "Failed to refresh token");

    // Backend returns { success, accessToken, refreshToken, user } at top level.
    // Wrap in { success, data } so AuthProvider can extract via result.data.accessToken.
    return { success: true, data };
  } catch (error: any) {
    const isAuthError =
      error.message?.toLowerCase().includes("unauthorized") ||
      error.message?.includes("401");
    return {
      success: false,
      error: error.message,
      status: isAuthError ? 401 : error.status || 500,
    };
  }
}

export async function verifyOTP(payload: VerifyEmailOTPRequest): Promise<ApiResponse<VerifyEmailOTPResponse>> {
  try {
    const response = await fetch(`${baseUrl}/auth/verify-email`, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Verification failed");

    return {
      success: true,
      data,
      status: response.status,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      status: error.status || 500,
    };
  }
}

export async function resendOTP(payload: ResendOTPRequest): Promise<ApiResponse<RegisterResponse>> {
  try {
    const response = await fetch(`${baseUrl}/auth/resend-otp`, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to resend OTP");

    return {
      success: true,
      data,
      status: response.status,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      status: error.status || 500,
    };
  }
}

export async function forgotPassword(payload: ForgotPasswordRequest) {
  try {
    const response = await fetch(`${baseUrl}/auth/forgot-password`, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    const data = await response.json();
    if (!response.ok)
      throw new Error(data.message || "Failed to send reset link");

    return {
      success: true,
      data,
      status: response.status,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      status: error.status || 500,
    };
  }
}

export async function resetPassword(payload: ResetPasswordRequest) {
  try {
    const response = await fetch(`${baseUrl}/auth/reset-password`, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    const data = await response.json();
    if (!response.ok)
      throw new Error(data.message || "Failed to reset password");

    return {
      success: true,
      data,
      status: response.status,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      status: error.status || 500,
    };
  }
}

export function changePassword(payload: any) {
  return apiPost("/auth/change-password", payload);
}

export function googleSignIn(payload: GoogleSignInRequest) {
  return apiPost<GoogleSignInResponse>("/auth/google/signin", payload);
}

export function verifyInviteToken(payload: VerifyInviteRequest) {
  return apiPost<VerifyInviteResponse>("/auth/invite/verify", payload);
}

export function acceptInvite(payload: AcceptInviteRequest) {
  return apiPost<AcceptInviteResponse>("/auth/invite/accept", payload);
}
