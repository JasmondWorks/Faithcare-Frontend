import { useLayout } from "../contexts/LayoutContext";
import { useEffect, useState } from "react";
import { CheckCircle, Send, Loader2, Plus } from "lucide-react";
import { useSearch } from "../contexts/SearchContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "./ui/card";
import { Button } from "@/components/ui/button";
import SecondTimersTable from "./SecondTimersTable";
import { getFirstTimers } from "@/api/organization/church";
import { useAuth } from "../providers/AuthProvider";
import { AddMemberModal } from "./AddMemberModal";

interface FirstTimerRow {
  id?: string;
  _id?: string;
  visitType?: string;
  visit_type?: string;
  name?: string;
  fullName?: string;
  phone?: string;
  phoneNumber?: string;
  email?: string;
  serviceDate?: string;
  createdAt?: string;
  secondVisitDate?: string;
  status?: string;
  prayerRequest?: string;
}

export function SecondTimers() {
  const { setHeader } = useLayout();
  useEffect(() => {
    setHeader("Second Timers", "Manage second timers and their registration");
  }, []);

  const { searchTerm } = useSearch();
  const { user } = useAuth();
  const organizationId = user?.organizationId || "";
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 20;

  // Uses its own "second-timers" key â€” completely isolated from "first-timers" queries.
  // Only refreshes when:
  //   1. "Make second timer" button is clicked (invalidates ["second-timers"])
  //   2. A member is manually added via the modal below (invalidates ["second-timers"])
  const { data: secondTimersResponse, isLoading } = useQuery({
    queryKey: ["second-timers", organizationId, page],
    queryFn: () =>
      getFirstTimers({
        organizationId,
        visit_type: "second_time",
        page,
        limit,
      }),
    enabled: !!organizationId,
  });

  // Robustly find the array regardless of nesting
  const findArray = (obj: unknown): unknown[] => {
    if (!obj) return [];
    if (Array.isArray(obj)) return obj;
    if (typeof obj === "object") {
      for (const key in obj) {
        const value = (obj as Record<string, unknown>)[key];
        if (Array.isArray(value)) return value;
        if (typeof value === "object" && value !== null) {
          const nested = findArray(value);
          if (nested.length > 0) return nested;
        }
      }
    }
    return [];
  };

  const rawData = findArray(secondTimersResponse) as FirstTimerRow[];

  // CLIENT-SIDE GUARD: only show records explicitly marked as second_time.
  // This ensures correctness even if the backend ignores the visit_type query param.
  const secondTimerRecords = rawData.filter((ft: FirstTimerRow) => {
    const vt = (ft.visitType || ft.visit_type || "").toLowerCase();
    return vt === "second_time" || vt === "second";
  });

  const timers = secondTimerRecords.map((ft: FirstTimerRow) => ({
    id: ft.id || ft._id,
    name: ft.fullName || ft.name || "N/A",
    fullName: ft.fullName || ft.name || "N/A",
    phone: ft.phoneNumber || ft.phone || "N/A",
    email: ft.email || "N/A",
    firstVisit: ft.serviceDate || ft.createdAt?.split("T")[0] || "N/A",
    secondVisit: ft.secondVisitDate || "N/A",
    status: ft.status || "PENDING",
    prayerRequest: ft.prayerRequest || "None",
  }));

  const filteredData = timers.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.prayerRequest.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-2">
        <div>
          <h2 className="text-foreground font-bold text-xl mb-2">
            Second Timer Tracking
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            View first time visitors who have returned for a second visit.{" "}
            Mark them as "Second Timers" to celebrate their continued engagement
            and plan appropriate follow-up.
          </p>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="h-11 px-6 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all flex items-center gap-2 group"
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
          Add Second Timer
        </Button>
      </div>

      {/* Only invalidates 'second-timers' â€” first-timers page is never touched */}
      <AddMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        type="second-timers"
        onSuccess={() =>
          queryClient.invalidateQueries({ queryKey: ["second-timers"] })
        }
      />

      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold mb-3 text-accent-foreground/70">
                  Confirmed Second Timers
                </p>
                <h3 className="text-3xl font-bold">{timers.length}</h3>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold mb-3 text-accent-foreground/70">
                  Follow-up Required
                </p>
                <h3 className="text-3xl font-bold">
                  {timers.filter((t) => t.status === "PENDING").length}
                </h3>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Send className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-accent-foreground/70 mb-3">
                  Active Engagement
                </p>
                <h3 className="text-3xl font-bold text-accent-foreground">
                  100%
                </h3>
              </div>
              <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-accent" />
              </div>
            </div>
          </Card>
        </div>

        <SecondTimersTable
          data={filteredData}
          currentPage={page}
          totalPages={secondTimersResponse?.meta?.totalPages || 1}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
