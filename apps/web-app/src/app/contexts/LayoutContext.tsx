import React, { createContext, useContext, useState } from "react";

interface AppNotification {
  id: string;
  title: string;
  status: string;
  icon?: string;
  bg?: string;
  color?: string;
  time?: string;
  description?: string;
  type?: string;
}

interface LayoutContextType {
  title: string;
  subtitle?: string;
  setHeader: (title: string, subtitle?: string) => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  notifications: AppNotification[];
  addNotification: (notification: Omit<AppNotification, "id" | "status">) => void;
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
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
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

  const addNotification = (n: Omit<AppNotification, "id" | "status">) => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setNotifications((prev) => {
      // Prevent duplicates of the same type of streak message on the same day
      const isDuplicate = prev.some(
        (existing) =>
          existing.title === n.title &&
          new Date(Number(existing.id.split("-")[0])).toDateString() ===
            new Date().toDateString(),
      );
      if (isDuplicate) return prev;
      const newNotification: AppNotification = { ...n, id, status: "unread" };
      return [newNotification, ...prev];
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

// eslint-disable-next-line react-refresh/only-export-components
export function useLayout() {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error("useLayout must be used within a LayoutProvider");
  }
  return context;
}
