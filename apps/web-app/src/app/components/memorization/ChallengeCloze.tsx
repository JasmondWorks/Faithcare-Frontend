import { useState, useRef, useEffect } from "react";
import type { KeyboardEvent } from "react";
import { cn } from "@/lib/utils";
import { GradeButtons } from "./GradeButtons";
import type { ClozeChallenge, Grade } from "@/api/memorization/types";

interface Props {
  challenge: ClozeChallenge;
  onGrade: (grade: Grade) => void;
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z]/g, "");
}

export function ChallengeCloze({ challenge, onGrade }: Props) {
  const blanks = challenge.segments.filter((s) => s.type === "blank");
  const [values, setValues] = useState<string[]>(blanks.map(() => ""));
  const [checked, setChecked] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  let blankIdx = 0;

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      const next = inputRefs.current[idx + 1];
      if (next) next.focus();
      else if (!checked) handleCheck();
    }
  };

  const handleCheck = () => {
    const res = blanks.map((seg, i) => normalize(values[i] ?? "") === normalize(seg.value));
    setResults(res);
    setChecked(true);
  };

  return (
    <div className="space-y-6">
      {/* Inline segments */}
      <div className="leading-loose text-[17px] font-['Georgia',serif] text-foreground">
        {challenge.segments.map((seg) => {
          if (seg.type === "word") {
            return <span key={seg.index}>{seg.value} </span>;
          }

          const localIdx = blankIdx++;
          const isCorrect = results[localIdx];
          const isWrong = checked && !isCorrect;

          return (
            <span key={seg.index} className="inline-flex flex-col items-center mr-1.5 align-bottom">
              <input
                ref={(el) => { inputRefs.current[localIdx] = el; }}
                value={values[localIdx]}
                onChange={(e) => {
                  if (checked) return;
                  const next = [...values];
                  next[localIdx] = e.target.value;
                  setValues(next);
                }}
                onKeyDown={(e) => handleKeyDown(e, localIdx)}
                disabled={checked}
                className={cn(
                  "border-b-2 bg-transparent outline-none text-[17px] text-center font-['Georgia',serif] transition-colors pb-0.5",
                  !checked
                    ? "border-accent/50 focus:border-accent"
                    : isCorrect
                      ? "border-emerald-500 text-emerald-700"
                      : "border-red-500 text-red-700",
                )}
                style={{ width: `${Math.max(seg.value.length * 1.1, 4)}ch` }}
              />
              {isWrong && (
                <span className="text-[11px] text-muted-foreground mt-0.5">{seg.value}</span>
              )}
            </span>
          );
        })}
      </div>

      {!checked ? (
        <button
          type="button"
          onClick={handleCheck}
          disabled={values.some((v) => !v.trim())}
          className="w-full py-3 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Check Answers
        </button>
      ) : (
        <div className="space-y-3">
          <p className="text-center text-sm font-semibold text-muted-foreground">
            {results.every(Boolean) ? "All correct! How did it feel?" : "How did you do?"}
          </p>
          <GradeButtons onGrade={onGrade} />
        </div>
      )}
    </div>
  );
}
