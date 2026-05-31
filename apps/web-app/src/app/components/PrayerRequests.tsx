import { useLayout } from "../contexts/LayoutContext";
import { Heart, User, Trash2, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "./ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPrayerRequests,
  updatePrayerRequest,
  deletePrayerRequest,
} from "@/api/organization/church";
import { useAuth } from "../providers/AuthProvider";
import { toast } from "react-hot-toast";
import { useSearch } from "../contexts/SearchContext";
import { DataManagementActions } from "./DataManagementActions";
import { AddMemberModal } from "./AddMemberModal";
import { Card } from "./ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import AppPagination from "./ui/AppPagination";
import type { PrayerRequestStatus } from "@/api/shared/types";

/** Loosely-typed prayer-request row from the API. */
interface PrayerRow {
  id?: string;
  _id?: string;
  name?: string;
  description?: string;
  request?: string;
  status?: string;
  createdAt?: string;
}

export function PrayerRequests() {
  const { setHeader } = useLayout();
  useEffect(() => {
    setHeader("Prayer Requests", "Pray for one another and lift each other up");
  }, []);

  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { searchTerm, setSearchTerm } = useSearch();
  const organizationId = user?.organizationId || "";
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data: prayerResponse, isLoading } = useQuery({
    queryKey: ["prayer-requests", page],
    queryFn: () => getPrayerRequests(page, limit),
    enabled: !!user,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updatePrayerRequest(organizationId, id, {
        status: status as PrayerRequestStatus,
      }),
    onSuccess: () => {
      toast.success("Prayer status updated");
      queryClient.invalidateQueries({ queryKey: ["prayer-requests"] });
    },
    onError: (error) =>
      toast.error(
        error instanceof Error ? error.message : "Failed to update status",
      ),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletePrayerRequest(organizationId, id),
    onSuccess: () => {
      toast.success("Prayer request removed");
      queryClient.invalidateQueries({ queryKey: ["prayer-requests"] });
    },
    onError: (error) =>
      toast.error(
        error instanceof Error ? error.message : "Failed to delete request",
      ),
  });

  const _pr: unknown = prayerResponse?.data || [];
  const prayerRequests: PrayerRow[] = Array.isArray(_pr)
    ? (_pr as PrayerRow[])
    : Array.isArray((_pr as { data?: unknown })?.data)
      ? ((_pr as { data: PrayerRow[] }).data)
      : [];

  const filteredRequests = prayerRequests.filter((prayer) => {
    if (!searchTerm) return true;
    const lowerSearch = searchTerm.toLowerCase();
    return (
      (prayer.name || "Anonymous").toLowerCase().includes(lowerSearch) ||
      (prayer.description || prayer.request || "")
        .toLowerCase()
        .includes(lowerSearch)
    );
  });

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "PRAYING":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "CONTACTED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "FOLLOWED UP":
      case "FOLLOWED_UP":
        return "bg-green-100 text-green-800 border-green-200";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex-1 flex items-center justify-center p-12">
          <Loader2 className="w-10 h-10 animate-spin text-accent" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full">
      <div className="space-y-6">
        {/* Bulk Actions and Add New */}
        <Card className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 p-4 sm:p-6">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-foreground">
              Data Management
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Upload or add new requests manually
            </p>
          </div>
          <DataManagementActions
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            hasFilters={false}
            type="prayer-requests"
            onAddManual={() => setIsAddModalOpen(true)}
            onUploadSuccess={() =>
              queryClient.invalidateQueries({ queryKey: ["prayer-requests"] })
            }
          />
        </Card>

        <AddMemberModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          type="prayer-requests"
          onSuccess={() =>
            queryClient.invalidateQueries({ queryKey: ["prayer-requests"] })
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {filteredRequests.length === 0 ? (
            <Card variant="ghost" padding="xl" className="col-span-full flex flex-col items-center justify-center space-y-4">
              <Heart className="w-12 h-12 text-muted-foreground/30" />
              <p className="text-muted-foreground italic">
                {searchTerm
                  ? `No requests matching"${searchTerm}"`
                  : "No prayer requests at the moment."}
              </p>
            </Card>
          ) : (
            filteredRequests.map((prayer) => (
              <Card
                key={prayer.id || prayer._id}
                padding="none"
                className="flex flex-col group relative overflow-hidden"
              >
                <div className="p-6 md:p-8">
                  {/* Decorative Background */}
                  <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
                    <Heart className="w-24 h-24" />
                  </div>

                  {/* Header */}
                  <div className="flex items-start justify-between mb-6 relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20">
                        <User className="w-6 h-6 text-accent" />
                      </div>
                      <div>
                        <p className="text-foreground font-bold text-lg">
                          {prayer.name || "Anonymous"}
                        </p>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
                          {prayer.createdAt
                            ? new Date(prayer.createdAt).toLocaleDateString(
                              undefined,
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="outline"
                        className={`${getStatusColor(prayer.status || "PENDING")} font-bold uppercase text-[10px] tracking-widest px-2.5 py-1`}
                      >
                        {prayer.status || "PENDING"}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (
                            confirm(
                              "Are you sure you want to delete this prayer request?",
                            )
                          ) {
                            deleteMutation.mutate(prayer.id || prayer._id);
                          }
                        }}
                        className="text-muted-foreground hover:bg-red-50 hover:text-red-500 opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Prayer Request */}
                  <div className="bg-muted/30 rounded-xl p-5 mb-8 flex-1 relative z-10 border border-border/50">
                    <p className="text-foreground/80 leading-relaxed italic text-base">
                      "
                      {prayer.description ||
                        prayer.request ||
                        "No description provided."}
                      "
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 mt-auto relative z-10">
                    <Button
                      onClick={() =>
                        updateMutation.mutate({
                          id: prayer.id || prayer._id,
                          status: "PRAYING",
                        })
                      }
                      disabled={
                        updateMutation.isPending || prayer.status === "PRAYING"
                      }
                      className={cn(
                        "flex-1 gap-3 rounded-xl shadow-lg",
                        prayer.status === "PRAYING"
                          ? "bg-purple-100 text-purple-700 shadow-purple-100 hover:bg-purple-200"
                          : "shadow-primary/20"
                      )}
                    >
                      <Heart
                        className={cn("w-5 h-5", prayer.status === "PRAYING" && "fill-current")}
                      />
                      {prayer.status === "PRAYING" ? "Praying..." : "Praying"}
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {prayerResponse?.meta && (
          <div className="mt-6 rounded-2xl overflow-hidden border border-border">
            <AppPagination
              currentPage={page}
              totalPages={prayerResponse.meta.totalPages || 1}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
