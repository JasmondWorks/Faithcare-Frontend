import { cn } from "@/lib/utils";

interface PlanProgressCardProps {
  currentDay: number;
  totalDays: number;
  planName: string;
  status: "active" | "paused" | "completed";
}

const statusStyles = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  paused: "bg-amber-50 text-amber-700 border-amber-200",
  completed: "bg-accent/10 text-accent border-accent/20",
};

const statusLabels = {
  active: "Active",
  paused: "Paused",
  completed: "Completed ✓",
};

export function PlanProgressCard({
  currentDay,
  totalDays,
  planName,
  status,
}: PlanProgressCardProps) {
  const pct = totalDays > 0 ? Math.min((currentDay / totalDays) * 100, 100) : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <p className="font-bold text-foreground text-sm truncate">{planName}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Day {currentDay} of {totalDays}
          </p>
        </div>
        <span
          className={cn(
            "inline-flex items-center px-2.5 py-1 rounded-full border text-[11px] font-bold uppercase tracking-wider shrink-0",
            statusStyles[status],
          )}
        >
          {statusLabels[status]}
        </span>
      </div>

      {/* Progress bar */}
      <div className="relative h-1 bg-border rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-accent rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-[11px] text-muted-foreground text-right">
        {Math.round(pct)}% complete
      </p>
    </div>
  );
}
