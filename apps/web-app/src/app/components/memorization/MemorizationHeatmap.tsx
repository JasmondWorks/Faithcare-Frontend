import { useState } from "react";
import { cn } from "@/lib/utils";
import type { HeatmapEntry } from "@/api/memorization/types";

interface MemorizationHeatmapProps {
  data: HeatmapEntry[];
}

function getCellColor(count: number): string {
  if (count === 0) return "bg-neutral-100";
  if (count <= 2) return "bg-emerald-200";
  if (count <= 5) return "bg-emerald-400";
  return "bg-emerald-600";
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

export function MemorizationHeatmap({ data }: MemorizationHeatmapProps) {
  const [tooltip, setTooltip] = useState<{ date: string; count: number; x: number; y: number } | null>(null);

  // Build a date → count lookup
  const lookup = new Map(data.map((d) => [d.date, d.count]));

  // Generate last 364 days (52 full weeks), aligned to Sunday start
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endSunday = new Date(today);
  endSunday.setDate(today.getDate() + (7 - today.getDay()) % 7);

  const cells: Array<{ date: string; count: number } | null>[] = [];
  let currentWeek: Array<{ date: string; count: number } | null> = [];

  const start = new Date(endSunday);
  start.setDate(endSunday.getDate() - 364);

  // Pad the start of the first week with nulls
  const startDay = start.getDay();
  for (let i = 0; i < startDay; i++) currentWeek.push(null);

  const cursor = new Date(start);
  while (cursor <= endSunday) {
    const iso = cursor.toISOString().slice(0, 10);
    currentWeek.push({ date: iso, count: lookup.get(iso) ?? 0 });
    if (currentWeek.length === 7) {
      cells.push(currentWeek);
      currentWeek = [];
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) currentWeek.push(null);
    cells.push(currentWeek);
  }

  // Compute month label positions (which column each month starts)
  const monthPositions: Array<{ label: string; col: number }> = [];
  let lastMonth = -1;
  cells.forEach((week, col) => {
    const firstValidDay = week.find((d) => d !== null);
    if (!firstValidDay) return;
    const m = new Date(firstValidDay.date).getMonth();
    if (m !== lastMonth) {
      monthPositions.push({ label: MONTH_LABELS[m], col });
      lastMonth = m;
    }
  });

  return (
    <div className="relative select-none overflow-x-auto pb-2">
      {/* Month labels */}
      <div className="flex ml-8 mb-1" style={{ gap: "3px" }}>
        {cells.map((_, col) => {
          const mp = monthPositions.find((p) => p.col === col);
          return (
            <div key={col} className="shrink-0" style={{ width: 10 }}>
              {mp && (
                <span className="text-[9px] text-muted-foreground font-medium whitespace-nowrap">
                  {mp.label}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex gap-0.5">
        {/* Day of week labels */}
        <div className="flex flex-col mr-1" style={{ gap: "3px" }}>
          {DAY_LABELS.map((label, i) => (
            <div
              key={i}
              className="text-[9px] text-muted-foreground font-medium flex items-center"
              style={{ height: 10, lineHeight: "10px" }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Grid */}
        {cells.map((week, colIdx) => (
          <div key={colIdx} className="flex flex-col" style={{ gap: "3px" }}>
            {week.map((day, rowIdx) => {
              if (!day) {
                return <div key={rowIdx} style={{ width: 10, height: 10 }} />;
              }
              return (
                <div
                  key={rowIdx}
                  className={cn(
                    "rounded-[2px] cursor-default transition-opacity hover:opacity-80",
                    getCellColor(day.count),
                  )}
                  style={{ width: 10, height: 10 }}
                  onMouseEnter={(e) => {
                    const rect = (e.target as HTMLElement).getBoundingClientRect();
                    setTooltip({ date: day.date, count: day.count, x: rect.left, y: rect.top });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none px-2.5 py-1.5 bg-foreground text-background text-xs rounded-lg shadow-lg whitespace-nowrap -translate-x-1/2 -translate-y-full"
          style={{ left: tooltip.x + 5, top: tooltip.y - 6 }}
        >
          {formatDate(tooltip.date)} — {tooltip.count} verse{tooltip.count !== 1 ? "s" : ""} reviewed
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-1.5 mt-3 ml-8">
        <span className="text-[10px] text-muted-foreground">Less</span>
        {["bg-neutral-100", "bg-emerald-200", "bg-emerald-400", "bg-emerald-600"].map((c) => (
          <div key={c} className={cn("rounded-[2px]", c)} style={{ width: 10, height: 10 }} />
        ))}
        <span className="text-[10px] text-muted-foreground">More</span>
      </div>
    </div>
  );
}
