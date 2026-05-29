import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";

interface GuestRouteProps {
  children?: React.ReactNode;
}

export default function GuestRoute({ children }: GuestRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Wait for auth state to resolve before deciding — prevents a flash of the
  // guest UI when the user has a valid session being restored via refresh token.
  if (isLoading) return null;

  if (user) {
    const from = location.state?.from?.pathname || "/dashboard";
    return <Navigate to={from} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
