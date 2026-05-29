import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Circle, BookOpen } from "lucide-react";
import { getScriptureHistoryAuth } from "@/api/scripture/scripture";
import { getMyMetadata } from "@/api/individual/individual";
import type { UserDailyScripture } from "@/api/scripture/types";
import { Card } from "../../components/ui/card";
import { useAuth } from "../../providers/AuthProvider";
import { cn } from "@/lib/utils";
import { VerseDetailModal } from "../../components/scripture/VerseDetailModal";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

function formatMonth(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function groupByMonth(entries: UserDailyScripture[]): Map<string, UserDailyScripture[]> {
  const map = new Map<string, UserDailyScripture[]>();
  for (const e of entries) {
    const key = formatMonth(e.date);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(e);
  }
  return map;
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function HistorySkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-24 bg-muted rounded-2xl" />
      <div className="h-4 w-32 bg-muted rounded" />
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-20 bg-muted rounded-xl" />
      ))}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ScriptureHistory() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id || "";
  const [selectedEntry, setSelectedEntry] = useState<UserDailyScripture | null>(null);

  const { data: historyRes, isLoading: historyLoading } = useQuery({
    queryKey: ["scripture-history"],
    queryFn: getScriptureHistoryAuth,
    staleTime: 2 * 60_000,
  });

  const { data: metadataRes } = useQuery({
    queryKey: ["individual-metadata", userId],
    queryFn: () => getMyMetadata(),
    enabled: !!userId,
    staleTime: 5 * 60_000,
  });

  const streak = (metadataRes?.data as any)?.dailyBibleReadingStreakCount ?? 0;
  const entries: UserDailyScripture[] = historyRes?.data ?? [];
  const grouped = groupByMonth(entries);

  const handleEntryClick = (entry: UserDailyScripture) => {
    setSelectedEntry(entry);
  };

  const handleReadInBible = (entry: UserDailyScripture) => {
    navigate(
      `/scripture/read?bibleId=${encodeURIComponent(entry.bibleId!)}&book=${encodeURIComponent(entry.chapterId!.split(".")[0])}&chapter=${encodeURIComponent(entry.chapterId!)}`,
    );
  };

  const handleNotesUpdated = (newNotes: string) => {
    if (selectedEntry) {
      setSelectedEntry({
        ...selectedEntry,
        personalNotes: newNotes,
      });
    }
  };

  if (historyLoading) return <div className="max-w-2xl mx-auto"><HistorySkeleton /></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Streak banner */}
      <Card
        padding="lg"
        className={cn(
          "flex items-center gap-4",
          streak >= 7
            ? "bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200"
            : "bg-muted/30",
        )}
      >
        <div className="text-4xl font-bold text-orange-500 leading-none">
          🔥
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">
            {streak} day{streak !== 1 ? "s" : ""} streak
          </p>
          {streak === 0 ? (
            <p className="text-sm text-muted-foreground mt-0.5">
              Start your streak — read today's scripture.
            </p>
          ) : streak >= 7 ? (
            <p className="text-sm text-orange-600 font-semibold mt-0.5">
              {streak}-day streak! Keep it up. 🎉
            </p>
          ) : (
            <p className="text-sm text-muted-foreground mt-0.5">
              Keep reading every day to grow your streak.
            </p>
          )}
        </div>
      </Card>

      {/* History list */}
      {entries.length === 0 ? (
        <div className="text-center py-12 space-y-3">
          <BookOpen className="w-10 h-10 mx-auto text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">No reading history yet.</p>
          <p className="text-xs text-muted-foreground/70">
            Complete today's reading to start your history.
          </p>
        </div>
      ) : (
        Array.from(grouped.entries()).map(([month, monthEntries]) => (
          <section key={month} className="space-y-3">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              {month}
            </p>
            <div className="space-y-2">
              {monthEntries.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => handleEntryClick(entry)}
                  className="w-full text-left p-4 rounded-xl border border-border hover:border-accent/30 hover:bg-muted/30 transition-all group"
                >
                  <div className="flex items-start gap-3">
                    {entry.isCompleted ? (
                      <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-4.5 h-4.5 text-muted-foreground/40 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <p className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors">
                          {entry.scriptureReference || "Daily Verse"}
                          {!entry.scriptureReference && (
                            <span className="text-muted-foreground font-normal">
                              {" "}— {new Date(entry.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </span>
                          )}
                        </p>
                        {entry.planDay !== null && (
                          <span className="text-[10px] font-bold bg-accent/10 text-accent px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Day {entry.planDay}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{formatDate(entry.date)}</p>
                      {entry.personalNotes && (
                        <div className="text-[13px] text-muted-foreground/90 italic mt-2 leading-relaxed prose prose-sm max-w-none dark:prose-invert [&_p]:mb-1.5 last:[&_p]:mb-0 [&_ul]:my-1 [&_li]:my-0.5">
                          <div dangerouslySetInnerHTML={{ __html: entry.personalNotes }} />
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        ))
      )}

      {selectedEntry && (
        <VerseDetailModal
          isOpen={!!selectedEntry}
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
          onNotesUpdated={handleNotesUpdated}
          onReadInBible={
            selectedEntry.chapterId && selectedEntry.bibleId
              ? () => handleReadInBible(selectedEntry)
              : undefined
          }
        />
      )}
    </div>
  );
}
