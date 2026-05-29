import { useState } from "react";
import { cn } from "@/lib/utils";
import { GradeButtons } from "./GradeButtons";
import type { FullRecallChallenge, Grade } from "@/api/memorization/types";

interface Props {
  challenge: FullRecallChallenge;
  verseText: string;
  onGrade: (grade: Grade) => void;
}

function diffWords(attempt: string, correct: string): Array<{ word: string; ok: boolean }> {
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z]/g, "");
  const aWords = attempt.trim().split(/\s+/);
  const cWords = correct.trim().split(/\s+/);
  return cWords.map((word, i) => ({
    word,
    ok: normalize(aWords[i] ?? "") === normalize(word),
  }));
}

export function ChallengeFullRecall({ challenge, verseText, onGrade }: Props) {
  const [attempt, setAttempt] = useState("");
  const [revealed, setRevealed] = useState(false);
  const diff = revealed ? diffWords(attempt, verseText) : [];

  return (
    <div className="space-y-6">
      {/* Hint */}
      <p className="text-sm text-muted-foreground">
        This verse is <span className="font-semibold text-foreground">{challenge.wordCount}</span> words.
      </p>

      {/* Textarea */}
      <textarea
        value={attempt}
        onChange={(e) => { if (!revealed) setAttempt(e.target.value); }}
        placeholder="Type the verse from memory…"
        rows={5}
        disabled={revealed}
        autoFocus
        className="w-full px-4 py-3 rounded-xl border border-border bg-muted/20 text-sm font-['Georgia',serif] leading-relaxed focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all resize-none disabled:opacity-60"
      />

      {!revealed ? (
        <button
          type="button"
          onClick={() => setRevealed(true)}
          disabled={!attempt.trim()}
          className="w-full py-3 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Reveal & Grade
        </button>
      ) : (
        <div className="space-y-5">
          {/* Side-by-side diff */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-muted/20 border border-border space-y-2">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Your attempt</p>
              <p className="text-sm font-['Georgia',serif] leading-relaxed text-foreground/70">{attempt || <em className="text-muted-foreground">nothing typed</em>}</p>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Correct verse</p>
              <p className="text-sm font-['Georgia',serif] leading-relaxed">
                {diff.map((d, i) => (
                  <span
                    key={i}
                    className={cn("mr-1", d.ok ? "text-emerald-800" : "text-red-600 font-semibold")}
                  >
                    {d.word}
                  </span>
                ))}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-center text-sm font-semibold text-muted-foreground">How did you do?</p>
            <GradeButtons onGrade={onGrade} />
          </div>
        </div>
      )}
    </div>
  );
}
