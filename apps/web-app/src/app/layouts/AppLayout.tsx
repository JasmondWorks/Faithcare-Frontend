import React from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { Header } from "../components/Header";
import { LayoutProvider, useLayout } from "../contexts/LayoutContext";
import { SearchProvider } from "../contexts/SearchContext";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth } from "../providers/AuthProvider";

function LayoutShell() {
  const { isSidebarOpen, closeSidebar, title, subtitle } = useLayout();

  // Persist theme â€” layout concern, not an auth concern
  React.useEffect(() => {
    const theme = localStorage.getItem("theme");
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, []);

  const { user, userType } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-[70]
          transition-transform duration-300 transform
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          w-64 bg-card border-r border-border
        `}
      >
        <Sidebar userType={userType!} />
      </aside>

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Persistent topbar â€” reads title/subtitle from LayoutContext */}
        <Header title={title} subtitle={subtitle} />

        {/* Page content â€” consistent outer spacing for all protected pages */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="p-4 md:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

/**
 * AppLayout combines two separate concerns:
 *   1. ProtectedRoute  â€” authentication + role-based access guard
 *   2. LayoutShell     â€” sidebar, topbar, and content area
 *
 * Providers are initialised only after authentication passes, so
 * LayoutContext and SearchContext are never set up for unauthenticated renders.
 */
export default function AppLayout() {
  return (
    <LayoutProvider>
      <SearchProvider>
        <LayoutShell />
      </SearchProvider>
    </LayoutProvider>
  );
}
