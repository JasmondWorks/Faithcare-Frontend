import {
  Bell,
  Menu,
  BookOpen,
  MessageSquare,
  UserPlus,
  Heart,
  Flame,
  TrendingUp,
  Timer,
  CheckCircle,
  UserCheck,
  Award,
  Users,
  ChevronRight,
} from "lucide-react";
import { useLayout } from "../contexts/LayoutContext";
import * as React from "react";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";

import { getJournalEntries } from "@/api/individual/individual";
import { useAuth } from "../providers/AuthProvider";
import { useNavigate } from "react-router-dom";
import { useSearch } from "../contexts/SearchContext";
import { Button } from "@/components/ui/button";
import { useFocusTimer } from "../contexts/FocusTimerContexts";


const iconMap: Record<string, React.ElementType> = {
  Heart,
  MessageSquare,
  UserPlus,
  Flame,
  BookOpen,
  TrendingUp,
  Timer,
  CheckCircle,
  UserCheck,
  Award,
};

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet";
import { getCommunities, getFirstTimers, getPrayerRequests } from "@/api/organization/church";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

interface SearchItem {
  id?: string;
  _id?: string;
  fullName?: string;
  name?: string;
  description?: string;
  request?: string;
  title?: string;
  content?: string;
}

interface SearchResults {
  members: SearchItem[];
  prayers: SearchItem[];
  communities: SearchItem[];
  journals: SearchItem[];
}



