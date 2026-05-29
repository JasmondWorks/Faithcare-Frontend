import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, BookOpen } from "lucide-react";
import { toast } from "react-hot-toast";
import { getQueue, submitReview } from "@/api/memorization/memorization";
import type { DueVerseItem, Grade, PendingReview } from "@/api/memorization/types";
import { ChallengeFirstLetter } from "../../components/memorization/ChallengeFirstLetter";
import { ChallengeCloze } from "../../components/memorization/ChallengeCloze";
import { ChallengeFullRecall } from "../../components/memorization/ChallengeFullRecall";
import { useLayout } from "../../contexts/LayoutContext";

const PENDING_KEY = "mem_pending_reviews";
const SESSION_KEY = "mem_session";

type SessionPhase = "loading" | "empty" | "intro" | "practice" | "summary";

interface SessionResult {
  verseId: string;
  reference: string;
  grade: Grade;
  timeSpent: number;
}

function readPending(): PendingReview[] {
  try { return JSON.parse(localStorage.getItem(PENDING_KEY) ?? "[]"); } catch { return []; }
}

function writePending(items: PendingReview[]) {
  localStorage.setItem(PENDING_KEY, JSON.stringify(items));
}

function PracticeSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-6 w-48 bg-muted rounded" />
      <div className="h-48 bg-muted rounded-xl" />
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => <div key={i} className="h-14 bg-muted rounded-xl" />)}
      </div>
    </div>
  );
}

