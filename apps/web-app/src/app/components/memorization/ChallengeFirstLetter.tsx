import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { GradeButtons } from "./GradeButtons";
import type { FirstLetterChallenge, Grade } from "@/api/memorization/types";

interface Props {
  challenge: FirstLetterChallenge;
  onGrade: (grade: Grade) => void;
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z]/g, "");
}

export function ChallengeFirstLetter({ challenge, onGrade }: Props) {
  const [input, setInput] = useState("");
  const [checked, setChecked] = useState(false);
  const [wordResults, setWordResults] = useState<boolean[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCheck = () => {
    const typed = input.trim().split(/\s+/);
    const results = challenge.words.map((word, i) => normalize(typed[i] ?? "") === normalize(word));
    setWordResults(results);
    setChecked(true);
  };

  const allCorrect = wordResults.length > 0 && wordResults.every(Boolean);

  return (
    <div className="space-y-6">
      {/* Prompt tiles */}
      <div className="flex flex-wrap gap-1.5">
        {challenge.prompt.map((letter, i) => (
          <div
            key={i}
            className={cn(
              "w-9 h-9 flex items-center justify-center rounded-lg border-2 font-bold text-sm uppercase transition-colors",
              !checked
                ? "border-border bg-muted/30 text-foreground"
                : wordResults[i]
                  ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                  : "border-red-300 bg-red-50 text-red-700",
            )}
          >
            {letter}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Type the full verse
        </label>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => { setInput(e.target.value); setChecked(false); setWordResults([]); }}
          onKeyDown={(e) => e.key === "Enter" && !checked && handleCheck()}
          placeholder="Start typing…"
          className="w-full px-4 py-3 rounded-xl border border-border bg-muted/20 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all"
          autoFocus
        />
      </div>

      {/* Word-by-word feedback */}
      {checked && (
        <div className="flex flex-wrap gap-1.5 p-4 bg-muted/20 rounded-xl">
          {challenge.words.map((word, i) => (
            <span
              key={i}
              className={cn(
                "text-sm font-medium px-1.5 py-0.5 rounded",
                wordResults[i]
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-red-100 text-red-800",
              )}
            >
              {word}
            </span>
          ))}
        </div>
      )}

      {/* Check or grade */}
      {!checked ? (
        <button
          type="button"
          onClick={handleCheck}
          disabled={!input.trim()}
          className="w-full py-3 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Check Answer
        </button>
      ) : (
        <div className="space-y-3">
          <p className="text-center text-sm font-semibold text-muted-foreground">
            {allCorrect ? "Correct! How confident were you?" : "How did you do?"}
          </p>
          <GradeButtons onGrade={onGrade} />
        </div>
      )}
    </div>
  );
}
