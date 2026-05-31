import { createContext, useContext, useState, useEffect } from "react";
import {
  refreshToken as callRefreshTokenAPI,
  logout as callLogoutAPI,
} from "@/api/auth/auth";
import { useQueryClient } from "@tanstack/react-query";
import { setInMemoryToken } from "@/api/helper";
import { LoadingScreen } from "../components/LoadingScreen";

type JwtPayload = Record<string, unknown>;

type InitializeSessionResult =
  | { success: true; user: User; token: string }
  | { success: false; error?: unknown };

interface AuthContextType {
  user: User | null;
  userType: "individual" | "organization" | null;
  setUser: (user: User) => void;
  initializeSession: (
    providedUser?: User,
    providedToken?: string,
  ) => Promise<InitializeSessionResult>;
  isLoading: boolean;
  logout: () => Promise<void>;
}
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | null>(null);

type User = {
  id: string,
  name: string,
  email: string,
  role: string,
  isEmailVerified: boolean,
  isAdminVerified: boolean,
  isOnboarded: boolean,
  isInvited: boolean,
  isOrgCreator: boolean,
  organizationId: string | null,
  pendingOrganizationId: string | null,
  createdAt: string,
  sub?: string,
  organizationName?: string
}

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  // Helper to determine userType
  const determineUserType = (
    userData: User | null,
  ): "individual" | "organization" => {
    if (
      userData?.organizationId ||
      userData?.role === "ADMIN" ||
      userData?.role === "ORGANIZATION" ||
      userData?.organizationName
    ) {
      return "organization";
    }
    return "individual";
  };

  const decodeJWT = (token: string): JwtPayload | null => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        window
          .atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join(""),
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error("JWT Decode failed", e);
      return null;
    }
  };

  // Strip standard JWT registered claims, keeping only user-related fields.
  const stripJwtClaims = (payload: JwtPayload): JwtPayload => {
    const { iat, exp, nbf, jti, ...rest } = payload;
    void iat;
    void exp;
    void nbf;
    void jti;
    return rest;
  };

  const initializeSession = async (
    providedUser?: User,
    providedToken?: string,
  ): Promise<InitializeSessionResult> => {
    try {
      if (providedUser && providedToken) {
        const decoded = decodeJWT(providedToken);
        const cleanPayload = stripJwtClaims(decoded || {});
        const mergedUser = {
          ...cleanPayload,
          ...(providedUser || {}),
        } as User;

        setInMemoryToken(providedToken);
        setUser(mergedUser);
        queryClient.clear();
        setIsLoading(false);
        return { success: true, user: mergedUser, token: providedToken };
      }

      const result = await callRefreshTokenAPI();

      // refreshToken() returns { success, data: <server body> } where the server
      // body is { success, accessToken, refreshToken, user }.
      const raw = result.data as
        | { accessToken?: string; data?: { accessToken?: string } }
        | undefined;
      const token: string | undefined = raw?.accessToken ?? raw?.data?.accessToken;

      if (result.success && token) {
        // Derive the user from the JWT payload only — the refresh response
        // carries no user object, only the new access token.
        const decoded = decodeJWT(token);
        const cleanPayload = stripJwtClaims(decoded || {});

        setInMemoryToken(token);
        setUser(cleanPayload as User);
        queryClient.clear();
        return { success: true, user: cleanPayload as User, token };
      } else {
        setInMemoryToken(null);
        setUser(null);
        return { success: false };
      }
    } catch (error) {
      console.error("Failed to initialize session:", error);
      setInMemoryToken(null);
      setUser(null);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await callLogoutAPI();
    } catch (error) {
      console.warn("API logout call failed", error);
    } finally {
      setInMemoryToken(null);
      setUser(null);
      queryClient.clear();
    }
  };

  useEffect(() => {
    initializeSession();
  }, []);

  if (isLoading) return <LoadingScreen />;

  return (
    <AuthContext.Provider
      value={{
        user,
        userType: user ? determineUserType(user) : null,
        setUser,
        initializeSession,
        isLoading,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthProvider;
