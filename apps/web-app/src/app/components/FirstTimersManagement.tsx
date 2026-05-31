import { useLayout } from "../contexts/LayoutContext";
import { Download, RefreshCw, QrCode } from "lucide-react";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getFirstTimers,
  getMyOrganization,
  regenerateOrganizationQrCode,
} from "@/api/organization/church";
import { useAuth } from "../providers/AuthProvider";
import { toast } from "react-hot-toast";
import { useSearch } from "../contexts/SearchContext";
import { AddMemberModal } from "./AddMemberModal";
import FirstTimersTable from "./FirstTimersTable";
import { Card } from "./ui/card";
import { Button } from "@/components/ui/button";

/** Raw, loosely-typed first-timer row coming back from the API. */
interface RawRecord {
  id?: string;
  _id?: string;
  name?: string;
  fullName?: string;
  phone?: string;
  phoneNumber?: string;
  email?: string;
  prayerRequest?: string;
  status?: string;
  serviceDate?: string;
  createdAt?: string;
  visitType?: string;
  visit_type?: string;
}

/** Handles URL strings, data URIs, and raw base64. */
function resolveQrSrc(raw: string): string {
  if (!raw) return "";
  if (raw.startsWith("http") || raw.startsWith("data:")) return raw;
  return `data:image/png;base64,${raw}`;
}

function QrPanel({ orgId }: { orgId: string }) {
  const queryClient = useQueryClient();

  const { data: orgRaw, isLoading } = useQuery({
    queryKey: ["my-organization"],
    queryFn: getMyOrganization,
    enabled: !!orgId,
    staleTime: 5 * 60_000,
  });

  const org = (orgRaw?.data ?? orgRaw) as
    | { firstTimerQrCode?: string | null; id?: string; _id?: string }
    | undefined;
  const qrSrc = resolveQrSrc(org?.firstTimerQrCode ?? "");
  const resolvedId = org?.id ?? org?._id ?? orgId;

  const regenMutation = useMutation({
    mutationFn: () => regenerateOrganizationQrCode(resolvedId),
    onSuccess: () => {
      toast.success("QR code regenerated.");
      queryClient.invalidateQueries({ queryKey: ["my-organization"] });
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : "Failed to regenerate"),
  });

  const handleDownload = () => {
    if (!qrSrc) return;
    const a = document.createElement("a");
    a.href = qrSrc;
    a.download = "first-timer-qr-code.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <Card padding="lg" className="border-accent/10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        {/* Left */}
        <div className="flex-1 min-w-0">
          <h3 className="text-foreground text-base sm:text-xl font-bold mb-1">
            First Timer Registration QR
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed mb-5">
            Display or share this code at your entrance. Visitors scan it to
            fill in their details and register as a first-time visitor.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleDownload}
              disabled={!qrSrc || isLoading}
            >
              <Download className="w-4 h-4" />
              Download
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground"
              onClick={() => regenMutation.mutate()}
              disabled={regenMutation.isPending || isLoading}
            >
              <RefreshCw
                className={`w-4 h-4 ${regenMutation.isPending ? "animate-spin" : ""}`}
              />
              Regenerate
            </Button>
          </div>
        </div>

        {/* Right: QR image */}
        <div className="shrink-0">
          <div className="w-28 h-28 sm:w-36 sm:h-36 bg-white rounded-2xl border border-border/60 shadow-sm flex items-center justify-center overflow-hidden p-2">
            {isLoading ? (
              <QrCode className="w-12 h-12 text-muted-foreground/20 animate-pulse" />
            ) : qrSrc ? (
              <img
                src={qrSrc}
                alt="First timer registration QR code"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center gap-1.5 text-center px-2">
                <QrCode className="w-10 h-10 text-muted-foreground/30" />
                <p className="text-[10px] text-muted-foreground/50 leading-tight">
                  QR not available
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

export function FirstTimersManagement() {
  const { setHeader } = useLayout();
  useEffect(() => {
    setHeader(
      "First Timers Management",
      "Manage first timers and their registration",
    );
  }, []);

  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { searchTerm } = useSearch();
  const organizationId = user?.organizationId || "";

  // States for filters
  const [statusFilter] = useState<string>("all");
  const [selectedSunday] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data: firstTimersResponse } = useQuery({
    queryKey: ["first-timers", organizationId, statusFilter, searchTerm, page],
    queryFn: () =>
      getFirstTimers({
        organizationId,
        visit_type: "first_time",
        status:
          statusFilter === "all"
            ? undefined
            : (statusFilter as "PENDING" | "CONTACTED" | "FOLLOWED_UP"),
        search: searchTerm || undefined,
        page,
        limit,
      }),
    enabled: !!organizationId,
  });

  // Helper to deeply find the first array in an object
  const findArray = (obj: unknown): RawRecord[] => {
    if (!obj) return [];
    if (Array.isArray(obj)) return obj as RawRecord[];
    if (typeof obj === "object") {
      for (const value of Object.values(obj as Record<string, unknown>)) {
        if (Array.isArray(value)) return value as RawRecord[];
        if (typeof value === "object" && value !== null) {
          const nested = findArray(value);
          if (nested.length > 0) return nested;
        }
      }
    }
    return [];
  };

  const firstTimersData = findArray(firstTimersResponse);

  // Keep firstTimersList for local filtering logic only
  const firstTimersList = firstTimersData
    .map((ft: RawRecord) => ({
      id: ft.id || ft._id,
      name: ft.fullName || ft.name || "N/A",
      fullName: ft.fullName || ft.name || "N/A",
      phone: ft.phoneNumber || ft.phone || "N/A",
      phoneNumber: ft.phoneNumber || ft.phone || "N/A",
      email: ft.email || "N/A",
      prayerRequest: ft.prayerRequest || "None",
      status: ft.status || "PENDING",
      sunday: ft.serviceDate || ft.createdAt?.split("T")[0] || "N/A",
      serviceDate: ft.serviceDate || ft.createdAt?.split("T")[0] || "N/A",
      firstVisit: ft.serviceDate || ft.createdAt?.split("T")[0] || "N/A",
      visitType: ft.visitType || ft.visit_type || "first_time",
    }))
    .filter(
      (ft) => ft.status !== "PROMOTED" && ft.visitType !== "second_time",
    );

  // Combine all local filters safely
  let displayedData = firstTimersList;

  if (statusFilter && statusFilter !== "all") {
    displayedData = displayedData.filter(
      (p) => p.status.toUpperCase() === statusFilter.toUpperCase(),
    );
  }

  if (selectedSunday) {
    displayedData = displayedData.filter((p) => p.sunday === selectedSunday);
  }

  if (searchTerm) {
    const lowerSearch = searchTerm.toLowerCase();
    displayedData = displayedData.filter(
      (p) =>
        p.name.toLowerCase().includes(lowerSearch) ||
        p.email.toLowerCase().includes(lowerSearch) ||
        p.phone.toLowerCase().includes(lowerSearch) ||
        p.prayerRequest.toLowerCase().includes(lowerSearch),
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        {/* Bulk Actions and Add New */}

        <AddMemberModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          type="first-timers"
          onSuccess={() =>
            queryClient.invalidateQueries({
              queryKey: ["first-timers"],
              exact: false,
            })
          }
        />

        <div className="space-y-6">
          <QrPanel orgId={organizationId} />
          <FirstTimersTable
            data={displayedData}
            currentPage={page}
            totalPages={
              (firstTimersResponse as { meta?: { totalPages?: number } })?.meta
                ?.totalPages || 1
            }
            onPageChange={setPage}
          />
        </div>
      </div>
    </div>
  );
}
