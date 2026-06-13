import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";

export function LandingPage() {
  const landingPage = import.meta.env.VITE_LANDING_PAGE_URL;
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;
    if (user) {
      navigate("/dashboard", { replace: true });
      return;
    }
    if (landingPage) {
      window.location.href = landingPage;
    }
  }, [user, isLoading, landingPage, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
