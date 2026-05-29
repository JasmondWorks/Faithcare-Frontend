import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { RotateCcw } from "lucide-react";
import { toast } from "react-hot-toast";
import { resumePlan } from "@/api/scripture/scripture";
import type { UserReadingPlan } from "@/api/scripture/types";
import { Button } from "@/components/ui/button";
import { Card } from "../ui/card";

interface PausedPlanCardProps {
  plan: UserReadingPlan;
  hasActivePlan: boolean;
}

export function PausedPlanCard({ plan, hasActivePlan }: PausedPlanCardProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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

  return (
    <Card padding="lg" className="space-y-3 opacity-80">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-bold text-foreground">{plan.planName}</h3>
            <span className="text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
              Paused
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Day {plan.currentDay} of {plan.totalDays} · {plan.translationId}
          </p>
        </div>
        <span className="text-xs font-bold text-muted-foreground shrink-0">{plan.progressPercent}%</span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-muted-foreground/40 rounded-full transition-all"
          style={{ width: `${plan.progressPercent}%` }}
        />
      </div>

      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 w-full"
        disabled={resumeMutation.isPending}
        isLoading={resumeMutation.isPending}
        onClick={() => resumeMutation.mutate(plan.id)}
      >
        <RotateCcw className="w-3.5 h-3.5" />
        Resume Plan
        {hasActivePlan && (
          <span className="text-[10px] text-muted-foreground font-normal ml-1">
            (pauses current)
          </span>
        )}
      </Button>
    </Card>
  );
}
