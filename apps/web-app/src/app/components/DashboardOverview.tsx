import { UserPlus, CheckCircle, Heart, BookOpen, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getDashboardTrends, getFirstTimers, getFollowUps } from "@/api/organization/church";

interface TrendsShape {
  firstTimersCount?: number;
  pendingFollowUps?: number;
  activePrayers?: number;
  prayerRequestsCount?: number;
  journalEntries?: number;
  journalCount?: number;
  data?: TrendsShape;
}

export function DashboardOverview() {
  const { data: trendsData, isLoading } = useQuery({
    queryKey: ["dashboard-trends-overview"],
    queryFn: () => getDashboardTrends(),
    refetchInterval: 60_000, // keep metrics live
  });

  // Direct fallbacks in case trends endpoint returns 0 / wrong shape
  const { data: firstTimersData } = useQuery({
    queryKey: ["first-timers"],
    queryFn: () => getFirstTimers(),
    refetchInterval: 60_000,
  });

  const { data: followUpsData } = useQuery({
    queryKey: ["follow-ups"],
    queryFn: () => getFollowUps(),
    refetchInterval: 60_000,
  });

  // Robustly find arrays regardless of nesting
  const findArray = (obj: unknown): unknown[] => {
    if (!obj) return [];
    if (Array.isArray(obj)) return obj;
    if (typeof obj === "object") {
      const record = obj as Record<string, unknown>;
      for (const key in record) {
        if (Array.isArray(record[key])) return record[key] as unknown[];
        if (typeof record[key] === "object" && record[key] !== null) {
          const nested = findArray(record[key]);
          if (nested.length > 0) return nested;
        }
      }
    }
    return [];
  };

  // Resolve trends - handle both { data: { firstTimersCount } } and { firstTimersCount }
  const trendsRoot = trendsData?.data as TrendsShape | undefined;
  const trends: TrendsShape = (trendsRoot?.firstTimersCount !== undefined
    ? trendsRoot
    : trendsRoot?.data?.firstTimersCount !== undefined
      ? trendsRoot?.data
      : trendsRoot || {}) as TrendsShape;

  const firstTimersArr = findArray(firstTimersData);
  const followUpsArr = findArray(followUpsData);
  const pendingFollowUpsCount = followUpsArr.filter(
    (f) => (f as { status?: string }).status?.toUpperCase() !== "COMPLETED"
  ).length;

  const statsData = [
    {
      title: "First Timers",
      value: trends?.firstTimersCount ?? firstTimersArr.length,
      icon: UserPlus,
      color: "#d4a574",
    },
    {
      title: "Pending Follow Ups",
      value: trends?.pendingFollowUps ?? pendingFollowUpsCount,
      icon: CheckCircle,
      color: "#22c55e",
    },
    {
      title: "Prayer Requests",
      value: trends?.activePrayers ?? trends?.prayerRequestsCount ?? "—",
      icon: Heart,
      color: "#3b82f6",
    },
    {
      title: "Journal Entries",
      value: trends?.journalEntries ?? trends?.journalCount ?? "—",
      icon: BookOpen,
      color: "#a855f7",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {isLoading ? (
        <div className="col-span-full py-6 text-center text-muted-foreground flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Syncing metrics...
        </div>
      ) : (
        statsData.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="bg-card/50 rounded-xl p-3 md:p-4 border border-border hover:border-accent/40 transition-all"
            >
              <div className="flex items-start justify-between gap-2 h-full">
                <div className="flex flex-col h-full justify-between">
                  <p className="text-muted-foreground text-md mb-2 leading-tight">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </p>
                </div>
                <div
                  className="p-2.5 rounded-lg"
                  style={{ backgroundColor: `${stat.color}10` }}
                >
                  <Icon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
