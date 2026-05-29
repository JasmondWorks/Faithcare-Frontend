import { useState, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  RefreshCw,
  BookOpen,
  NotebookPen,
  ArrowRight,
  ExternalLink,
  Loader2,
  Bookmark,
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  getTodayScriptureAuth,
  markScriptureComplete,
  saveScriptureNotes,
  getBookmarks,
  addBookmark,
  removeBookmark,
  getBibles,
} from "@/api/scripture/scripture";
import type { Verse } from "@/api/scripture/types";
import { Button } from "@/components/ui/button";
import { Card } from "../../components/ui/card";
import { VerseList } from "../../components/scripture/VerseList";
import { ReflectionPanel } from "../../components/scripture/ReflectionPanel";
import { PlanProgressCard } from "../../components/scripture/PlanProgressCard";
import { JournalEditor } from "../../components/ui/JournalEditor";
import { cn } from "@/lib/utils";

// ── Skeleton ──────────────────────────────────────────────────────────────────

function TodaySkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-pulse">
      <div className="h-5 w-48 bg-muted rounded-lg" />
      <div className="h-2 bg-muted rounded-full" />
      <Card padding="lg" className="space-y-4">
        <div className="h-6 w-36 bg-muted rounded-lg" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-4 bg-muted rounded" style={{ width: `${75 + (i % 3) * 8}%` }} />
          ))}
        </div>
      </Card>
      <div className="h-14 bg-muted rounded-2xl" />
    </div>
  );
}

// ── Notes & Completion Panel ──────────────────────────────────────────────────

interface NotesAndCompletionPanelProps {
  recordId: string;
  initialNotes: string | null;
  isCompleted: boolean;
  completedAt: string | null;
}

