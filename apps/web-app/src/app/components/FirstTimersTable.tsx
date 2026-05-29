import { useState, useMemo } from "react";
import Table from "./ui/table/Table";
import type { TableColumn } from "./ui/table/types";
import { Card } from "./ui/card";
import { useSearch } from "../contexts/SearchContext";
import { AddMemberModal } from "./AddMemberModal";
import { SendFollowUpModal } from "./SendFollowUpModal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DataManagementActions } from "./DataManagementActions";

import { Button } from "@/components/ui/button";
import { updateFirstTimerStatus, createFollowUp, updateFirstTimerVisitType } from "@/api/organization/church";
import { useAuth } from "../providers/AuthProvider";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

interface SelectedMember {
  id: string;
  name: string;
  phone?: string;
  email?: string;
}

export default function FirstTimersTable({
  data,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}: {
  data: any[];
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}) {
  const { searchTerm, setSearchTerm } = useSearch();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [followUpTarget, setFollowUpTarget] = useState<SelectedMember | null>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const navigate = useNavigate();
  const organizationId = user?.organizationId || "";

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateFirstTimerStatus(id, { status: status as any, notes: `Status updated to ${status}` }),
    onSuccess: () => {
      toast.success("Status updated");
      queryClient.invalidateQueries({ queryKey: ["first-timers"] });
    },
    onError: (error: any) => toast.error(error.message || "Failed to update status"),
  });

  const followUpMutation = useMutation({
    mutationFn: createFollowUp,
    onSuccess: (_, variables) => {
      toast.success("Follow-up sent — status updated to Contacted");
      if (variables.targetId) statusMutation.mutate({ id: variables.targetId, status: "CONTACTED" });
      queryClient.invalidateQueries({ queryKey: ["follow-ups"] });
      queryClient.invalidateQueries({ queryKey: ["first-timers"] });
      setFollowUpTarget(null);
    },
    onError: (error: any) => toast.error(error.message || "Failed to send follow-up"),
  });

  const visitTypeMutation = useMutation({
    mutationFn: (payload: any) =>
      updateFirstTimerVisitType(organizationId, payload.id, payload),
    onSuccess: () => {
      toast.success("Updated to second timer");
      queryClient.invalidateQueries({ queryKey: ["first-timers"] });
      queryClient.invalidateQueries({ queryKey: ["second-timers"] });
      navigate("/second-timers");
    },
    onError: (error: any) => toast.error(error.message || "Failed to update visit type"),
  });

  const handleOpenFollowUp = (item: any) => {
    setFollowUpTarget({
      id: item.id || item._id,
      name: item.fullName || item.name,
      phone: item.phoneNumber || item.phone,
      email: item.email,
    });
  };

  const handleSendFollowUp = (memberId: string, message: string) => {
    const item = data.find((d) => (d.id || d._id) === memberId);
    followUpMutation.mutate({
      targetId: memberId,
      contactName: item?.fullName || item?.name || "",
      contactPhone: item?.phoneNumber || item?.phone,
      targetType: 'first_timer',
      tags: ["FIRST_TIMER"],
      priority: "HIGH" as const,
      description: message,
      dueDate: new Date().toISOString().split("T")[0],
    });
  };

  const handleMakeSecondTimer = (item: any) => {
    visitTypeMutation.mutate({ id: item.id || item._id, ...item });
  };

  const columns: TableColumn[] = useMemo(() => [
    { key: "fullName", label: "Name" },
    { key: "prayerRequest", label: "Prayer Request" },
    { key: "firstVisit", label: "First Visit" },
    {
      key: "status",
      label: "Status",
      render: (item) => {
        const itemId = item.id || item._id;
        const isUpdating = statusMutation.isPending && statusMutation.variables?.id === itemId;
        const status = isUpdating
          ? statusMutation.variables?.status
          : item.status?.toUpperCase() || "PENDING";

        const statusStyles: Record<string, string> = {
          PENDING: "bg-yellow-100 text-yellow-800 border border-yellow-200",
          CONTACTED: "bg-blue-100 text-blue-800 border border-blue-200",
          FOLLOWED_UP: "bg-green-100 text-green-800 border border-green-200",
        };
        const statusLabels: Record<string, string> = {
          PENDING: "Pending",
          CONTACTED: "Contacted",
          FOLLOWED_UP: "Follow-up",
        };
        const style = statusStyles[status] || "bg-gray-100 text-gray-800 border border-gray-200";
        const label = statusLabels[status] || status;

        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style}`}>
            {isUpdating ? "Updating..." : label}
          </span>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (item) => {
        const itemId = item.id || item._id;
        const isDisabled =
          item.status?.toUpperCase() === "CONTACTED" ||
          (followUpMutation.isPending && followUpMutation.variables?.targetId === itemId) ||
          (statusMutation.isPending && statusMutation.variables?.id === itemId);

        return (
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenFollowUp(item);
            }}
            disabled={isDisabled}
          >
            Send follow-up
          </Button>
        );
      },
    },
    {
      key: "activate",
      label: "Activate",
      render: (item) => {
        const itemId = item.id || item._id;
        const isPending = visitTypeMutation.isPending && visitTypeMutation.variables?.id === itemId;

        return (
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleMakeSecondTimer(item);
            }}
            disabled={isPending}
          >
            {isPending ? "Updating..." : "Make second timer"}
          </Button>
        );
      },
    },
  ], [statusMutation, followUpMutation, visitTypeMutation]);

  return (
    <Card className="space-y-4">
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <h1 className="text-foreground font-bold text-base sm:text-lg">First Timers</h1>
      </div>
      <DataManagementActions
        type="first-timers"
        onAddManual={() => setIsAddModalOpen(true)}
        onUploadSuccess={() => queryClient.invalidateQueries({ queryKey: ["first-timers"] })}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      <AddMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        type="first-timers"
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ["first-timers"] })}
      />

      <SendFollowUpModal
        isOpen={!!followUpTarget}
        onClose={() => setFollowUpTarget(null)}
        member={followUpTarget}
        tag="FIRST_TIMER"
        isSending={followUpMutation.isPending}
        onSend={handleSendFollowUp}
        organizationId={organizationId}
      />

      <Table
        data={data.map((item) => ({
          ...item,
          contacts: `${item.phoneNumber || item.phone} - ${item.email}`,
          visits: `${item.firstVisit || item.serviceDate} - ${item.secondVisit || "N/A"}`,
          prayerRequests: item.prayerRequest,
        }))}
        columns={columns}
        isPaginated={true}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </Card>
  );
}
