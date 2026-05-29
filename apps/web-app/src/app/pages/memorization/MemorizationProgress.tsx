import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RefreshCw, RotateCcw, BookOpen } from "lucide-react";
import { toast } from "react-hot-toast";
import { getProgress, getQueue, addVerse } from "@/api/memorization/memorization";
import { Card } from "../../components/ui/card";
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

function ProgressSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="grid grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => <div key={i} className="h-16 bg-muted rounded-lg" />)}
      </div>
      <div className="h-48 bg-muted rounded-xl" />
      <div className="h-24 bg-muted rounded-xl" />
      <div className="space-y-2">
        {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-muted rounded-xl" />)}
      </div>
    </div>
  );
}

export default function MemorizationProgress() {
  const { setHeader } = useLayout();
  const queryClient = useQueryClient();

  useEffect(() => {
    setHeader("Progress", "Your full memorization overview.");
  }, []);

  const { data: progressRes, isLoading } = useQuery({
    queryKey: ["mem-progress"],
    queryFn: getProgress,
    staleTime: 2 * 60_000,
  });

  const { data: queueRes } = useQuery({
    queryKey: ["mem-queue-progress"],
    queryFn: () => getQueue(20),
    staleTime: 2 * 60_000,
  });

  const requeueMutation = useMutation({
    mutationFn: (ref: string) => addVerse({ reference: ref }),
    onSuccess: () => {
      toast.success("Added for a refresher review!");
      queryClient.invalidateQueries({ queryKey: ["mem-queue"] });
    },
    onError: () => toast.error("Failed to requeue verse."),
  });

  if (isLoading) return <div className="max-w-2xl mx-auto"><ProgressSkeleton /></div>;

  const progress = progressRes?.data;
  const queue = queueRes?.data;

  if (!progress) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto" />
        <p className="font-bold text-foreground">Couldn't load progress</p>
        <button onClick={() => window.location.reload()} className="flex items-center gap-2 mx-auto text-sm font-semibold text-accent hover:underline">
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  // Last 7 days streak calendar
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const iso = d.toISOString().slice(0, 10);
    const reviewed = progress.heatmapData.some((h) => h.date === iso && h.count > 0);
    return { iso, day: d.toLocaleDateString("en-US", { weekday: "short" }), reviewed };
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <StatCard label="Total" value={progress.totalVerses} color="text-foreground" />
        <StatCard label="Learning" value={progress.learning} color="text-blue-600" />
        <StatCard label="Reviewing" value={progress.reviewing} color="text-amber-600" />
        <StatCard label="Mastered" value={progress.mastered} color="text-emerald-600" />
      </div>

      {/* Streak section */}
      <Card padding="default">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-bold text-foreground">Current Streak</p>
            <p className="text-3xl font-bold text-orange-500">{progress.currentStreak} day{progress.currentStreak !== 1 ? "s" : ""} 🔥</p>
          </div>
        </div>
        {/* 7-day mini calendar */}
        <div className="flex gap-2 justify-between">
          {last7.map(({ iso, day, reviewed }) => (
            <div key={iso} className="flex flex-col items-center gap-1.5">
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${reviewed ? "bg-emerald-100 border-emerald-400" : "bg-muted border-border"}`}>
                {reviewed && <span className="text-xs text-emerald-700">✓</span>}
              </div>
              <span className="text-[10px] text-muted-foreground font-medium">{day}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Full heatmap */}
      <Card padding="default">
        <p className="text-sm font-bold text-foreground mb-4">Activity — Last Year</p>
        <MemorizationHeatmap data={progress.heatmapData} />
      </Card>

      {/* Mastered verses */}
      {progress.topVerses.length > 0 && (
        <Card padding="default">
          <p className="text-sm font-bold text-foreground mb-4">Mastered Verses</p>
          <div className="space-y-2.5">
            {progress.topVerses.map((v) => (
              <div key={v.verseId} className="flex items-center gap-3 py-1">
                <span className="text-[11px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full shrink-0">
                  {v.reference}
                </span>
                <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                  {v.translation}
                </span>
                <span className="text-xs text-muted-foreground ml-auto shrink-0">
                  {new Date(v.masteredAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
                <button
                  type="button"
                  onClick={() => requeueMutation.mutate(v.reference)}
                  disabled={requeueMutation.isPending}
                  className="shrink-0 p-1.5 rounded-lg text-muted-foreground hover:text-accent hover:bg-accent/10 transition-all"
                  title="Practice again"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Learning queue */}
      {queue && queue.verses.length > 0 && (
        <Card padding="default">
          <p className="text-sm font-bold text-foreground mb-4">Due for Review</p>
          <div className="space-y-2">
            {queue.verses.map((v) => (
              <div key={v.verseId} className="flex items-center gap-3 py-1.5 border-b border-border/50 last:border-0">
                <span className="text-[11px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full shrink-0">
                  {v.reference}
                </span>
                <span className="text-xs text-muted-foreground ml-auto">
                  Every {v.interval} day{v.interval !== 1 ? "s" : ""}
                </span>
                {v.lastGrade && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    v.lastGrade === "perfect"
                      ? "bg-emerald-100 text-emerald-700"
                      : v.lastGrade === "hesitant"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-red-100 text-red-700"
                  }`}>
                    {v.lastGrade}
                  </span>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {progress.totalVerses === 0 && (
        <div className="text-center py-8 space-y-2">
          <BookOpen className="w-10 h-10 mx-auto text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">No verses memorized yet. Start by adding one!</p>
        </div>
      )}
    </div>
  );
}