function NotesAndCompletionPanel({ recordId, initialNotes, isCompleted, completedAt }: NotesAndCompletionPanelProps) {
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const promises: Promise<any>[] = [saveScriptureNotes(recordId, notes)];
      if (!isCompleted) {
        promises.push(markScriptureComplete(recordId));
      }

      const results = await Promise.all(promises);
      const failed = results.some(r => r && r.success === false);
      if (failed) {
        toast.error("Failed to save changes");
      } else {
        toast.success(isCompleted ? "Notes saved!" : "Marked as read & notes saved! 🎉");
        queryClient.invalidateQueries({ queryKey: ["scripture-today"] });
        queryClient.invalidateQueries({ queryKey: ["scripture-history"] });
      }
    } catch (e) {
      toast.error("An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground flex items-center gap-2">
          <NotebookPen className="w-4 h-4 text-accent" />
          Personal Notes
        </p>
        <JournalEditor
          value={notes}
          onChange={(html) => setNotes(html)}
          placeholder="Write your thoughts, prayers, or insights…"
          className="min-h-[150px] px-4 py-3 rounded-xl border border-border bg-muted/20 text-sm focus-within:ring-2 focus-within:ring-accent focus-within:border-accent transition-all"
        />
      </div>

      <div className="pt-2">
        {isCompleted && completedAt && (
          <div className="mb-4 flex items-center justify-center gap-2 py-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-700">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-semibold text-sm">Read today</span>
            <span className="text-xs text-emerald-600/70">
              · {new Date(completedAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
            </span>
          </div>
        )}

        <Button
          className="w-full h-14 text-base gap-2 rounded-2xl shadow-lg shadow-primary/20 transition-all"
          onClick={handleSave}
          disabled={isSaving || (isCompleted && notes === (initialNotes ?? ""))}
          isLoading={isSaving}
        >
          {isCompleted ? (
            <><NotebookPen className="w-5 h-5" /> {initialNotes ? "Update Notes" : "Save Notes"}</>
          ) : (
            <><CheckCircle2 className="w-5 h-5" /> {notes.trim() ? "Save & Complete" : "Complete Reading"}</>
          )}
        </Button>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ScriptureToday() {
  const queryClient = useQueryClient();
  const [translationId, setTranslationId] = useState<string | undefined>(undefined);

  const { data: biblesRes } = useQuery({
    queryKey: ["scripture-bibles"],
    queryFn: getBibles,
    staleTime: Infinity,
  });
  const bibles = biblesRes?.data ?? [];

  const { data: res, isLoading, refetch } = useQuery({
    queryKey: ["scripture-today", translationId],
    queryFn: () => getTodayScriptureAuth(translationId),
    staleTime: 5 * 60_000,
  });

  const { data: bookmarksRes } = useQuery({
    queryKey: ["scripture-bookmarks"],
    queryFn: getBookmarks,
    staleTime: 60_000,
  });

  const bookmarkedRefs = new Set(
    (bookmarksRes?.data ?? []).map((b) => b.verseReference),
  );

  const addBookmarkMutation = useMutation({
    mutationFn: (verse: Verse & { bibleId: string; chapterId: string }) =>
      addBookmark({
        bibleId: verse.bibleId,
        chapterId: verse.chapterId,
        verseReference: verse.reference,
        verseText: verse.text,
      }),
    onSuccess: () => {
      toast.success("Verse bookmarked");
      queryClient.invalidateQueries({ queryKey: ["scripture-bookmarks"] });
    },
  });

  const removeBookmarkMutation = useMutation({
    mutationFn: (id: string) => removeBookmark(id),
    onSuccess: () => {
      toast.success("Bookmark removed");
      queryClient.invalidateQueries({ queryKey: ["scripture-bookmarks"] });
    },
  });

  const today = res?.data;

  const handleToggleBookmark = (verse: Verse) => {
    if (!today) return;
    const existing = (bookmarksRes?.data ?? []).find(
      (b) => b.verseReference === verse.reference,
    );

    if (existing) {
      removeBookmarkMutation.mutate(existing.id);
    } else {
      const currentBibleId = today.type === "plan" ? today.bibleId : (translationId || bibles[0]?.id || "global");
      const currentChapterId = today.type === "plan" ? today.chapters[0].id : (today.chapterId || "global");

      addBookmarkMutation.mutate({
        ...verse,
        bibleId: currentBibleId,
        chapterId: currentChapterId,
      });
    }
  };

  // ── Loading ──
  if (isLoading) return <TodaySkeleton />;

  // ── Unavailable (null = Bible API down, undefined = query not yet resolved) ──
  if (!res?.success || today == null) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto" />
        <p className="font-bold text-foreground">Today's verse isn't available yet</p>
        <p className="text-sm text-muted-foreground">Check back shortly — we're preparing your daily reading.</p>
        <Button variant="outline" className="gap-2" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4" /> Retry
        </Button>
      </div>
    );
  }

  // ── Global verse fallback ──
  if (today.type === "global_verse") {
    const record = today.record;
    const completed = record.isCompleted;

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card padding="lg" className="bg-gradient-to-br from-accent/8 to-accent/3 border-accent/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-accent/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <p className="text-xs font-bold text-accent uppercase tracking-widest">Today's Verse</p>
              <select
                className="text-[11px] font-semibold bg-muted hover:bg-muted/80 text-muted-foreground px-2 py-0.5 rounded-full outline-none focus:ring-1 focus:ring-accent cursor-pointer transition-colors"
                value={translationId || ""}
                onChange={(e) => setTranslationId(e.target.value)}
                title="Change Translation"
              >
                {!translationId && <option value="" disabled hidden>{today.version}</option>}
                {bibles.map(b => (
                  <option key={b.id} value={b.id}>{b.abbreviation}</option>
                ))}
              </select>
            </div>
            <div className="relative group pr-8">
              <blockquote className="text-xl font-['Georgia',serif] text-foreground leading-[1.75] italic">
                "{today.text}"
              </blockquote>
              <button
                type="button"
                className={cn(
                  "p-2 rounded-md transition-all absolute right-0 top-1/2 -translate-y-1/2",
                  bookmarkedRefs.has(today.reference)
                    ? "text-accent opacity-100"
                    : "text-muted-foreground/40 md:opacity-0 group-hover:opacity-100 hover:text-accent hover:bg-accent/10"
                )}
                onClick={() => handleToggleBookmark({ number: 1, reference: today.reference, text: today.text })}
                title={bookmarkedRefs.has(today.reference) ? "Bookmarked" : "Bookmark verse"}
              >
                {bookmarkedRefs.has(today.reference) ? (
                  <Bookmark className="w-5 h-5 fill-current" />
                ) : (
                  <Bookmark className="w-5 h-5" />
                )}
              </button>
            </div>
            <p className="text-sm font-bold text-accent">{today.reference}</p>

          </div>
        </Card>

        {/* Notes & Completion */}
        <Card padding="lg">
          <NotesAndCompletionPanel
            recordId={record.id}
            initialNotes={record.personalNotes}
            isCompleted={completed}
            completedAt={record.completedAt}
          />
        </Card>

        {/* Quick-links */}
        <div className="grid grid-cols-2 gap-3">
          <Link to="/scripture/plans">
            <Card
              variant="interactive"
              padding="default"
              className="flex items-center justify-between gap-3 h-full"
            >
              <div>
                <p className="font-bold text-foreground text-sm">Reading Plans</p>
                <p className="text-xs text-muted-foreground mt-0.5">Structured daily reading</p>
              </div>
              <ArrowRight className="w-4 h-4 text-accent shrink-0" />
            </Card>
          </Link>
          <Link to="/scripture/read">
            <Card
              variant="interactive"
              padding="default"
              className="flex items-center justify-between gap-3 h-full"
            >
              <div>
                <p className="font-bold text-foreground text-sm">Browse Bible</p>
                <p className="text-xs text-muted-foreground mt-0.5">Read any chapter</p>
              </div>
              <BookOpen className="w-4 h-4 text-accent shrink-0" />
            </Card>
          </Link>
        </div>
      </div>
    );
  }

  // ── Plan reading (TypeScript has narrowed today to type === "plan" here) ──
  if (today.type !== "plan") return null;
  const { chapters, reflection, record, planName, dayNumber, totalDays, bibleId } = today;
  const completed = record.isCompleted;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Plan progress header */}
      <Card padding="default">
        <PlanProgressCard
          currentDay={dayNumber}
          totalDays={totalDays}
          planName={planName}
          status="active"
        />
      </Card>

      {/* Chapter(s) */}
      {chapters.map((chapter: import("@/api/scripture/types").ChapterData) => (
        <Card key={chapter.id} padding="lg" className="space-y-5">
          <div className="flex items-center justify-between border-b border-border/50 pb-3">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-foreground">
                {chapter.reference}
              </h2>
              <select
                className="text-[11px] font-semibold bg-muted hover:bg-muted/80 text-muted-foreground px-2 py-0.5 rounded-full outline-none focus:ring-1 focus:ring-accent cursor-pointer transition-colors"
                value={translationId || bibleId || ""}
                onChange={(e) => setTranslationId(e.target.value)}
                title="Change Translation"
              >
                {bibles.map(b => (
                  <option key={b.id} value={b.id}>{b.abbreviation}</option>
                ))}
              </select>
            </div>
            <Link
              to={`/scripture/read?bibleId=${encodeURIComponent(bibleId)}&book=${encodeURIComponent(chapter.id.split(".")[0])}&chapter=${encodeURIComponent(chapter.id)}`}
              className="flex items-center gap-1 text-xs font-semibold text-accent hover:underline shrink-0"
            >
              <ExternalLink className="w-3 h-3" />
              Open in reader
            </Link>
          </div>
          <VerseList
            verses={chapter.verses}
            bookmarkable
            bookmarkedRefs={bookmarkedRefs}
            onBookmark={handleToggleBookmark}
          />
        </Card>
      ))}

      {/* Reflection */}
      <ReflectionPanel reflection={reflection} defaultOpen />

      {/* Notes & Completion */}
      <Card padding="lg">
        <NotesAndCompletionPanel
          recordId={record.id}
          initialNotes={record.personalNotes}
          isCompleted={completed}
          completedAt={record.completedAt}
        />
      </Card>
    </div>
  );
}
