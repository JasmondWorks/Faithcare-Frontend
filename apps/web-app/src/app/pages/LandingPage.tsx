import { useEffect } from "react";

export function LandingPage() {
  const landingPage = import.meta.env.VITE_LANDING_PAGE_URL;

  console.log(landingPage)

  useEffect(() => {
    if (landingPage) {
      window.location.href = landingPage;
    }
  }, [landingPage]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
