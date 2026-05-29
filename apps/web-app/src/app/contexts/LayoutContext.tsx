import React, { createContext, useContext, useState } from "react";

interface LayoutContextType {
  title: string;
  subtitle?: string;
  setHeader: (title: string, subtitle?: string) => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  notifications: any[];
  addNotification: (notification: any) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [title, setTitleState] = useState("Dashboard");
  const [subtitle, setSubtitleState] = useState<string | undefined>(
    "Welcome back",
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>(() => {
    const saved = localStorage.getItem("app_notifications");
    return saved ? JSON.parse(saved) : [];
  });

  // Persist notifications and cleanup mock ones
  React.useEffect(() => {
    const mockTitles = [
      "Streak Maintained!",
      "New Journal Entry",
      "New Prayer Request",
      "Follow-up Due",
      "New Member Alert",
      "New First Timer",
      "Journaling Streak",
      "First Login Streak!",
      "First Login Streak",
      "Login Maintained",
    ];

    // One-time cleanup of all mock data
    setNotifications((prev) => {
      const filtered = prev.filter((n) => !mockTitles.includes(n.title));
      if (filtered.length !== prev.length) {
        localStorage.setItem("app_notifications", JSON.stringify(filtered));
        return filtered;
      }
      return prev;
    });
  }, []);

  // Sync to localStorage whenever notifications change
  React.useEffect(() => {
    localStorage.setItem("app_notifications", JSON.stringify(notifications));
  }, [notifications]);

  const setHeader = (newTitle: string, newSubtitle?: string) => {
    setTitleState(newTitle);
    setSubtitleState(newSubtitle);
  };

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  const addNotification = (n: any) => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setNotifications((prev) => {
      // Prevent duplicates of the same type of streak message on the same day
      const isDuplicate = prev.some(
        (existing) =>
          existing.title === n.title &&
          new Date(existing.id.split("-")[0] * 1).toDateString() ===
            new Date().toDateString(),
      );
      if (isDuplicate) return prev;
      return [{ ...n, id, status: "unread" }, ...prev];
    });
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status: "read" } : n)),
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, status: "read" })));
  };

  return (
    <LayoutContext.Provider
      value={{
        title,
        subtitle,
        setHeader,
        isSidebarOpen,
        toggleSidebar,
        closeSidebar,
        notifications,
        addNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error("useLayout must be used within a LayoutProvider");
  }
  return context;
}
