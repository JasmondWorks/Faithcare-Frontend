import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface StreakBannerProps {
  streak: number;
  dueCount: number;
}

export function StreakBanner({ streak, dueCount }: StreakBannerProps) {
  return (
    <div
      className={cn(
        "rounded-2xl p-6 flex items-center gap-5",
        streak >= 7
          ? "bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200"
          : streak > 0
            ? "bg-gradient-to-br from-muted/40 to-muted/20 border border-border"
            : "bg-muted/20 border border-border",
      )}
    >
      <div
        className={cn(
          "text-5xl leading-none select-none shrink-0",
          streak === 0 && "grayscale opacity-40",
        )}
      >
        🔥
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-1.5">
          <span className="text-4xl font-bold text-foreground leading-none">{streak}</span>
          <span className="text-base font-semibold text-muted-foreground">
            {streak === 1 ? "day" : "days"} streak
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {streak === 0
            ? "Start your streak today!"
            : streak >= 7
              ? `${streak}-day streak! You're on fire 🎉`
              : "Keep going — review every day to grow your streak."}
        </p>
        {dueCount > 0 && (
          <p className="text-sm font-semibold text-accent mt-1.5">
            {dueCount} verse{dueCount !== 1 ? "s" : ""} due today
          </p>
        )}
      </div>
      {dueCount > 0 && (
        <Link
          to="/memorization/practice"
          className="shrink-0 px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition-all whitespace-nowrap shadow-sm shadow-accent/20"
        >
          Start Review
        </Link>
      )}
    </div>
  );
}