export function Header({ title, subtitle }: HeaderProps) {
  const {
    toggleSidebar,
    notifications,
    markAllNotificationsAsRead,
    markNotificationAsRead,
  } = useLayout();
  const { user } = useAuth();
  const { searchTerm, setSearchTerm } = useSearch();
  const { timeLeft, totalDuration, isRunning, formatTime } = useFocusTimer();
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [showResults, setShowResults] = React.useState(false);
  const searchRef = React.useRef<HTMLDivElement>(null);
  const mobileSearchRef = React.useRef<HTMLDivElement>(null);
  const [dropdownPos, setDropdownPos] = React.useState({
    top: 0,
    left: 0,
    width: 0,
  });

  const navigate = useNavigate();
  const organizationId = user?.organizationId || "";
  const userType =
    (localStorage.getItem("userType") as "individual" | "organization") ||
    "individual";

  // Pre-fetch global data for instant results
  const { data: firstTimersResponse } = useQuery({
    queryKey: ["global-first-timers"],
    queryFn: () => getFirstTimers(),
    enabled: userType === "organization",
  });

  const { data: prayersResponse } = useQuery({
    queryKey: ["global-prayers"],
    queryFn: () => getPrayerRequests(),
    enabled: userType === "organization",
  });

  const { data: communitiesResponse } = useQuery({
    queryKey: ["global-communities", organizationId],
    queryFn: () => getCommunities(organizationId),
    enabled: userType === "organization" && !!organizationId,
  });

  const { data: journalsResponse } = useQuery({
    queryKey: ["global-journals", user?.id],
    queryFn: () => getJournalEntries({ userId: user?.id || "" }),
    enabled: userType === "individual" && !!(user?.id),
  });

  const extractDataArray = (response: unknown): SearchItem[] => {
    if (!response) return [];
    if (Array.isArray(response)) return response as SearchItem[];
    const obj = response as {
      data?: SearchItem[] | { data?: SearchItem[]; entries?: SearchItem[] };
    };
    if (Array.isArray(obj.data)) return obj.data;
    const inner = obj.data as
      | { data?: SearchItem[]; entries?: SearchItem[] }
      | undefined;
    if (inner?.data && Array.isArray(inner.data)) return inner.data;
    if (inner?.entries && Array.isArray(inner.entries)) return inner.entries;
    return [];
  };

  const searchResults = React.useMemo(() => {
    if (!searchTerm || searchTerm.length < 2) return null;
    const results: SearchResults = {
      members: [],
      prayers: [],
      communities: [],
      journals: [],
    };

    if (userType === "organization") {
      results.members = extractDataArray(firstTimersResponse)
        .filter((m) =>
          (m.fullName || m.name || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()),
        )
        .slice(0, 3);
      results.prayers = extractDataArray(prayersResponse)
        .filter(
          (p) =>
            (p.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.description || p.request || "")
              .toLowerCase()
              .includes(searchTerm.toLowerCase()),
        )
        .slice(0, 3);
      results.communities = extractDataArray(communitiesResponse)
        .filter((c) =>
          (c.name || "").toLowerCase().includes(searchTerm.toLowerCase()),
        )
        .slice(0, 3);
    } else {
      results.journals = extractDataArray(journalsResponse)
        .filter(
          (j) =>
            (j.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (j.content || "").toLowerCase().includes(searchTerm.toLowerCase()),
        )
        .slice(0, 3);
    }
    return Object.values(results).some((arr) => arr.length > 0)
      ? results
      : null;
  }, [
    searchTerm,
    firstTimersResponse,
    prayersResponse,
    communitiesResponse,
    journalsResponse,
    userType,
  ]);

  React.useEffect(() => {
    const activeRef = window.innerWidth >= 768 ? searchRef : mobileSearchRef;
    if (showResults && activeRef.current) {
      const rect = activeRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
      });
    }
  }, [showResults, searchTerm]);

  React.useEffect(() => {
    if (searchTerm.length >= 2) setShowResults(true);
    else setShowResults(false);
  }, [searchTerm]);

  const filteredNotifications = notifications.filter(
    (n) => n.type === userType,
  );
  const hasUnread = filteredNotifications.some((n) => n.status === "unread");
  const allRead =
    filteredNotifications.length > 0 &&
    filteredNotifications.every((n) => n.status === "read");

  return (
    <header className="border-b border-border px-4 md:px-8 py-3 w-full sticky top-0 z-50 backdrop-blur-md bg-card/95 shadow-sm shadow-gray-300/30">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleSidebar}
            className="lg:hidden border-border"
          >
            <Menu className="w-6 h-6 text-foreground" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-lg md:text-2xl font-bold text-foreground truncate tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs md:text-sm text-muted-foreground mt-0.5 truncate hidden sm:block opacity-70">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4 flex-1 justify-end">
          {/* Desktop Search */}
          <div
            ref={searchRef}
            className="relative hidden md:flex items-center gap-2 max-w-sm w-full lg:max-w-md"
          >
            {/* <div className="relative flex-1 group">
              <Search
                className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${searchTerm ? "text-accent" : "text-muted-foreground group-focus-within:text-accent"}`}
              />
              <input
                type="text"
                value={searchTerm}
                onFocus={() => searchTerm.length >= 2 && setShowResults(true)}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search everything..."
                className="w-full pl-11 pr-12 h-[52px] bg-secondary/30 border border-neutral-200 rounded-lg text-sm text-foreground transition-all focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent/40 placeholder:text-muted-foreground/50 font-medium"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setSearchTerm("");
                    setShowResults(false);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full"
                >
                  <X className="w-3 h-3 text-muted-foreground" />
                </Button>
              )}
            </div> */}
          </div>

          {/* Mobile Search - Now with Button */}
          {/* <div
            ref={mobileSearchRef}
            className="relative md:hidden flex items-center gap-1 flex-1 max-w-[180px]"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={searchTerm}
                onFocus={() => searchTerm.length >= 2 && setShowResults(true)}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full pl-8 pr-2 h-10 bg-secondary/30 border border-neutral-200 rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 font-medium"
              />
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            </div>
          </div> */}


          {(isRunning || (timeLeft > 0 && timeLeft < totalDuration)) && (
            <Button
              variant="outline"
              onClick={() => navigate("/focus-timer")}
              className={`flex items-center gap-2 border-border/80 px-3 py-1.5 h-10 rounded-lg hover:bg-muted transition-all select-none ${isRunning
                ? "text-accent bg-accent/5 border-accent/20 animate-pulse"
                : "text-muted-foreground"
                }`}
            >
              <Timer className={`w-4 h-4 ${isRunning ? "text-accent" : "text-muted-foreground"}`} />
              <span className="text-sm font-semibold tabular-nums">{formatTime(timeLeft)}</span>
            </Button>
          )}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowNotifications(true)}
            className="relative border-neutral-200 group active:scale-95"
          >
            <Bell className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
            {(hasUnread || allRead) && (
              <span
                className={`absolute top-2 right-2 w-2 h-2 rounded-full ring-2 ring-card transition-colors duration-500 ${hasUnread ? "bg-red-500 animate-pulse" : "bg-green-500"}`}
              ></span>
            )}
          </Button>
        </div>
      </div>

      {/* PORTAL FOR RESULTS - Only show if we actually have results to display */}
      {showResults &&
        searchTerm.length >= 2 &&
        searchResults &&
        Object.values(searchResults).some((arr) => arr?.length > 0) &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: dropdownPos.top,
              left: dropdownPos.left,
              width: Math.max(dropdownPos.width, 280),
              zIndex: 9999,
              transform: window.innerWidth < 768 ? "translateX(-40px)" : "none",
            }}
            className="border border-neutral-200 rounded-lg shadow-[0_25px_60px_rgba(0,0,0,0.3)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 backdrop-blur-xl bg-card/98"
          >
            <div className="max-h-[400px] overflow-y-auto p-4 custom-scrollbar">
              <div className="space-y-6">
                {searchResults.members?.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-accent uppercase tracking-widest px-3 mb-3 flex items-center gap-2">
                      <UserPlus className="w-3.5 h-3.5" /> Members
                    </p>
                    <div className="space-y-1">
                      {searchResults.members.map((m) => (
                        <Button
                          key={m.id || m._id}
                          variant="ghost"
                          onClick={() => {
                            navigate("/first-timers");
                            setShowResults(false);
                            setSearchTerm("");
                          }}
                          className="w-full flex items-center justify-between p-3 h-auto rounded-2xl hover:bg-accent/5 transition-all group text-left font-normal"
                        >
                          <span className="text-sm font-bold text-foreground group-hover:text-accent">
                            {m.fullName || m.name}
                          </span>
                          <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                {searchResults.prayers?.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-accent uppercase tracking-widest px-3 mb-3 flex items-center gap-2">
                      <Heart className="w-3.5 h-3.5" /> Prayer Requests
                    </p>
                    <div className="space-y-1">
                      {searchResults.prayers.map((p) => (
                        <Button
                          key={p.id || p._id}
                          variant="ghost"
                          onClick={() => {
                            navigate("/prayer-requests");
                            setShowResults(false);
                            setSearchTerm("");
                          }}
                          className="w-full p-3 h-auto rounded-2xl hover:bg-accent/5 transition-all group text-left font-normal block"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-bold text-foreground group-hover:text-accent">
                              {p.name || "Anonymous"}
                            </span>
                            <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
                          </div>
                          <p className="text-xs text-muted-foreground truncate opacity-70 italic font-medium">
                            "{p.description || p.request}"
                          </p>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                {searchResults.communities?.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-accent uppercase tracking-widest px-3 mb-3 flex items-center gap-2">
                      <Users className="w-3.5 h-3.5" /> Communities
                    </p>
                    <div className="space-y-1">
                      {searchResults.communities.map((c) => (
                        <Button
                          key={c.id || c._id}
                          variant="ghost"
                          onClick={() => {
                            navigate("/communities");
                            setShowResults(false);
                            setSearchTerm("");
                          }}
                          className="w-full flex items-center justify-between p-3 h-auto rounded-2xl hover:bg-accent/5 transition-all group text-left font-normal"
                        >
                          <span className="text-sm font-bold text-foreground group-hover:text-accent">
                            {c.name}
                          </span>
                          <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                {searchResults.journals?.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-accent uppercase tracking-widest px-3 mb-3 flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5" /> Journal Entries
                    </p>
                    <div className="space-y-1">
                      {searchResults.journals.map((j) => (
                        <Button
                          key={j.id || j._id}
                          variant="ghost"
                          onClick={() => {
                            navigate("/sunday-journal");
                            setShowResults(false);
                            setSearchTerm("");
                          }}
                          className="w-full p-3 h-auto rounded-2xl hover:bg-accent/5 transition-all group text-left font-normal block"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-bold text-foreground group-hover:text-accent">
                              {j.title}
                            </span>
                            <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
                          </div>
                          <p className="text-xs text-muted-foreground truncate opacity-70 italic font-medium">
                            "{j.content}"
                          </p>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="p-3 bg-muted/5 border-t border-border flex items-center justify-between">
              <p className="text-[9px] text-muted-foreground font-bold italic opacity-50">
                Search Results
              </p>
              <Button
                variant="link"
                onClick={() => setShowResults(false)}
                className="h-auto p-0 text-[10px] font-bold text-accent uppercase"
              >
                Hide
              </Button>
            </div>
          </div>,
          document.body,
        )}

      {/* Existing Drawers */}
      <Sheet open={showNotifications} onOpenChange={setShowNotifications}>
        <SheetContent
          side="right"
          className="w-[90%] sm:max-w-md p-0 rounded-l-[40px] border-l border-border shadow-2xl"
        >
          <SheetHeader className="p-8 border-b border-border bg-accent/5">
            <SheetTitle className="text-2xl font-bold tracking-tight">
              Notifications
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto">
            {filteredNotifications.length > 0 ? (
              <div className="divide-y divide-border">
                {filteredNotifications.map((n) => {
                  const Icon = iconMap[n.icon as string] || Bell;
                  return (
                    <div
                      key={n.id}
                      onClick={() => markNotificationAsRead(n.id)}
                      className={`p-6 transition-all cursor-pointer group relative ${n.status === "unread" ? "bg-accent/5" : "hover:bg-muted/30"}`}
                    >
                      {n.status === "unread" && (
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-accent"></div>
                      )}
                      <div className="flex gap-4">
                        <div
                          className={`w-12 h-12 rounded-2xl ${n.bg} flex items-center justify-center shrink-0 shadow-sm border border-border/50`}
                        >
                          <Icon className={`w-6 h-6 ${n.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <p
                              className={`text-sm font-bold truncate ${n.status === "unread" ? "text-foreground" : "text-muted-foreground"}`}
                            >
                              {n.title}
                            </p>
                            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter bg-muted px-2 py-0.5 rounded whitespace-nowrap">
                              {n.time}
                            </span>
                          </div>
                          <p
                            className={`text-xs leading-relaxed font-medium ${n.status === "unread" ? "text-foreground/80" : "text-muted-foreground"}`}
                          >
                            {n.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-96 p-8 text-center">
                <p className="text-muted-foreground italic font-medium">
                  No notifications
                </p>
              </div>
            )}
          </div>
          <div className="p-8 border-t border-border mt-auto bg-card">
            <Button
              onClick={() => {
                markAllNotificationsAsRead();
                setShowNotifications(false);
              }}
              className="w-full py-4 rounded-lg shadow-lg"
            >
              Mark all as read
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