export default function PracticeSession() {
  const navigate = useNavigate();
  const { setHeader } = useLayout();
  const [phase, setPhase] = useState<SessionPhase>("loading");
  const [queue, setQueue] = useState<DueVerseItem[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [results, setResults] = useState<SessionResult[]>([]);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => { setHeader("Practice", "Work through your due verses."); }, []);

  const { data: queueRes, isLoading } = useQuery({
    queryKey: ["mem-queue"],
    queryFn: () => getQueue(10),
    staleTime: 0,
  });

  const reviewMutation = useMutation({
    mutationFn: submitReview,
    onError: (_, variables) => {
      // Offline queue — store and retry later
      const pending = readPending();
      pending.push({
        verseId: variables.verseId,
        grade: variables.grade,
        timeSpentSeconds: variables.timeSpentSeconds,
        reviewedAt: variables.reviewedAt ?? new Date().toISOString(),
      });
      writePending(pending);
      toast.error("Saved offline — will sync when reconnected.", { duration: 3000 });
    },
  });

  // Flush offline queue on mount / focus
  const flushPending = useCallback(async () => {
    const pending = readPending();
    if (pending.length === 0) return;
    let flushed = 0;
    for (const item of pending) {
      const res = await submitReview(item);
      if (res.success) flushed++;
      else break;
    }
    if (flushed > 0) {
      writePending(pending.slice(flushed));
      toast.success(`Synced ${flushed} offline review${flushed > 1 ? "s" : ""}.`, { duration: 2500 });
    }
  }, []);

  useEffect(() => {
    flushPending();
    window.addEventListener("focus", flushPending);
    return () => window.removeEventListener("focus", flushPending);
  }, [flushPending]);

  // Restore session from sessionStorage
  useEffect(() => {
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (saved) {
      const { queue: savedQueue, currentIdx: savedIdx, results: savedResults } = JSON.parse(saved);
      if (savedQueue?.length > 0) {
        if (window.confirm("Resume your previous session?")) {
          setQueue(savedQueue);
          setCurrentIdx(savedIdx);
          setResults(savedResults ?? []);
          setPhase("practice");
          return;
        } else {
          sessionStorage.removeItem(SESSION_KEY);
        }
      }
    }
  }, []);

  // Transition to correct phase when queue loads
  useEffect(() => {
    if (isLoading) return;
    if (phase !== "loading") return; // already restored from session
    const verses = queueRes?.data?.verses ?? [];
    if (verses.length === 0) setPhase("empty");
    else { setQueue(verses); setPhase("intro"); }
  }, [isLoading, queueRes]);

  // Persist session state
  useEffect(() => {
    if (phase === "practice" && queue.length > 0) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ queue, currentIdx, results }));
    }
    if (phase === "summary") sessionStorage.removeItem(SESSION_KEY);
  }, [phase, currentIdx, results, queue]);

  const startSession = () => {
    startTimeRef.current = Date.now();
    setPhase("practice");
  };

  const handleGrade = (grade: Grade) => {
    const current = queue[currentIdx];
    const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);

    // Optimistic advance
    setResults((prev) => [...prev, { verseId: current.verseId, reference: current.reference, grade, timeSpent }]);

    // Fire review in background
    reviewMutation.mutate({
      verseId: current.verseId,
      grade,
      timeSpentSeconds: timeSpent,
      reviewedAt: new Date().toISOString(),
    });

    if (currentIdx + 1 >= queue.length) {
      setPhase("summary");
    } else {
      setCurrentIdx((i) => i + 1);
      startTimeRef.current = Date.now();
    }
  };

  const dueCount = queueRes?.data?.dueCount ?? queue.length;
  const current = queue[currentIdx];

  // ── Loading ──
  if (phase === "loading" || isLoading) {
    return <div className="max-w-2xl mx-auto"><PracticeSkeleton /></div>;
  }

  // ── Empty ──
  if (phase === "empty") {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <div className="text-5xl">🎉</div>
        <p className="text-xl font-bold text-foreground">You're all caught up!</p>
        <p className="text-sm text-muted-foreground">No verses due right now. Come back later to keep your streak going.</p>
        <button
          onClick={() => navigate("/memorization")}
          className="flex items-center gap-2 mx-auto px-5 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition-all"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  // ── Intro ──
  if (phase === "intro") {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="space-y-1">
          <p className="text-2xl font-bold text-foreground">{dueCount} verse{dueCount !== 1 ? "s" : ""} to review</p>
          <p className="text-sm text-muted-foreground">Work through each verse at your own pace.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {queue.map((v) => (
            <span key={v.verseId} className="text-xs font-semibold bg-accent/10 text-accent px-3 py-1 rounded-full border border-accent/20">
              {v.reference}
            </span>
          ))}
        </div>
        <button
          onClick={startSession}
          className="w-full py-4 rounded-2xl bg-accent text-white text-base font-bold hover:bg-accent/90 transition-all shadow-lg shadow-accent/20"
        >
          Begin Session
        </button>
      </div>
    );
  }

  // ── Summary ──
  if (phase === "summary") {
    const perfect = results.filter((r) => r.grade === "perfect").length;
    const hesitant = results.filter((r) => r.grade === "hesitant").length;
    const failed = results.filter((r) => r.grade === "failed").length;
    const failedVerses = results.filter((r) => r.grade === "failed");

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="text-5xl">🎉</div>
          <p className="text-2xl font-bold text-foreground">Session Complete!</p>
        </div>

        {/* Result pills */}
        <div className="flex justify-center gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-600">{perfect}</p>
            <p className="text-xs text-muted-foreground font-semibold">Perfect</p>
          </div>
          <div className="w-px bg-border" />
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-600">{hesitant}</p>
            <p className="text-xs text-muted-foreground font-semibold">Hesitant</p>
          </div>
          <div className="w-px bg-border" />
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{failed}</p>
            <p className="text-xs text-muted-foreground font-semibold">Forgot</p>
          </div>
        </div>

        {/* Forgotten verses */}
        {failedVerses.length > 0 && (
          <div className="border border-red-100 rounded-xl p-4 space-y-3 bg-red-50/40">
            <p className="text-xs font-bold text-red-700 uppercase tracking-wider">Needs more practice</p>
            {failedVerses.map((v) => (
              <div key={v.verseId} className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-foreground">{v.reference}</span>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => navigate("/memorization")}
          className="w-full py-3.5 rounded-2xl bg-accent text-white font-bold hover:bg-accent/90 transition-all shadow-lg shadow-accent/20"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  // ── Practice ──
  if (!current) return null;

  const progressPct = Math.round((currentIdx / queue.length) * 100);

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Progress bar + back */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/memorization")}
            className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Exit
          </button>
          <span className="text-xs font-semibold text-muted-foreground">
            {currentIdx + 1} / {queue.length}
          </span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Verse header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-accent" />
          <p className="text-lg font-bold text-foreground">{current.reference}</p>
        </div>
        {current.challenge.mode === "first-letter" && (
          <p className="text-xs text-muted-foreground">Use the first letters as clues</p>
        )}
        {current.challenge.mode === "cloze" && (
          <p className="text-xs text-muted-foreground">Fill in the missing words</p>
        )}
        {current.challenge.mode === "full-recall" && (
          <p className="text-xs text-muted-foreground">Recall the verse from memory</p>
        )}
      </div>

      {/* Challenge */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
        {current.challenge.mode === "first-letter" && (
          <ChallengeFirstLetter key={currentIdx} challenge={current.challenge} onGrade={handleGrade} />
        )}
        {current.challenge.mode === "cloze" && (
          <ChallengeCloze key={currentIdx} challenge={current.challenge} onGrade={handleGrade} />
        )}
        {current.challenge.mode === "full-recall" && (
          <ChallengeFullRecall key={currentIdx} challenge={current.challenge} verseText={current.text} onGrade={handleGrade} />
        )}
      </div>
    </div>
  );
}
