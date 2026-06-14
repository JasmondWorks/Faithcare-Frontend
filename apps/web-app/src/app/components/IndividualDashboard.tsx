import { useEffect } from "react";
import { BookOpen, ScrollText, Cross, Timer, TrendingUp } from "lucide-react";
import { useLayout } from "../contexts/LayoutContext";
import { useAuth } from "../providers/AuthProvider";
import { useQuery } from "@tanstack/react-query";
import {
  getIndividualDashboard,
  getJournalEntries,
} from "@/api/individual/individual";
import type { JournalEntry } from "@/api/individual/types";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useSearch } from "../contexts/SearchContext";
import { Card, CardTitle, CardDescription } from "./ui/card";
import { Button } from "@/components/ui/button";

export function IndividualDashboard() {
  const { setHeader } = useLayout();
  const { user, userType } = useAuth();
  const { searchTerm } = useSearch();

  useEffect(() => {
    setHeader("Dashboard");
  }, [user]);

  const { data: dashboardRes, error: dashboardError } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => getIndividualDashboard(),
    enabled: !!user && userType === "individual",
  });

  const { data: journalsResponse } = useQuery({
    queryKey: ["journals", user?.id],
    queryFn: () => getJournalEntries({ userId: user?.id, limit: 10 }),
    enabled: !!user && userType === "individual",
  });

  useEffect(() => {
    if (dashboardError) {
      toast.error(
        "Failed to load dashboard: " +
          (dashboardError instanceof Error
            ? dashboardError.message
            : String(dashboardError)),
      );
    }
  }, [dashboardError]);

  const dashboard = dashboardRes?.data;

  const journals: JournalEntry[] = Array.isArray(journalsResponse?.data)
    ? (journalsResponse.data as JournalEntry[])
    : [];

  const journalCount = journalsResponse?.meta?.total ?? journals.length;

  const filteredJournals = journals.filter(
    (j) =>
      j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (j.scriptureReference ?? "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );

  const loginStreak = dashboard?.streaks.loginStreak;
  console.log(loginStreak);
  const scriptures = dashboard?.totals.scriptures ?? 0;
  const focusSessions = dashboard?.totals.focusSessions ?? 0;
  const meditationsThisMonth = dashboard?.totals.meditationsThisMonth ?? 0;

  const scriptureDaysCount = dashboard?.consistency.scriptureDates.length ?? 0;
  const journalDaysCount = dashboard?.consistency.journalDates.length ?? 0;
  const focusDaysCount = dashboard?.consistency.focusDates.length ?? 0;

  const msPerDay = 1000 * 60 * 60 * 24;
  const totalDailyDays = dashboard
    ? Math.round(
        (new Date(dashboard.consistency.to).getTime() -
          new Date(dashboard.consistency.dailyFrom).getTime()) /
          msPerDay,
      ) + 1
    : 30;
  const totalWeeklyDays = dashboard
    ? Math.round(
        (new Date(dashboard.consistency.to).getTime() -
          new Date(dashboard.consistency.weeklyFrom).getTime()) /
          msPerDay,
      ) + 1
    : 91;

  const scriptureProgress = Math.min(
    100,
    (scriptureDaysCount / totalDailyDays) * 100,
  );
  const journalProgress = Math.min(
    100,
    (journalDaysCount / totalWeeklyDays) * 100,
  );
  const focusProgress = Math.min(100, (focusDaysCount / totalDailyDays) * 100);

  const pluralise = (count: number, unit: "day" | "week") =>
    `${count} ${unit}${count === 1 ? "" : "s"}`;

  const stats = [
    {
      title: "Current Streak",
      value: loginStreak
        ? pluralise(loginStreak.count, loginStreak.unit)
        : "0 days",
      icon: TrendingUp,
      color: "#22c55e",
    },
    {
      title: "Journal Entries",
      value: journalCount.toString(),
      icon: BookOpen,
      color: "#d4a574",
    },
    {
      title: "Scriptures Read",
      value: scriptures.toString(),
      icon: ScrollText,
      color: "#3b82f6",
    },
    {
      title: "Focus Sessions",
      value: focusSessions.toString(),
      icon: Timer,
      color: "#a855f7",
    },
  ];

  return (
    <div className="space-y-6">
      <p>
        Welcome back,{" "}
        <span className="font-semibold">{user?.name || "Believer"}</span>
      </p>
      <div className="space-y-6 md:space-y-8 max-w-7xl mx-auto">
        {/* Welcome Card */}
        <Card className="relative overflow-hidden shadow-xl shadow-accent/5 p-5 sm:p-8">
          <div className="absolute top-0 right-0 p-6 sm:p-10 opacity-[0.03] dark:opacity-[0.07]">
            <Cross className="w-48 h-48 sm:w-64 sm:h-64 text-accent" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-start justify-between gap-6 sm:gap-8">
            <div className="flex-1 space-y-2">
              <CardTitle className="text-xl sm:text-2xl">
                Peace be with you.
              </CardTitle>
              <CardDescription className="text-sm sm:text-base max-w-5xl leading-relaxed opacity-80 pb-6">
                You've completed {meditationsThisMonth} meditations this month.
                Your commitment to your spiritual walk is inspiring.
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

        {/* Stats Grid */}
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
                    <p className="text-xl sm:text-2xl font-medium leading-tight">
                      {stat.value}
                    </p>
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

        {/* Recent Journal Entries + This Week's Progress */}
        <div className="grid lg:grid-cols-2 gap-8">
          <Card padding="lg">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-foreground flex items-center gap-3">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <BookOpen className="w-5 h-5 text-accent" />
                </div>
                {searchTerm
                  ? `Search: "${searchTerm}"`
                  : "Recent Journal Entries"}
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
                filteredJournals.slice(0, 3).map((entry, index) => (
                  <Card
                    asChild
                    key={entry.id || index}
                    variant="interactive"
                    padding="none"
                    className="group"
                  >
                    <Link
                      to="/sunday-journal"
                      state={{ entryId: entry.id }}
                      className="p-5 block"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-foreground group-hover:text-accent transition-colors">
                          {entry.title}
                        </p>
                        <p className="text-[10px] font-bold text-muted-foreground bg-muted/50 px-2 py-0.5 rounded uppercase">
                          {new Date(entry.createdAt).toLocaleDateString(
                            undefined,
                            {
                              month: "short",
                              day: "numeric",
                            },
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
                      ? `No entries found matching "${searchTerm}"`
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

          {/* Consistency Overview */}
          <Card padding="lg">
            <h3 className="text-xl font-bold text-foreground mb-10 flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              Consistency Overview
            </h3>

            <div className="space-y-10">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-bold text-foreground uppercase tracking-wider">
                    Daily Scripture Reading
                  </p>
                  <p className="text-[10px] font-bold text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
                    {scriptureDaysCount}/{totalDailyDays} days
                  </p>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${scriptureProgress}%`,
                      backgroundColor: "#22c55e",
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-bold text-foreground uppercase tracking-wider">
                    Journal Entries
                  </p>
                  <p className="text-[10px] font-bold text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
                    {journalDaysCount}/{totalWeeklyDays} days
                  </p>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${journalProgress}%`,
                      backgroundColor: "#d4a574",
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-bold text-foreground uppercase tracking-wider">
                    Focus Sessions
                  </p>
                  <p className="text-[10px] font-bold text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
                    {focusDaysCount}/{totalDailyDays} days
                  </p>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${focusProgress}%`,
                      backgroundColor: "#a855f7",
                    }}
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Spiritual Disciplines */}
        <Card padding="lg">
          <h3 className="text-xl font-bold text-foreground mb-8">
            Spiritual Disciplines
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[
              { to: "/scripture", icon: ScrollText, label: "Scripture" },
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
