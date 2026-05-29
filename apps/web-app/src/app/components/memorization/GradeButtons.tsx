import type { Grade } from "@/api/memorization/types";

interface GradeButtonsProps {
  onGrade: (grade: Grade) => void;
  disabled?: boolean;
}

export function GradeButtons({ onGrade, disabled = false }: GradeButtonsProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <button
        type="button"
        disabled={disabled}
        onClick={() => onGrade("perfect")}
        className="flex flex-col items-center gap-1.5 min-h-[56px] px-3 py-3 rounded-xl border-2 border-emerald-200 bg-emerald-50 text-emerald-700 font-semibold text-sm transition-all hover:bg-emerald-100 hover:border-emerald-300 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <span className="text-lg leading-none">✅</span>
        <span>Perfect</span>
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onGrade("hesitant")}
        className="flex flex-col items-center gap-1.5 min-h-[56px] px-3 py-3 rounded-xl border-2 border-amber-200 bg-amber-50 text-amber-700 font-semibold text-sm transition-all hover:bg-amber-100 hover:border-amber-300 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <span className="text-lg leading-none">🤔</span>
        <span>Hesitant</span>
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onGrade("failed")}
        className="flex flex-col items-center gap-1.5 min-h-[56px] px-3 py-3 rounded-xl border-2 border-red-200 bg-red-50 text-red-700 font-semibold text-sm transition-all hover:bg-red-100 hover:border-red-300 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <span className="text-lg leading-none">❌</span>
        <span>Forgot</span>
      </button>
    </div>
  );
}
