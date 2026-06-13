import { useLayout } from "../contexts/LayoutContext";
import { useEffect } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Loader2,
  History,
  Clock,
} from "lucide-react";
import { useSearch } from "../contexts/SearchContext";
import { Card } from "./ui/card";
import { Button } from "@/components/ui/button";
import { InputField } from "./ui/InputField";
import TimerHistoryTable from "./TimerHistoryTable";
import AppPagination from "./ui/AppPagination";
import { useFocusTimer } from "../contexts/FocusTimerContexts";

export function FocusTimer() {
  const { setHeader } = useLayout();
  useEffect(() => {
    setHeader(
      "Focus Timer",
      "Stay focused and productive with intentional work sessions.",
    );
  }, []);

  const { searchTerm } = useSearch();

  const {
    timeLeft,
    setTimeLeft,
    totalDuration,
    setTotalDuration,
    isRunning,
    isCompleted,
    customMinutes,
    setCustomMinutes,
    isInitializing,
    history,
    isLoadingHistory,
    page,
    setPage,
    totalPages,
    handleStartPause,
    handleReset,
    handleDeleteHistory,
    formatTime,
  } = useFocusTimer();

  const safeProgress =
    totalDuration > 0 ? ((totalDuration - timeLeft) / totalDuration) * 100 : 0;

  // Filter history based on search
  const filteredHistory = history.filter(
    (session) =>
      session.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.duration.toString().includes(searchTerm),
  );

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 flex flex-col items-center justify-start">
          <Card className="w-full max-w-2xl text-center relative overflow-hidden transition-all duration-500">
            <div className="absolute top-0 left-0 w-full h-1 bg-muted">
              <div
                className="h-full bg-accent transition-all duration-1000"
                style={{ width: `${safeProgress}%` }}
              />
            </div>

            {isCompleted ? (
              <div className="py-8 animate-in fade-in zoom-in duration-500">
                <div className="flex justify-center mb-8">
                  <div className="w-24 h-24 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-12 h-12 text-success" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  Well done!
                </h2>
                <blockquote className="text-xl text-foreground leading-relaxed mb-6 italic opacity-80 font-medium">
                  "Whatever you do, work at it with all your heart, as working
                  for the Lord..."
                </blockquote>
                <Button
                  onClick={handleReset}
                  className="px-12 py-4 font-bold shadow-lg shadow-primary/20"
                >
                  Start New Session
                </Button>
              </div>
            ) : (
              <>
                <div className="mb-10">
                  <p className="text-[10px] text-muted-foreground mb-6 uppercase tracking-[0.2em] font-bold">
                    Focus Session
                  </p>
                  <div className="relative inline-block">
                    <svg className="w-64 h-64 md:w-80 md:h-80 transform -rotate-90">
                      <circle
                        cx="50%"
                        cy="50%"
                        r="45%"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-muted/30"
                      />
                      <circle
                        cx="50%"
                        cy="50%"
                        r="45%"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray="283"
                        strokeDashoffset={283 * (1 - safeProgress / 100)}
                        strokeLinecap="round"
                        className="text-accent transition-all duration-1000 shadow-lg shadow-accent/50"
                        style={{
                          strokeDasharray: "283",
                          strokeDashoffset: 283 * (1 - safeProgress / 100),
                        }}
                        pathLength="100"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-6xl md:text-7xl font-bold text-foreground tabular-nums tracking-tighter">
                        {formatTime(timeLeft)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-6">
                  <Button
                    onClick={handleStartPause}
                    className="flex items-center gap-3 px-12 py-5 shadow-xl shadow-primary/20 font-bold"
                  >
                    {isRunning ? (
                      <>
                        <Pause className="w-6 h-6 fill-current" /> Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-6 h-6 fill-current ml-1" /> Start
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="iconSquare"
                    onClick={handleReset}
                    className="border-neutral-200"
                    title="Reset Timer"
                  >
                    <RotateCcw className="w-6 h-6" />
                  </Button>
                </div>
              </>
            )}
          </Card>

          {!isRunning && !isCompleted && (
            <div className="w-full max-w-2xl mt-8 space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <Card>
                <label className="block text-xs font-bold text-muted-foreground mb-6 uppercase tracking-widest text-center">
                  Set Custom Duration
                </label>
                <div className="flex flex-col md:flex-row gap-4">
                  <InputField
                    type="number"
                    name="customMinutes"
                    value={customMinutes}
                    onChange={(e: { target: { value: unknown } }) => {
                      const val = String(e.target.value);
                      setCustomMinutes(val);
                      const mins = parseInt(val) || 0;
                      setTimeLeft(mins * 60);
                      setTotalDuration(mins * 60);
                    }}
                    icon={<Clock className="w-5 h-5 text-accent" />}
                    placeholder="Minutes"
                  />
                  <div className="flex gap-2">
                    {[15, 25, 45, 60].map((mins) => (
                      <Button
                        key={mins}
                        variant={
                          parseInt(customMinutes) === mins
                            ? "default"
                            : "outline"
                        }
                        onClick={() => {
                          setCustomMinutes(mins.toString());
                          setTimeLeft(mins * 60);
                          setTotalDuration(mins * 60);
                        }}
                      >
                        {mins}m
                      </Button>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>

        <div className="lg:col-span-4 flex flex-col h-[calc(100vh-200px)]">
          <Card className="flex flex-col h-full overflow-hidden">
            <div className="p-6 border-b border-border flex items-center justify-between bg-muted/30">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-accent" />
                <h3 className="font-bold text-foreground">
                  {searchTerm ? "Search Results" : "Session History"}
                </h3>
              </div>
              <span className="text-[10px] font-bold px-3 py-1 bg-accent/10 text-accent rounded-full uppercase tracking-widest">
                {filteredHistory.length} Records
              </span>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar border-b border-border">
              <TimerHistoryTable
                data={filteredHistory}
                onDelete={handleDeleteHistory}
                isLoading={isLoadingHistory}
                emptyMessage={
                  searchTerm ? "No matches found." : "No records yet."
                }
              />
            </div>
            {totalPages > 1 && (
              <div className="p-2">
                <AppPagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
