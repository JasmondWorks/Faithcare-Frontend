"use client";

import { useState, useEffect } from "react";
import { SparklesIcon } from "lucide-react";

// You can configure this in .env.local
const webAppUrl =
  process.env.NEXT_PUBLIC_WEB_APP_URL ?? "http://localhost:5173";
const apiUrl =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://faithcare-13a2dc003ee9.herokuapp.com/api/v1";

export function Navbar() {
  const [user, setUser] = useState<{ id: string; name: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Attempt to silently refresh/fetch user to detect auth status
    const checkAuth = async () => {
      try {
        const refreshResponse = await fetch(`${apiUrl}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (!refreshResponse.ok) return;

        const refreshData = await refreshResponse.json();
        // Handle both { data: { accessToken } } and { data: { data: { accessToken } } }
        const sessionData = refreshData?.data?.data ?? refreshData?.data;
        const accessToken =
          typeof sessionData === "string" ? sessionData : sessionData?.accessToken;

        if (!accessToken) return;

        const userResponse = await fetch(`${apiUrl}/users/me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          credentials: "include",
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          const profile = userData?.data?.data ?? userData?.data ?? userData;
          const name = profile?.fullName || profile?.name || "";
          const id = profile?.id || profile?._id || "";
          setUser({ id, name });
        }
      } catch {
        // Network error — treat as logged out
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 bg-background/85 backdrop-blur-xl z-50 border-b border-border/40 px-6 h-16 flex items-center">
      <div className="max-w-6xl mx-auto flex items-center justify-between w-full">
        <div className="flex items-center gap-2 transition-spring hover:opacity-80">
          <SparklesIcon className="w-7 h-7 text-accent" />
          <span className="text-xl font-bold text-foreground tracking-tight">
            FaithCare
          </span>
        </div>
        <div className="flex items-center gap-6">
          {!isLoading && user ? (
            <a
              href={`${webAppUrl}/dashboard`}
              className="text-sm font-semibold text-foreground rounded-full transition-spring flex items-center gap-3"
            >
              <div className="w-7 h-7 rounded-full bg-accent text-white flex items-center justify-center text-xs">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              Dashboard
            </a>
          ) : !isLoading ? (
            <>
              <a
                href={`${webAppUrl}/sign-in`}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign In
              </a>
              <a
                href={`${webAppUrl}/sign-up-choice`}
                className="text-sm font-semibold bg-foreground text-background px-6 py-3 rounded-lg hover:bg-foreground/90 transition-spring hover:-translate-y-px hover:shadow-card active:translate-y-0 active:shadow-none"
              >
                Get Started
              </a>
            </>
          ) : (
            <div className="flex items-center gap-6">
              <div className="w-16 h-6 bg-muted animate-pulse rounded-md" />
              <div className="w-28 h-10 bg-muted animate-pulse rounded-lg" />
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
