import { useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { ScrollText, BookOpen, ListChecks, Bookmark, History } from "lucide-react";
import { useLayout } from "../../contexts/LayoutContext";
import { cn } from "@/lib/utils";

const TABS = [
  { to: "/scripture",           label: "Today",     icon: ScrollText,  exact: true  },
  { to: "/scripture/read",      label: "Read",      icon: BookOpen,    exact: false },
  { to: "/scripture/plans",     label: "Plans",     icon: ListChecks,  exact: false },
  { to: "/scripture/bookmarks", label: "Bookmarks", icon: Bookmark,    exact: false },
  { to: "/scripture/history",   label: "History",   icon: History,     exact: false },
];

export default function ScriptureLayout() {
  const { setHeader } = useLayout();
  const location = useLocation();

  const activeTab = TABS.find((t) =>
    t.exact ? location.pathname === t.to : location.pathname.startsWith(t.to),
  ) ?? TABS[0];

  useEffect(() => {
    const subtitles: Record<string, string> = {
      "/scripture":           "Your daily reading and reflection.",
      "/scripture/read":      "Browse and read any chapter.",
      "/scripture/plans":     "Start or continue a reading plan.",
      "/scripture/bookmarks": "Verses you've saved.",
      "/scripture/history":   "Your reading streak and past entries.",
    };
    setHeader("Scripture", subtitles[activeTab.to] ?? "");
  }, [activeTab.to]);

  return (
    <div className="flex flex-col gap-0 -mt-4 md:-mt-6 lg:-mt-8 min-h-[calc(100vh-4rem)]">
      {/* Sub-navigation tab bar */}
      <nav className="flex items-center gap-1 px-0 pt-4 md:pt-6 pb-4 border-b border-border/50 overflow-x-auto scrollbar-none">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.exact
            ? location.pathname === tab.to
            : location.pathname.startsWith(tab.to);

          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.exact}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all shrink-0",
                isActive
                  ? "bg-accent text-white shadow-md shadow-accent/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </NavLink>
          );
        })}
      </nav>

      {/* Page content */}
      <div className="flex-1 pt-6">
        <Outlet />
      </div>
    </div>
  );
}
