import { useEffect } from "react";
import { useLayout } from "../contexts/LayoutContext";
import { useAuth } from "../providers/AuthProvider";
import { useQuery } from "@tanstack/react-query";
import { getDashboardTrends, getFirstTimers, getFollowUps } from "@/api/organization";
import { UserPlus, Loader2 } from "lucide-react";
import { DashboardOverview } from "./DashboardOverview";
import { useSearch } from "../contexts/SearchContext";
import { Card } from "./ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "./ui/badge";

export function OrganizationDashboard() {
  const { setHeader } = useLayout();
  const { user } = useAuth();
  const { searchTerm } = useSearch();
  const organizationId = user?.organizationId || user?.id || "";

  useEffect(() => {
    setHeader(
      "Organization Overview",
      `Viewing insights for ${user?.name || "your ministry"}`,
    );
  }, [user?.name]);

  const { data: trendsData, isLoading: leadsLoading } = useQuery({
    queryKey: ["dashboard-trends", organizationId],
    queryFn: () => getDashboardTrends(),
    enabled: !!organizationId,
  });

  const { data: firstTimersData } = useQuery({
    queryKey: ["dashboard-first-timers"],
    queryFn: () => getFirstTimers(),
    enabled: !!user,
  });

  const { data: followUpsData } = useQuery({
    queryKey: ["dashboard-followups", organizationId],
    queryFn: () => getFollowUps(),
    enabled: !!organizationId,
  });

  // Robustly find the array in any nested API response
  const findArray = (obj: any): any[] => {
    if (!obj) return [];
    if (Array.isArray(obj)) return obj;
    if (typeof obj === "object") {
      for (const key in obj) {
        if (Array.isArray(obj[key])) return obj[key];
        if (typeof obj[key] === "object" && obj[key] !== null) {
          const nested = findArray(obj[key]);
          if (nested.length > 0) return nested;
        }
      }
    }
    return [];
  };

  const recentActivityRaw = findArray(firstTimersData).map((ft: any) => ({
    type: "First Timer",
    name: ft.fullName || ft.name || "Unknown",
    action: "registered",
    time: ft.createdAt?.split("T")[0] || "Recently",
  }));

  const followUpsRaw = findArray(followUpsData);

  // Filter based on global search
  const filteredActivity = recentActivityRaw.filter((a: any) =>
    a.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const filteredFollowUps = followUpsRaw.filter(
    (fu: any) =>
      (fu.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (fu.description || fu.notes || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );

  if (leadsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="">
        <Select>
          <SelectTrigger className="max-w-[200px]">
            <SelectValue placeholder="Select a period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">Last 14 days</SelectItem>
            <SelectItem value="year">Last 30 days</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DashboardOverview />
      <div className="space-y-8">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Active Activity Log */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-foreground">
                {searchTerm ? `Activity:"${searchTerm}"` : "Recent Activity"}
              </h3>
              <Button
                variant="ghost"
                className="h-auto p-0 text-[10px] text-accent uppercase tracking-widest bg-accent/5 px-3 py-1.5 rounded-full hover:bg-accent/10"
              >
                Live Feed
              </Button>
            </div>
            <div className="space-y-4">
              {filteredActivity.length > 0 ? (
                filteredActivity
                  .slice(0, 4)
                  .map((activity: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-4 rounded-lg hover:bg-muted/30 transition-all border border-transparent hover:border-neutral-200"
                    >
                      <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <UserPlus className="w-6 h-6 text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {activity.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Successfully {activity.action} in the system
                        </p>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-medium uppercase bg-muted/50 px-2 py-1 rounded">
                        {activity.time}
                      </span>
                    </div>
                  ))
              ) : (
                <div className="py-12 text-center">
                  <p className="text-sm text-muted-foreground italic">
                    {searchTerm
                      ? "No activities match your search."
                      : "No recent activity recorded yet."}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Critical Follow-ups */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-foreground">
                {searchTerm
                  ? `Follow-ups:"${searchTerm}"`
                  : "Upcoming Follow Ups"}
              </h3>
              <Badge className="border-accent text-accent">Active</Badge>
            </div>
            <div className="space-y-4">
              {filteredFollowUps.length > 0 ? (
                filteredFollowUps.slice(0, 3).map((fu: any, idx: number) => (
                  <div
                    key={idx}
                    className={`p-5 rounded-xl border-l-4 ${fu.status === "overdue" ? "border-l-red-500 bg-red-50/30" : "border-l-accent bg-accent/5"}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm font-medium text-foreground italic">
                        "{fu.name}"
                      </p>
                      <span
                        className={`text-[10px] font-medium uppercase ${fu.status === "overdue" ? "text-red-600 bg-red-100" : "text-accent bg-accent/10"} px-2 py-1 rounded`}
                      >
                        {fu.dueDate || "Planned"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {fu.description ||
                        fu.notes ||
                        "Follow up action required for this member."}
                    </p>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center">
                  <p className="text-sm text-muted-foreground italic">
                    {searchTerm
                      ? "No follow-ups match your search."
                      : "Your follow-up list is currently clear."}
                  </p>
                </div>
              )}
            </div>
            <Button className="w-full mt-6 shadow-lg">
              Manage All Follow Ups
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}


