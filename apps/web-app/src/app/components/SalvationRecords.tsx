import { useLayout } from "../contexts/LayoutContext";
import { useEffect, useState } from "react";
import {
  Phone,
  MessageCircle,
  Send,
} from "lucide-react";
import { useSearch } from "../contexts/SearchContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSalvationRecords } from "@/api/organization/church";
import { useAuth } from "../providers/AuthProvider";
import { AddMemberModal } from "./AddMemberModal";
import { Card } from "./ui/card";
import SalvationRecordsTable from "./SalvationRecordsTable";

interface SalvationRecord {
  id: number;
  name: string;
  phone: string;
  email: string;
  dateOfDecision: string;
  followUpStatus: string;
  notes: string;
}

const salvationRecordsData: SalvationRecord[] = [
  {
    id: 1,
    name: "Jennifer Williams",
    phone: "(555) 789-0123",
    email: "jennifer.w@email.com",
    dateOfDecision: "Mar 5, 2026",
    followUpStatus: "Pending",
    notes: "Made decision during altar call",
  },
  {
    id: 2,
    name: "Marcus Anderson",
    phone: "(555) 890-1234",
    email: "marcus.a@email.com",
    dateOfDecision: "Mar 3, 2026",
    followUpStatus: "Contacted",
    notes: "Requested baptism information",
  },
  {
    id: 3,
    name: "Lisa Martinez",
    phone: "(555) 901-2345",
    email: "lisa.m@email.com",
    dateOfDecision: "Feb 28, 2026",
    followUpStatus: "Followed Up",
    notes: "Connected with small group",
  },
  {
    id: 4,
    name: "Robert Taylor",
    phone: "(555) 012-3456",
    email: "robert.t@email.com",
    dateOfDecision: "Feb 26, 2026",
    followUpStatus: "Pending",
    notes: "Came forward during worship",
  },
];

export function SalvationRecords() {
  const { setHeader } = useLayout();
  useEffect(() => {
    setHeader(
      "Salvation Records",
      "Manage salvation records and their registration",
    );
  }, []);

  const { user } = useAuth();
  const { searchTerm, setSearchTerm } = useSearch();
  const queryClient = useQueryClient();
  const [showFollowUpMenu, setShowFollowUpMenu] = useState<number | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 20;
  const organizationId = user?.organizationId || user?.id || "";

  const { data: recordsResponse, isLoading } = useQuery({
    queryKey: ["salvation-records", organizationId, page],
    queryFn: () => getSalvationRecords(organizationId, page, limit),
    enabled: !!organizationId,
  });

  const salvationRecordsData = recordsResponse?.data || [];

  const filteredRecords = Array.isArray(salvationRecordsData)
    ? salvationRecordsData.filter((record: any) => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase().trim();
      return (
        (record.name || record.fullName || "")
          .toLowerCase()
          .includes(searchLower) ||
        (record.notes || "").toLowerCase().includes(searchLower) ||
        (record.email || "").toLowerCase().includes(searchLower) ||
        (record.phone || record.phoneNumber || "")
          .toLowerCase()
          .includes(searchLower)
      );
    })
    : [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Contacted":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Followed Up":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleFollowUp = (recordId: number, method: string) => {
    console.log(`Following up with record ${recordId} via ${method}`);
    setShowFollowUpMenu(null);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4 sm:space-y-6">
        <h3 className="text-lg sm:text-xl font-bold text-foreground mb-1 flex items-center gap-2">
          Reaching Souls
        </h3>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          Track every soul won for the kingdom. Ensure no decision goes without
          follow-up and discipleship.
          {searchTerm && (
            <span className="block mt-2 text-accent font-bold">
              Searching for: "{searchTerm}"
            </span>
          )}
        </p>

        <AddMemberModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          type="salvation-records"
          onSuccess={() =>
            queryClient.invalidateQueries({ queryKey: ["salvation-records"] })
          }
        />

        <div className="space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold mb-3 text-accent-foreground/70">
                    Total Salvations
                  </p>
                  <h3 className="text-3xl font-bold">
                    {salvationRecordsData.length}
                  </h3>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Send className="w-6 h-6 opacity-80" />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold mb-3 text-accent-foreground/70">
                    Pending Follow Ups
                  </p>
                  <h3 className="text-3xl font-bold">
                    {
                      salvationRecordsData.filter(
                        (r: any) => r.followUpStatus === "Pending",
                      ).length
                    }
                  </h3>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Phone className="w-6 h-6 opacity-80" />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold mb-3 text-accent-foreground/70">
                    This Month
                  </p>
                  <h3 className="text-3xl font-bold">
                    {
                      salvationRecordsData.filter((r: any) =>
                        r.dateOfDecision.includes("Mar"),
                      ).length
                    }
                  </h3>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 opacity-80" />
                </div>
              </div>
            </Card>
          </div>

          {/* Salvation Records Table */}
          <SalvationRecordsTable 
            data={filteredRecords} 
            currentPage={page}
            totalPages={(recordsResponse as any)?.meta?.totalPages || 1}
            onPageChange={setPage}
          />
        </div>
      </div>
    </div>
  );
}
