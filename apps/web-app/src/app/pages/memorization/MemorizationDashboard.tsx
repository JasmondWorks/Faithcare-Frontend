import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { BookOpen, TrendingUp, RefreshCw } from "lucide-react";
import { getProgress, getQueue } from "@/api/memorization/memorization";
import { Card } from "../../components/ui/card";
import { StreakBanner } from "../../components/memorization/StreakBanner";
import { MemorizationHeatmap } from "../../components/memorization/MemorizationHeatmap";
import { useLayout } from "../../contexts/LayoutContext";

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <Card padding="sm" className="text-center space-y-1">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">{label}</p>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="h-28 bg-muted rounded-2xl" />
      <div className="grid grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => <div key={i} className="h-16 bg-muted rounded-lg" />)}
      </div>
      <div className="h-32 bg-muted rounded-xl" />
      <div className="h-48 bg-muted rounded-xl" />
    </div>
  );
}

export default function MemorizationDashboard() {
  const { setHeader } = useLayout();

  useEffect(() => {
    setHeader("Memorization", "Track and review your scripture memory.");
  }, []);

  const { data: progressRes, isLoading } = useQuery({
    queryKey: ["mem-progress"],
    queryFn: getProgress,
    staleTime: 2 * 60_000,
  });

  const { data: queueRes } = useQuery({
    queryKey: ["mem-queue"],
    queryFn: () => getQueue(10),
    staleTime: 2 * 60_000,
  });

  if (isLoading) return <div className="max-w-2xl mx-auto"><DashboardSkeleton /></div>;

  const progress = progressRes?.data;
  const queue = queueRes?.data;
  const dueCount = queue?.dueCount ?? 0;
  const streak = progress?.currentStreak ?? 0;

  if (!progress) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto" />
        <p className="font-bold text-foreground">Couldn't load your progress</p>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 mx-auto text-sm font-semibold text-accent hover:underline"
        >
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Streak + CTA */}
      <StreakBanner streak={streak} dueCount={dueCount} />

      {/* All-caught-up state */}
      {dueCount === 0 && progress.totalVerses > 0 && (
        <Card padding="default" className="text-center space-y-2 bg-emerald-50 border-emerald-200">
          <p className="text-2xl">🎉</p>
          <p className="font-bold text-foreground">All caught up!</p>
          <p className="text-sm text-muted-foreground">
            Your next review is coming soon. Keep your streak alive.
          </p>
        </Card>
      )}

      {/* Empty state — no verses yet */}
      {progress.totalVerses === 0 && (
        <Card padding="default" variant="ghost" className="text-center space-y-3 py-8">
          <BookOpen className="w-10 h-10 text-muted-foreground/30 mx-auto" />
          <p className="font-bold text-foreground">No verses yet</p>
          <p className="text-sm text-muted-foreground">
            Start by adding a verse or browsing our curated collections.
          </p>
          <div className="flex items-center gap-3 justify-center pt-2">
            <Link
              to="/memorization/add"
              className="px-4 py-2 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition-all"
            >
              Add a Verse
            </Link>
            <Link
              to="/memorization/collections"
              className="px-4 py-2 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-all"
            >
              Browse Collections
            </Link>
          </div>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <StatCard label="Total" value={progress.totalVerses} color="text-foreground" />
        <StatCard label="Learning" value={progress.learning} color="text-blue-600" />
        <StatCard label="Reviewing" value={progress.reviewing} color="text-amber-600" />
        <StatCard label="Mastered" value={progress.mastered} color="text-emerald-600" />
      </div>

      {/* Activity heatmap */}
      {progress.heatmapData.length > 0 && (
        <Card padding="default">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold text-foreground">Activity</p>
            <Link to="/memorization/progress" className="text-xs font-semibold text-accent hover:underline flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Full progress
            </Link>
          </div>
          <MemorizationHeatmap data={progress.heatmapData} />
        </Card>
      )}

      {/* Top mastered verses */}
      {progress.topVerses.length > 0 && (
        <Card padding="default">
          <p className="text-sm font-bold text-foreground mb-4">Mastered Verses</p>
          <div className="space-y-3">
            {progress.topVerses.slice(0, 5).map((v) => (
              <div key={v.verseId} className="flex items-center gap-3">
                <span className="text-[11px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full shrink-0">
                  {v.reference}
                </span>
                <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                  {v.translation}
                </span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {new Date(v.masteredAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
