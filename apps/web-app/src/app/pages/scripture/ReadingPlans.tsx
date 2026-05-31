import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  ListChecks,
  Play,
  Pause,
  RotateCcw,
  CalendarDays,
  X,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  getReadingPlans,
  getMyPlan,
  getAllMyPlans,
  getBibles,
  subscribeToplan,
  pausePlan,
  resumePlan,
} from "@/api/scripture/scripture";
import type { ReadingPlan } from "@/api/scripture/types";
import { Button } from "@/components/ui/button";
import { Card } from "../../components/ui/card";
import { PlanProgressCard } from "../../components/scripture/PlanProgressCard";
import { PausedPlanCard } from "../../components/scripture/PausedPlanCard";
import { cn } from "@/lib/utils";

const TRANSLATION_KEY = "scripture_translation_id";

// ── Skeleton ──────────────────────────────────────────────────────────────────

function PlanCardSkeleton() {
  return (
    <div className="animate-pulse space-y-3 p-5 border border-border rounded-2xl">
      <div className="h-5 w-40 bg-muted rounded-lg" />
      <div className="h-4 w-full bg-muted rounded" />
      <div className="h-4 w-3/4 bg-muted rounded" />
      <div className="h-10 bg-muted rounded-xl" />
    </div>
  );
}

// ── Subscribe modal ───────────────────────────────────────────────────────────

interface SubscribeModalProps {
  plan: ReadingPlan;
  bibles: { id: string; name: string; abbreviation: string; language: string }[];
  hasActivePlan: boolean;
  onConfirm: (translationId: string) => void;
  onClose: () => void;
  isLoading: boolean;
}

