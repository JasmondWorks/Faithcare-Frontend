import { useState, useEffect } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { CheckCircle2, Circle, BookOpen, X, ArrowRight, NotebookPen, Loader2, AlertTriangle } from "lucide-react";
import { saveScriptureNotes, getAllMyPlans, resumePlan } from "@/api/scripture/scripture";
import type { UserDailyScripture } from "@/api/scripture/types";
import { Dialog, DialogContent } from "../ui/dialog";
import { JournalEditor } from "../ui/JournalEditor";
import { toast } from "react-hot-toast";

interface VerseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: UserDailyScripture;
  onNotesUpdated?: (newNotes: string) => void;
  onReadInBible?: () => void;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

export function VerseDetailModal({
  isOpen,
  onClose,
  entry,
  onNotesUpdated,
  onReadInBible,
}: VerseDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(entry.personalNotes ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();

  // Reset states when the entry or open state changes
  useEffect(() => {
    setNotes(entry.personalNotes ?? "");
    setIsEditing(false);
  }, [entry, isOpen]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await saveScriptureNotes(entry.id, notes);
      if (res.success) {
        toast.success("Notes saved successfully!");
        if (onNotesUpdated) {
          onNotesUpdated(notes);
        }
        queryClient.invalidateQueries({ queryKey: ["scripture-history"] });
        queryClient.invalidateQueries({ queryKey: ["scripture-today"] });
        setIsEditing(false);
      } else {
        toast.error(res.error || "Failed to save notes");
      }
    } catch (err) {
      toast.error("An error occurred while saving notes");
    } finally {
      setIsSaving(false);
    }
  };

  const { data: allPlansRes } = useQuery({
    queryKey: ["my-plans-all"],
    queryFn: getAllMyPlans,
    enabled: isOpen,
    staleTime: 2 * 60_000,
  });

  const userReadingPlanId = (entry as any).userReadingPlanId || (entry as any).userReadingPlan?.id || (entry as any).userReadingPlan;
  
  // Find associated plan by ID or by planName/title matching (to support legacy duplicate plans)
  const associatedPlan = allPlansRes?.data?.find(
    (p) => String(p.id) === String(userReadingPlanId),
  ) || allPlansRes?.data?.find(
    (p) => p.planName && entry.title && String(p.planName).toLowerCase() === String(entry.title).toLowerCase(),
  );

  const isPlanPaused = associatedPlan?.status === "paused";

  const handleResumeAndEdit = async () => {
    if (!associatedPlan) return;
    setIsSaving(true);
    try {
      const res = await resumePlan(associatedPlan.id);
      if (res.success) {
        toast.success("Plan resumed! Notes unlocked.");
        await queryClient.invalidateQueries({ queryKey: ["my-plans-all"] });
        await queryClient.invalidateQueries({ queryKey: ["my-plan"] });
        await queryClient.invalidateQueries({ queryKey: ["scripture-history"] });
        await queryClient.invalidateQueries({ queryKey: ["scripture-today"] });
      } else {
        toast.error(res.error || "Failed to resume plan");
      }
    } catch (err) {
      toast.error("An error occurred while resuming plan");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-md w-[calc(100%-2rem)] max-h-[90vh] overflow-y-auto rounded-2xl border border-border shadow-2xl p-6 space-y-5 focus:outline-none z-[100] [&>button]:hidden">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4 text-accent" />
            </div>
            <p className="text-sm font-bold text-accent uppercase tracking-widest leading-tight">
              {entry.scriptureReference || "Daily Verse"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground shrink-0 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Date + status */}
        <div className="flex items-center gap-3">
          <p className="text-sm text-muted-foreground">{formatDate(entry.date)}</p>
          {entry.isCompleted ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              <CheckCircle2 className="w-3 h-3" />
              Completed
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              <Circle className="w-3 h-3" />
              Not completed
            </span>
          )}
        </div>

        {/* Personal notes */}
        <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Your notes
            </p>
            {!isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
              >
                <NotebookPen className="w-3.5 h-3.5" />
                Edit
              </button>
            )}
          </div>

          {isEditing ? (
            isPlanPaused ? (
              <div className="space-y-4 py-2">
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-amber-800 text-xs animate-in fade-in slide-in-from-top-1">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold">Plan is Paused</p>
                    <p className="leading-relaxed">
                      This reading is part of the <span className="font-bold">{associatedPlan?.planName}</span> plan, which is currently paused. Resuming it will automatically pause any other active plan.
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={handleResumeAndEdit}
                    className="px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-semibold hover:bg-accent-hover transition-colors flex items-center gap-1 disabled:opacity-50"
                  >
                    {isSaving && <Loader2 className="w-3 h-3 animate-spin" />}
                    Resume & Edit
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <JournalEditor
                  value={notes}
                  onChange={(html) => setNotes(html)}
                  placeholder="Write your thoughts, prayers, or insights…"
                  className="min-h-[120px] px-3 py-2 rounded-xl border border-border bg-background text-sm focus-within:ring-2 focus-within:ring-accent focus-within:border-accent transition-all"
                />
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => {
                      setIsEditing(false);
                      setNotes(entry.personalNotes ?? ""); // Reset to original
                    }}
                    className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isSaving || notes === (entry.personalNotes ?? "")}
                    onClick={handleSave}
                    className="px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-semibold hover:bg-accent-hover transition-colors flex items-center gap-1 disabled:opacity-50"
                  >
                    {isSaving && <Loader2 className="w-3 h-3 animate-spin" />}
                    Save
                  </button>
                </div>
              </div>
            )
          ) : entry.personalNotes ? (
            <div
              className="text-sm text-foreground/80 leading-relaxed prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: entry.personalNotes }}
            />
          ) : (
            <div className="text-center py-4 space-y-2">
              <p className="text-xs text-muted-foreground/60 italic">
                No notes added for this reading.
              </p>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
              >
                <NotebookPen className="w-3.5 h-3.5" />
                Add Note
              </button>
            </div>
          )}
        </div>

        {/* Read in Bible CTA — only for entries with chapter info */}
        {onReadInBible && (
          <button
            type="button"
            onClick={onReadInBible}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-accent/30 text-accent text-sm font-semibold hover:bg-accent/5 transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            Read in Bible
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </DialogContent>
    </Dialog>
  );
}
