import React, { useEffect } from "react";
import {
  BookOpen,
  Sparkles,
  Timer,
  TrendingUp,
} from "lucide-react";
import { useLayout } from "../contexts/LayoutContext";
import { useAuth } from "../providers/AuthProvider";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getMetadataByUserId,
  getJournalEntries,
  getTimerSessions,
  updateIndividualMetadata,
  completeIndividualOnboarding,
  getMyMetadata,
} from "@/api/individual/individual";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useSearch } from "../contexts/SearchContext";
import { Card, CardTitle, CardDescription } from "./ui/card";
import { Button } from "@/components/ui/button";

interface MetadataItem {
  _id?: string;
  id?: string;
  dailyBibleReadingStreakCount?: number;
  streak?: number;
  scripturesCount?: number;
  readingProgress?: number;
  lastLoginDate?: string;
}

interface JournalItem {
  _id?: string;
  id?: string;
  title?: string;
  scriptureReference?: string;
  content?: string;
  createdAt: string;
}

export function IndividualDashboard() {
  const { setHeader, addNotification } = useLayout();
  const { user, userType } = useAuth();

  useEffect(() => {
    setHeader("Dashboard");
  }, [user]);
  const { searchTerm } = useSearch();
  const queryClient = useQueryClient();



  const { data: metadataRes } = useQuery({
    queryKey: ["myMetadata"],
    queryFn: getMyMetadata,
    enabled:
      !!user && userType === "individual",
  });

  console.log(metadataRes)

  // Robust userId detection
  const userId = React.useMemo(() => {
    return user?.id || "";
  }, [user]);

  // 1. Fetch personal metadata (for streak and goals)
  const {
    data: metadataResponse,
    error: metadataError,
  } = useQuery({
    queryKey: ["individual-metadata", userId],
    queryFn: () => getMetadataByUserId(userId),
    enabled: !!userId,
  });

  // 2. Fetch Journals (to count and show latest)
  const { data: journalsResponse } = useQuery({
    queryKey: ["journals", userId],
    queryFn: () => getJournalEntries({ userId, limit: 10 }), // Fetch more to allow better search filtering on dashboard
    enabled: !!userId,
  });

  // 3. Fetch Focus Sessions (to count)
  const { data: timerResponse } = useQuery({
    queryKey: ["timer-sessions", userId],
    queryFn: () => getTimerSessions(userId),
    enabled: !!userId,
  });

  useEffect(() => {
    if (metadataError) {
      toast.error(
        "Failed to load spiritual profile:" +
          (metadataError instanceof Error
            ? metadataError.message
            : String(metadataError)),
      );
    }
  }, [metadataError]);

  const metadataRaw = metadataResponse?.data as
    | MetadataItem
    | MetadataItem[]
    | undefined;
  const metadata: MetadataItem | undefined = Array.isArray(metadataRaw)
    ? metadataRaw[0]
    : metadataRaw;

  const journalsRaw = journalsResponse?.data;
  const journals: JournalItem[] = Array.isArray(journalsRaw)
    ? (journalsRaw as JournalItem[])
    : ((journalsRaw as { data?: JournalItem[] } | undefined)?.data ?? []);

  // Apply Search Filtering to Journals on Dashboard
  const filteredJournals = journals.filter(
    (j) =>
      (j.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (j.scriptureReference || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );

  const timerRaw = timerResponse?.data;
  const timerSessions = Array.isArray(timerRaw) ? timerRaw : [];

  const journalCount =
    (journalsRaw as { meta?: { total?: number } } | undefined)?.meta?.total ??
    journals.length;
  const focusCount = timerSessions.length;

  const streak =
    metadata?.dailyBibleReadingStreakCount ??
    metadata?.streak ??
    (localStorage.getItem(`lastStreakUpdate_${userId}`) ? 1 : 0);

  const calculateJournalingStreak = (entries: JournalItem[]) => {
    if (!entries || entries.length === 0) return 0;
    const sortedEntries = [...entries].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    let streakCount = 0;
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const latestEntryDate = new Date(sortedEntries[0].createdAt);
    latestEntryDate.setHours(0, 0, 0, 0);
    const diffDaysFromToday = Math.round(
      (currentDate.getTime() - latestEntryDate.getTime()) /
      (1000 * 60 * 60 * 24),
    );
    if (diffDaysFromToday > 1) return 0;
    let lastCheckedDate = latestEntryDate;
    streakCount = 1;
    for (let i = 1; i < sortedEntries.length; i++) {
      const entryDate = new Date(sortedEntries[i].createdAt);
      entryDate.setHours(0, 0, 0, 0);
      const diff = Math.round(
        (lastCheckedDate.getTime() - entryDate.getTime()) /
        (1000 * 60 * 60 * 24),
      );
      if (diff === 1) {
        streakCount++;
        lastCheckedDate = entryDate;
      } else if (diff === 0) continue;
      else break;
    }
    return streakCount;
  };

  const journalingStreak = calculateJournalingStreak(journals);

  useEffect(() => {
    if (metadataResponse?.success && userId) {
      const metadataItem = Array.isArray(metadataResponse.data)
        ? metadataResponse.data[0]
        : metadataResponse.data;

      const currentStreak =
        metadataItem?.dailyBibleReadingStreakCount ?? metadataItem?.streak ?? 0;
      const metadataId = metadataItem?._id || metadataItem?.id;

      const today = new Date();
      const utcToday = Date.UTC(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
      );

      // Use DB lastLoginDate if available, fallback to localStorage
      const lastLoginStr =
        metadataItem?.lastLoginDate ||
        localStorage.getItem(`lastStreakUpdate_${userId}`);
      const lastUpdate = lastLoginStr ? new Date(lastLoginStr) : null;
      let utcLastUpdate = null;

      if (lastUpdate) {
        utcLastUpdate = Date.UTC(
          lastUpdate.getFullYear(),
          lastUpdate.getMonth(),
          lastUpdate.getDate(),
        );
      }

      // If already logged in today, do nothing
      if (utcLastUpdate === utcToday) return;

      if (!metadataItem) {
        completeIndividualOnboarding({
          dailyBibleReadingStreakCount: 1,
        }).then((res) => {
          if (res.success) {
            localStorage.setItem(
              `lastStreakUpdate_${userId}`,
              today.toISOString(),
            );
            queryClient.invalidateQueries({
              queryKey: ["individual-metadata", userId],
            });
            addNotification({
              title: "First Login Streak!",
              description:
                "We're glad to have you. Your journey of spiritual growth starts today.",
              time: "Just now",
              icon: "Sparkles",
              color: "text-accent",
              bg: "bg-accent/10",
              type: "individual",
            });
          }
        });
      } else {
        const diffDays =
          utcLastUpdate !== null
            ? Math.round((utcToday - utcLastUpdate) / (1000 * 60 * 60 * 24))
            : null;

        if (diffDays === null) {
          // Missing history entirely
          if (currentStreak === 0 && metadataId) {
            updateIndividualMetadata(metadataId, {
              dailyBibleReadingStreakCount: 1,
            }).then((res) => {
              if (res.success) {
                localStorage.setItem(
                  `lastStreakUpdate_${userId}`,
                  today.toISOString(),
                );
                queryClient.invalidateQueries({
                  queryKey: ["individual-metadata", userId],
                });
              }
            });
          } else if (metadataId) {
            // Streak preserved — no-op: streak count unchanged, timestamp tracked in localStorage only
            updateIndividualMetadata(metadataId, {
              dailyBibleReadingStreakCount: currentStreak,
            }).then((res) => {
              if (res.success) {
                localStorage.setItem(
                  `lastStreakUpdate_${userId}`,
                  today.toISOString(),
                );
                queryClient.invalidateQueries({
                  queryKey: ["individual-metadata", userId],
                });
              }
            });
          }
        } else if (diffDays === 1 && metadataId) {
          // Increment streak
          updateIndividualMetadata(metadataId, {
            dailyBibleReadingStreakCount: currentStreak + 1,
          }).then((res) => {
            if (res.success) {
              localStorage.setItem(
                `lastStreakUpdate_${userId}`,
                today.toISOString(),
              );
              queryClient.invalidateQueries({
                queryKey: ["individual-metadata", userId],
              });
              addNotification({
                title: "Login Maintained",
                description: `You've logged in for ${currentStreak + 1} consecutive days!`,
                time: "Just now",
                icon: "TrendingUp",
                color: "text-green-500",
                bg: "bg-green-500/10",
                type: "individual",
              });
            }
          });
        } else if (diffDays > 1 && metadataId) {
          // Reset streak
          updateIndividualMetadata(metadataId, {
            dailyBibleReadingStreakCount: 1,
          }).then((res) => {
            if (res.success) {
              localStorage.setItem(
                `lastStreakUpdate_${userId}`,
                today.toISOString(),
              );
              queryClient.invalidateQueries({
                queryKey: ["individual-metadata", userId],
              });
            }
          });
        }
      }
    }
  }, [metadataResponse, userId]);

  const journalProgress = Math.min(100, (journalCount / 7) * 100);
  const focusProgress = Math.min(100, (focusCount / 5) * 100);
  const readingProgress = metadata?.readingProgress || 0;

  const stats = [
    {
      title: "Login Streak",
      value: `${streak === 1 ? "1 day" : `${streak} days`}`,
      icon: TrendingUp,
      color: "#22c55e",
    },
    {
      title: "Journaling Streak",
      value: `${journalingStreak === 1 ? "1 day" : `${journalingStreak} days`}`,
      icon: BookOpen,
      color: "#d4a574",
    },
    {
      title: "Scriptures Read",
      value: (metadata?.scripturesCount || 0).toString(),
      icon: Sparkles,
      color: "#3b82f6",
    },
    {
      title: "Focus Sessions",
      value: focusCount.toString(),
      icon: Timer,
      color: "#a855f7",
    },
  ];


  return (
    <div className="space-y-6">
      <p>
        Welcome back,{" "}
        <span className="font-semibold">
          {`${user?.name || "Believer"}`}
        </span>
      </p>
      <div className="space-y-6 md:space-y-8 max-w-7xl mx-auto">
        {/* Welcome Section */}
        <Card className="relative overflow-hidden shadow-xl shadow-accent/5 p-5 sm:p-8">
          <div className="absolute top-0 right-0 p-6 sm:p-10 opacity-[0.03] dark:opacity-[0.07]">
            <Sparkles className="w-48 h-48 sm:w-64 sm:h-64 text-accent" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-start justify-between gap-6 sm:gap-8">
            <div className="flex-1 space-y-2">
              <CardTitle className="text-xl sm:text-2xl">
                Peace be with you.
              </CardTitle>
              <CardDescription className="text-sm sm:text-base max-w-5xl leading-relaxed opacity-80 pb-6">
                You've completed {journalCount} meditations this month. Your
                commitment to your spiritual walk is inspiring.
              </CardDescription>
              <Button
                href="/scripture"
                className="inline-flex px-8 sm:px-10 shadow-xl shadow-primary/20"
              >
                Today's Scripture
              </Button>
            </div>
          </div>
        </Card>

        {/* Live Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs sm:text-sm font-medium mb-1 sm:mb-2 text-accent-foreground/70">
                      {stat.title}
                    </p>
                    <h3 className="text-lg sm:text-xl font-bold leading-tight">
                      {stat.value}
                    </h3>
                  </div>
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${stat.color}15` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: stat.color }} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Progress and Journals */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Bible Entries (Real) */}
          <Card padding="lg">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-foreground flex items-center gap-3">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <BookOpen className="w-5 h-5 text-accent" />
                </div>
                {searchTerm ? `Search:"${searchTerm}"` : "Latest Meditations"}
              </h3>
              <Button
                asChild
                variant="ghost"
                className="h-auto p-0 text-[10px] text-accent uppercase tracking-widest bg-accent/5 px-3 py-1.5 rounded-full hover:bg-accent/10"
              >
                <Link to="/sunday-journal">View All</Link>
              </Button>
            </div>

            <div className="space-y-4">
              {filteredJournals.length > 0 ? (
                filteredJournals
                  .slice(0, 3)
                  .map((entry, index: number) => (
                    <Card
                      asChild
                      key={entry._id || index}
                      variant="interactive"
                      padding="none"
                      className="group"
                    >
                      <Link
                        to={`/sunday-journal/${entry._id}`}
                        className="p-5 block"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-foreground group-hover:text-accent transition-colors">
                            {entry.title}
                          </p>
                          <p className="text-[10px] font-bold text-muted-foreground bg-muted/50 px-2 py-0.5 rounded uppercase">
                            {new Date(entry.createdAt).toLocaleDateString(
                              undefined,
                              { month: "short", day: "numeric" },
                            )}
                          </p>
                        </div>
                        <p className="text-xs text-accent italic opacity-80 font-medium">
                          {entry.scriptureReference}
                        </p>
                      </Link>
                    </Card>
                  ))
              ) : (
                <Card
                  variant="ghost"
                  padding="xl"
                  className="text-center rounded-lg"
                >
                  <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground italic">
                    {searchTerm
                      ? `No meditations found matching"${searchTerm}"`
                      : "Begin your first entry to track your growth."}
                  </p>
                </Card>
              )}
            </div>

            <Button
              href="/sunday-journal"
              variant="outline"
              className="w-full mt-8 bg-muted/40"
            >
              Write New Entry
            </Button>
          </Card>

          {/* Consistency Tracking */}
          <Card padding="lg">
            <h3 className="text-xl font-bold text-foreground mb-10 flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              Consistency Tracking
            </h3>

            <div className="space-y-10">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-bold text-foreground uppercase tracking-wider">
                    Reading Plan
                  </p>
                  <p className="text-[10px] font-bold text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
                    {readingProgress}% Complete
                  </p>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${readingProgress}%`,
                      backgroundColor: "#22c55e",
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-bold text-foreground uppercase tracking-wider">
                    Journaling Streak
                  </p>
                  <p className="text-[10px] font-bold text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
                    {Math.round(journalingStreak)} days
                  </p>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${journalProgress}%`,
                      backgroundColor: "#d4a574",
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-bold text-foreground uppercase tracking-wider">
                    Focus Sessions
                  </p>
                  <p className="text-[10px] font-bold text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
                    {Math.round(focusProgress)}% Goal
                  </p>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${focusProgress}%`,
                      backgroundColor: "#a855f7",
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Tools */}
        <Card padding="lg">
          <h3 className="text-xl font-bold text-foreground mb-8">
            Spiritual Disciplines
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[
              { to: "/daily-scripture", icon: Sparkles, label: "Scripture" },
              { to: "/sunday-journal", icon: BookOpen, label: "Journaling" },
              { to: "/focus-timer", icon: Timer, label: "Focus" },
              { to: "/settings", icon: TrendingUp, label: "Insights" },
            ].map((tool) => (
              <Card
                asChild
                key={tool.to}
                variant="interactive"
                padding="none"
                className="group active:scale-95"
              >
                <Link to={tool.to} className="p-4 sm:p-8 block text-center">
                  <tool.icon className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 sm:mb-4 text-accent transition-all group-hover:scale-125 group-hover:rotate-12" />
                  <p className="text-[10px] sm:text-sm font-bold text-foreground uppercase tracking-widest">
                    {tool.label}
                  </p>
                </Link>
              </Card>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