function SubscribeModal({
  plan,
  bibles,
  hasActivePlan,
  onConfirm,
  onClose,
  isLoading,
}: SubscribeModalProps) {
  const [selectedTranslation, setSelectedTranslation] = useState(
    localStorage.getItem(TRANSLATION_KEY) || bibles[0]?.id || "",
  );

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-2xl border-t border-border p-6 pb-8 max-w-lg mx-auto shadow-2xl space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-bold text-foreground">Start {plan.name}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {plan.totalDays} days · {plan.chaptersPerDay} chapter{plan.chaptersPerDay > 1 ? "s" : ""}/day
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {hasActivePlan && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>This will pause your current plan. You can resume it later.</span>
          </div>
        )}

        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Translation</p>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
            {bibles.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setSelectedTranslation(b.id)}
                className={cn(
                  "text-left px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all",
                  selectedTranslation === b.id
                    ? "border-accent bg-accent/8 text-accent"
                    : "border-border text-foreground hover:border-accent/40",
                )}
              >
                <span className="block font-bold">{b.abbreviation}</span>
                <span className="text-[11px] font-normal text-muted-foreground truncate block">
                  {b.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button
            className="flex-1 gap-2"
            disabled={!selectedTranslation || isLoading}
            isLoading={isLoading}
            onClick={() => onConfirm(selectedTranslation)}
          >
            <Play className="w-4 h-4" />
            Confirm & Start
          </Button>
        </div>
      </div>
    </>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ReadingPlans() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedPlan, setSelectedPlan] = useState<ReadingPlan | null>(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(new Set());

  const { data: plansRes, isLoading: plansLoading } = useQuery({
    queryKey: ["reading-plans"],
    queryFn: getReadingPlans,
    staleTime: 30 * 60_000,
  });

  const { data: myPlanRes, isLoading: myPlanLoading } = useQuery({
    queryKey: ["my-plan"],
    queryFn: getMyPlan,
    staleTime: 2 * 60_000,
  });

  const { data: allPlansRes } = useQuery({
    queryKey: ["my-plans-all"],
    queryFn: getAllMyPlans,
    staleTime: 2 * 60_000,
  });

  const { data: biblesRes } = useQuery({
    queryKey: ["bibles"],
    queryFn: getBibles,
    staleTime: 30 * 60_000,
  });

  const plans = plansRes?.data ?? [];
  const myPlan = myPlanRes?.data ?? null;
  const bibles = biblesRes?.data ?? [];
  const pausedPlans = (allPlansRes?.data ?? []).filter(
    (p) => p.status === "paused" && p.id !== myPlan?.id,
  );

  const subscribeMutation = useMutation({
    mutationFn: ({ planId, translationId }: { planId: string; translationId: string }) =>
      subscribeToplan(planId, translationId),
    onSuccess: () => {
      toast.success("Plan started! Reading begins today.");
      // Remove (not just invalidate) so Today mounts with a fresh fetch,
      // not a stale-while-revalidate flash of the old plan.
      queryClient.removeQueries({ queryKey: ["scripture-today"] });
      queryClient.removeQueries({ queryKey: ["my-plan"] });
      queryClient.removeQueries({ queryKey: ["my-plans-all"] });
      setSelectedPlan(null);
      navigate("/scripture");
    },
    onError: (e: Error) => toast.error(e.message || "Failed to start plan"),
  });

  const pauseMutation = useMutation({
    mutationFn: pausePlan,
    onSuccess: () => {
      toast.success("Plan paused");
      queryClient.removeQueries({ queryKey: ["scripture-today"] });
      queryClient.invalidateQueries({ queryKey: ["my-plan"] });
      queryClient.invalidateQueries({ queryKey: ["my-plans-all"] });
    },
    onError: () => toast.error("Failed to pause plan"),
  });

  const resumeMutation = useMutation({
    mutationFn: resumePlan,
    onSuccess: () => {
      toast.success("Plan resumed!");
      queryClient.removeQueries({ queryKey: ["my-plan"] });
      queryClient.removeQueries({ queryKey: ["my-plans-all"] });
      queryClient.removeQueries({ queryKey: ["scripture-today"] });
      navigate("/scripture");
    },
    onError: () => toast.error("Failed to resume plan"),
  });

  const handleStartPlan = (plan: ReadingPlan) => {
    setSelectedPlan(plan);
  };

  const handleConfirmSubscribe = (translationId: string) => {
    if (!selectedPlan) return;
    localStorage.setItem(TRANSLATION_KEY, translationId);
    subscribeMutation.mutate({ planId: selectedPlan.id, translationId });
  };

  const toggleDescription = (id: string) => {
    setExpandedDescriptions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const isLoading = plansLoading || myPlanLoading;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* ── Active plan section ── */}
      {myPlan && (
        <section className="space-y-4">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            Your Active Plan
          </p>
          <Card
            variant="interactive"
            padding="lg"
            className="space-y-4"
            onClick={() => navigate("/scripture")}
          >
            <PlanProgressCard
              currentDay={myPlan?.currentDay}
              totalDays={myPlan?.totalDays}
              planName={myPlan?.planName}
              status={myPlan?.status}
            />

            <div className="flex items-center gap-2 flex-wrap pt-1" onClick={(e) => e.stopPropagation()}>
              <span className="text-[11px] font-semibold bg-muted text-muted-foreground px-2 py-1 rounded-full uppercase tracking-wider">
                {myPlan.translationId}
              </span>
              <span className="text-[11px] text-muted-foreground">
                Started {new Date(myPlan.startDate).toLocaleDateString("en-US", { month: "long", day: "numeric" })}
              </span>
            </div>

            <div className="flex gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
              {myPlan.status === "active" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-amber-600 border-amber-200 hover:bg-amber-50"
                  disabled={pauseMutation.isPending}
                  isLoading={pauseMutation.isPending}
                  onClick={() => pauseMutation.mutate()}
                >
                  <Pause className="w-3.5 h-3.5" />
                  Pause Plan
                </Button>
              )}
              {myPlan.status === "paused" && (
                <Button
                  size="sm"
                  className="gap-1.5"
                  disabled={resumeMutation.isPending}
                  isLoading={resumeMutation.isPending}
                  onClick={() => resumeMutation.mutate(myPlan.id)}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Resume Plan
                </Button>
              )}
              {myPlan.status === "completed" && (
                <div className="flex items-center gap-1.5 text-sm text-emerald-600 font-semibold">
                  <CheckCircle2 className="w-4 h-4" /> Plan Completed!
                </div>
              )}
            </div>
          </Card>
        </section>
      )}

      {/* ── Paused plans section ── */}
      {pausedPlans.length > 0 && (
        <section className="space-y-3">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            Paused Plans
          </p>
          <div className="space-y-3">
            {pausedPlans.map((plan) => (
              <PausedPlanCard
                key={plan.id}
                plan={plan}
                hasActivePlan={myPlan?.status === "active"}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── All plans ── */}
      <section className="space-y-4">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          {myPlan ? "Other Plans" : "Choose a Plan"}
        </p>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <PlanCardSkeleton key={i} />)}
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-12 text-sm text-muted-foreground">
            <ListChecks className="w-10 h-10 mx-auto mb-3 opacity-30" />
            No reading plans available.
          </div>
        ) : (
          <div className="space-y-4">
            {plans.map((plan) => {
              const expanded = expandedDescriptions.has(plan.id);
              return (
                <Card key={plan.id} padding="lg" className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-bold text-foreground">{plan.name}</h3>
                        <span className="text-[11px] font-semibold bg-accent/10 text-accent px-2 py-0.5 rounded-full">
                          {plan.chaptersPerDay} ch/day
                        </span>
                      </div>
                      <p className={cn("text-sm text-muted-foreground leading-relaxed", !expanded && "line-clamp-2")}>
                        {plan.description}
                      </p>
                      {plan.description.length > 100 && (
                        <button
                          type="button"
                          onClick={() => toggleDescription(plan.id)}
                          className="text-xs text-accent font-semibold mt-1 hover:underline"
                        >
                          {expanded ? "Show less" : "Read more"}
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0 text-muted-foreground">
                      <CalendarDays className="w-3.5 h-3.5" />
                      <span className="text-xs font-bold">{plan.totalDays}d</span>
                    </div>
                  </div>

                  <Button
                    variant={myPlan?.planId === plan.id ? "outline" : "default"}
                    className="w-full gap-2"
                    onClick={() => handleStartPlan(plan)}
                  >
                    {myPlan?.planId === plan.id ? (
                      <><BookOpen className="w-4 h-4" /> Current Plan</>
                    ) : (
                      <><Play className="w-4 h-4" /> Start Plan</>
                    )}
                  </Button>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Subscribe modal */}
      {selectedPlan && bibles.length > 0 && (
        <SubscribeModal
          plan={selectedPlan}
          bibles={bibles}
          hasActivePlan={!!myPlan && myPlan.status === "active"}
          onConfirm={handleConfirmSubscribe}
          onClose={() => setSelectedPlan(null)}
          isLoading={subscribeMutation.isPending}
        />
      )}
    </div>
  );
}
