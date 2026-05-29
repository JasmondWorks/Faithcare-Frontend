import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";
import UnauthorizedPage from "@/app/pages/UnauthorizedPage";
import { useQuery } from "@tanstack/react-query";
import { getMyMetadata } from "@/api/individual/individual";
import { LoadingScreen } from "./LoadingScreen";

type AllowedRole = "individual" | "organization"

interface ProtectedRouteProps {
  /** Role strings that are allowed to access this route (case-insensitive).
   *  Omit to allow any authenticated user regardless of role. */
  allowedRoles?: AllowedRole[];
  /** Optional children render as a layout wrapper. Omit when used as a
   *  plain <Route element> so it falls through to <Outlet />. */
  children?: React.ReactNode;
}

export default function ProtectedRoute({
  allowedRoles,
  children,
}: ProtectedRouteProps) {
  const { user, isLoading: isAuthLoading, userType } = useAuth();
  const location = useLocation();

  // ── Metadata Fetch for Individuals ──
  const { data: metadataRes, isLoading: isMetadataLoading } = useQuery({
    queryKey: ["myMetadata"],
    queryFn: getMyMetadata,
    enabled:
      !!user && userType === "individual",
  });

  // Wait for auth state to resolve before deciding
  if (isAuthLoading || isMetadataLoading) {
    return null; // Or a smaller spinner if preferred, but null is consistent with GuestRoute
  }

  // Not authenticated or user data missing redirect to sign-in
  if (!user) {
    return <Navigate to="/sign-in" replace />;
  }

  // Role guard only applied when allowedRoles is explicitly provided
  if (
    allowedRoles &&
    allowedRoles.length > 0 &&
    (!userType || !allowedRoles.includes(userType as AllowedRole))
  ) {
    return <UnauthorizedPage />;
  }



  // ── Onboarding Checks ──
  // const isOnboarded = user?.isOnboarded;
  const hasMetadata = metadataRes?.success && metadataRes.data !== null;

  // Organization Onboarding
  if (userType === "organization") {
    const needsOrgOnboarding = !user?.organizationId;

    if (needsOrgOnboarding) {
      if (location.pathname !== "/organization-onboarding") {
        return (
          <Navigate
            to="/organization-onboarding"
            replace
            state={{ from: location }}
          />
        );
      }
    } else if (location.pathname === "/organization-onboarding") {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Individual Onboarding
  if (userType === "individual") {
    // If not explicitly onboarded, we MUST wait for metadata verification

    if (hasMetadata !== true) {
      if (isMetadataLoading || metadataRes === undefined) {
        return <LoadingScreen />;
      }

      // If we finished loading and still have no metadata and not onboarded
      if (!hasMetadata) {
        if (location.pathname !== "/individual-onboarding") {
          return (
            <Navigate
              to="/individual-onboarding"
              replace
              state={{ from: location }}
            />
          );
        }
      }
    }

    // If already onboarded (either by flag or by having metadata), 
    // prevent going back to onboarding page
    if (hasMetadata && location.pathname === "/individual-onboarding") {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children ? <>{children}</> : <Outlet />;
}
