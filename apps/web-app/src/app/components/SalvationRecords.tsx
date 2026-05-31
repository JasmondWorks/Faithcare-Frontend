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

interface SalvationRecordRow {
  name?: string;
  fullName?: string;
  notes?: string;
  email?: string;
  phone?: string;
  phoneNumber?: string;
  followUpStatus?: string;
  dateOfDecision?: string;
}

export function SalvationRecords() {
  const { setHeader } = useLayout();
  useEffect(() => {
    setHeader(
      "Salvation Records",
      "Manage salvation records and their registration",
    );
  }, []);

  const { user } = useAuth();
  const { searchTerm } = useSearch();
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 20;
  const organizationId = user?.organizationId || user?.id || "";

  const { data: recordsResponse } = useQuery({
    queryKey: ["salvation-records", organizationId, page],
    queryFn: () => getSalvationRecords(organizationId, page, limit),
    enabled: !!organizationId,
  });

  const salvationRecordsData = recordsResponse?.data || [];

  const filteredRecords = Array.isArray(salvationRecordsData)
    ? salvationRecordsData.filter((record: SalvationRecordRow) => {
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
                        (r: SalvationRecordRow) =>
                          r.followUpStatus === "Pending",
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
                      salvationRecordsData.filter((r: SalvationRecordRow) =>
                        r.dateOfDecision?.includes("Mar"),
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
            totalPages={recordsResponse?.meta?.totalPages || 1}
            onPageChange={setPage}
          />
        </div>
      </div>
    </div>
  );
}
