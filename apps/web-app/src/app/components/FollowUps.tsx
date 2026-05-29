import { useLayout } from "../contexts/LayoutContext";
import {
  CheckCircle,
  Clock,
  User,
  Users,
  Trash2,
  Loader2,
  MessageSquare,
  MessageCircle,
  Send,
  ArrowDownLeft,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Badge } from "./ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getFollowUps, updateFollowUp, deleteFollowUp } from "@/api/organization/church";
import { useAuth } from "../providers/AuthProvider";
import { toast } from "react-hot-toast";
import { useSearch } from "../contexts/SearchContext";
import { DataManagementActions } from "./DataManagementActions";
import { AddMemberModal } from "./AddMemberModal";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "./ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import AppPagination from "./ui/AppPagination";

// ── Types ─────────────────────────────────────────────────────────────────────

type FilterOption =
  | "all"
  | "first-timers"
  | "second-timers"
  | "first-second"
  | "individual"
  | "bulk";

interface Message {
  direction?: "outbound" | "inbound" | "sent" | "received";
  type?: "sent" | "received";
  content?: string;
  body?: string;
  message?: string;
  sentAt?: string;
  receivedAt?: string;
  timestamp?: string;
  createdAt?: string;
  channel?: "whatsapp" | "sms" | string;
}

interface FollowUp {
  id?: string;
  _id?: string;
  name?: string;
  phone?: string;
  tags?: string[];
  priority?: string;
  description?: string;
  note?: string;
  dueDate?: string;
  status?: string;
  messages?: Message[];
  // Bulk-message fields
  isBulk?: boolean;
  type?: string;
  messageType?: string;
  recipients?: any[];
  recipientCount?: number;
  recipientGroup?: string;
  content?: string;
  sentAt?: string;
  createdAt?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const FILTERS: { value: FilterOption; label: string }[] = [
  { value: "all", label: "All" },
  { value: "first-timers", label: "First Timers" },
  { value: "second-timers", label: "Second Timers" },
  { value: "first-second", label: "First & Second Timers" },
  { value: "individual", label: "Individual" },
  { value: "bulk", label: "Bulk" },
];

function normalizeTags(tags: string[] = []) {
  return tags.map((t) => t.toUpperCase().replace(/[\s-]+/g, "_"));
}

function isBulkFollowUp(f: FollowUp) {
  return (
    f.isBulk === true ||
    f.type?.toUpperCase() === "BULK" ||
    f.messageType?.toUpperCase() === "BULK" ||
    (Array.isArray(f.recipients) && f.recipients.length > 1)
  );
}

function getMessageText(msg: Message) {
  return msg.content ?? msg.body ?? msg.message ?? "";
}

function getMessageTimestamp(msg: Message) {
  const raw = msg.sentAt ?? msg.receivedAt ?? msg.timestamp ?? msg.createdAt;
  if (!raw) return "";
  return new Date(raw).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function isOutbound(msg: Message) {
  const dir = (msg.direction ?? msg.type ?? "").toLowerCase();
  return dir === "outbound" || dir === "sent";
}

function getPriorityColor(priority: string = "") {
  switch (priority.toUpperCase()) {
    case "HIGH":
      return "bg-red-100 text-red-800 border-red-200";
    case "MEDIUM":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "LOW":
      return "bg-green-100 text-green-800 border-green-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

function getTagColor(tag: string = "") {
  switch (tag.toUpperCase().replace(/[\s-]+/g, "_")) {
    case "FIRST_TIMER":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "SECOND_TIMER":
      return "bg-indigo-100 text-indigo-800 border-indigo-200";
    case "PRAYER_REQUEST":
      return "bg-blue-100 text-blue-800 border-blue-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

function extractFollowUps(res: any): FollowUp[] {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.data?.data)) return res.data.data;
  if (Array.isArray(res.data?.followUps)) return res.data.followUps;
  const findArray = (obj: any): any[] => {
    if (!obj || typeof obj !== "object") return [];
    for (const key in obj) {
      if (Array.isArray(obj[key])) return obj[key];
      const nested = findArray(obj[key]);
      if (nested.length > 0) return nested;
    }
    return [];
  };
  return findArray(res);
}

// ── Sub-components ────────────────────────────────────────────────────────────

function MessageThread({ messages }: { messages: Message[] }) {
  const [expanded, setExpanded] = useState(false);
  if (!messages.length) return null;
  const preview = messages[messages.length - 1];
  const shown = expanded ? messages : [preview];

  return (
    <div className="mt-4 border-t border-border/40 pt-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Messages ({messages.length})
        </p>
        {messages.length > 1 && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1 text-xs text-accent hover:underline"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-3 h-3" /> Collapse
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3" /> View all
              </>
            )}
          </button>
        )}
      </div>
      <div className="space-y-2">
        {shown.map((msg, i) => {
          const out = isOutbound(msg);
          return (
            <div
              key={i}
              className={cn(
                "flex gap-2 items-start text-xs",
                out ? "flex-row" : "flex-row-reverse",
              )}
            >
              <div
                className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                  out ? "bg-accent/10" : "bg-muted",
                )}
              >
                {out ? (
                  <ArrowUpRight className="w-3 h-3 text-accent" />
                ) : (
                  <ArrowDownLeft className="w-3 h-3 text-muted-foreground" />
                )}
              </div>
              <div
                className={cn(
                  "max-w-[80%] px-3 py-2 rounded-xl leading-relaxed",
                  out
                    ? "bg-accent/10 text-foreground rounded-tl-none"
                    : "bg-muted text-foreground rounded-tr-none",
                )}
              >
                <p>{getMessageText(msg)}</p>
                {getMessageTimestamp(msg) && (
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {getMessageTimestamp(msg)}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function IndividualCard({
  followUp,
  onComplete,
  onDelete,
  isCompleting,
}: {
  followUp: FollowUp;
  onComplete: () => void;
  onDelete: () => void;
  isCompleting: boolean;
}) {
  const isCompleted = followUp.status?.toUpperCase() === "COMPLETED";
  const messages: Message[] = followUp.messages ?? [];

  return (
    <Card
      padding="none"
      className={cn(
        "transition-all group",
        isCompleted ? "opacity-60" : "hover:shadow-xl hover:border-accent/40",
      )}
    >
      <div className="p-4 sm:p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          {/* Left */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20 shrink-0">
                <User className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
              </div>
              <div className="min-w-0">
                <p className="text-foreground font-bold text-base sm:text-lg truncate">
                  {followUp.name}
                </p>
                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                  {(followUp.tags ?? []).map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className={cn(
                        getTagColor(tag),
                        "font-bold text-[10px] tracking-wider uppercase px-2 py-0.5",
                      )}
                    >
                      {tag.replace(/_/g, " ")}
                    </Badge>
                  ))}
                  <Badge
                    variant="outline"
                    className={cn(
                      getPriorityColor(followUp.priority),
                      "font-bold text-[10px] tracking-wider uppercase px-2 py-0.5",
                    )}
                  >
                    {followUp.priority ?? "MEDIUM"}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="pl-[52px] sm:pl-[60px]">
              {(followUp.description ?? followUp.note) && (
                <p className="text-foreground/80 mb-3 leading-relaxed text-sm sm:text-base">
                  {followUp.description ?? followUp.note}
                </p>
              )}
              {followUp.dueDate && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 w-fit px-3 py-1.5 rounded-lg border border-border/50">
                  <Clock className="w-4 h-4" />
                  <span className="font-bold">
                    Due {new Date(followUp.dueDate).toLocaleDateString()}
                  </span>
                </div>
              )}
              {messages.length > 0 && <MessageThread messages={messages} />}
            </div>
          </div>

          {/* Right */}
          <div className="flex flex-col items-stretch sm:items-end gap-3 w-full sm:w-auto mt-4 sm:mt-0">
            <div className="flex items-center gap-2 justify-center sm:justify-end">
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  const phone = followUp.phone ?? "";
                  const text = encodeURIComponent(
                    `Hi ${followUp.name}, this is FaithCare…`,
                  );
                  window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
                }}
                className="text-accent border-accent/20"
                title="Send WhatsApp"
              >
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="text-blue-500 border-blue-100 hover:bg-blue-50"
                title="Send SMS"
              >
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onDelete}
                className="text-muted-foreground hover:bg-red-50 hover:text-red-500 opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>

            {isCompleted ? (
              <div className="flex items-center justify-center gap-2 text-green-600 bg-green-50 px-3 py-2 rounded-lg border border-green-200 w-full sm:w-auto">
                <CheckCircle className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Completed
                </span>
              </div>
            ) : (
              <Button
                onClick={onComplete}
                disabled={isCompleting}
                className="w-full sm:w-auto px-6 rounded-xl shadow-lg shadow-primary/20"
              >
                Complete
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

function BulkCard({
  followUp,
  onDelete,
}: {
  followUp: FollowUp;
  onDelete: () => void;
}) {
  const tags = normalizeTags(followUp.tags);
  const recipientCount =
    followUp.recipientCount ??
    (Array.isArray(followUp.recipients) ? followUp.recipients.length : null);
  const sentDate =
    (followUp.sentAt ?? followUp.createdAt)
      ? new Date((followUp.sentAt ?? followUp.createdAt)!).toLocaleDateString(
        "en-US",
        {
          month: "short",
          day: "numeric",
          year: "numeric",
        },
      )
      : null;
  const messageBody =
    followUp.content ?? followUp.description ?? followUp.note ?? "";

  const groupLabel =
    followUp.recipientGroup ??
    (tags.includes("FIRST_TIMER") && tags.includes("SECOND_TIMER")
      ? "First & Second Timers"
      : tags.includes("FIRST_TIMER")
        ? "First Timers"
        : tags.includes("SECOND_TIMER")
          ? "Second Timers"
          : "Members");

  return (
    <Card
      padding="none"
      className="border-l-4 border-l-accent/60 transition-all group hover:shadow-xl hover:border-accent/40"
    >
      <div className="p-4 sm:p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          {/* Left */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20 shrink-0">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-accent/10 text-accent border-accent/20 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
                    Bulk Campaign
                  </Badge>
                  {sentDate && (
                    <span className="text-xs text-muted-foreground">
                      {sentDate}
                    </span>
                  )}
                </div>
                <p className="text-foreground font-bold text-base sm:text-lg">
                  {groupLabel}
                </p>
                {recipientCount !== null && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {recipientCount} recipient{recipientCount !== 1 ? "s" : ""}
                  </p>
                )}
              </div>
            </div>

            {messageBody && (
              <div className="ml-[52px] sm:ml-[60px] p-4 bg-muted/30 rounded-xl border border-border/40">
                <div className="flex items-start gap-2">
                  <Send className="w-3.5 h-3.5 text-accent mt-0.5 shrink-0" />
                  <p className="text-sm text-foreground/80 leading-relaxed line-clamp-3">
                    {messageBody}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right */}
          <div className="flex flex-col items-stretch sm:items-end gap-3 w-full sm:w-auto mt-4 sm:mt-0 shrink-0">
            <div className="flex items-center gap-2 justify-center sm:justify-end">
              <Button
                variant="outline"
                size="icon"
                className="text-accent border-accent/20"
                title="Resend via WhatsApp"
              >
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="text-blue-500 border-blue-100 hover:bg-blue-50"
                title="Resend via SMS"
              >
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onDelete}
                className="text-muted-foreground hover:bg-red-50 hover:text-red-500 opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>
            <Badge
              variant="outline"
              className="bg-green-50 text-green-700 border-green-200 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 text-center"
            >
              Sent
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function FollowUps() {
  const { setHeader } = useLayout();
  useEffect(() => {
    setHeader("Follow Ups", "Track and manage pastor follow-ups with members");
  }, []);

  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { searchTerm, setSearchTerm } = useSearch();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterOption>("all");
  const [page, setPage] = useState(1);
  const limit = 20;
  const navigate = useNavigate();

  const { data: followUpsResponse, isLoading } = useQuery({
    queryKey: ["follow-ups", page],
    queryFn: () => getFollowUps({ page, limit }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateFollowUp(id, { status } as any),
    onSuccess: () => {
      toast.success("Follow-up updated");
      queryClient.invalidateQueries({ queryKey: ["follow-ups"] });
    },
    onError: (error: any) => toast.error(error.message || "Failed to update"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteFollowUp(id),
    onSuccess: () => {
      toast.success("Follow-up removed");
      queryClient.invalidateQueries({ queryKey: ["follow-ups"] });
    },
    onError: (error: any) => toast.error(error.message || "Failed to delete"),
  });

  const allFollowUps = extractFollowUps(followUpsResponse);

  const matchesSearch = (f: FollowUp) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      (f.name ?? "").toLowerCase().includes(q) ||
      (f.description ?? f.note ?? "").toLowerCase().includes(q) ||
      (f.content ?? "").toLowerCase().includes(q) ||
      (f.recipientGroup ?? "").toLowerCase().includes(q)
    );
  };

  const matchesFilter = (f: FollowUp): boolean => {
    const tags = normalizeTags(f.tags);
    const isFirstTimer = tags.includes("FIRST_TIMER");
    const isSecondTimer = tags.includes("SECOND_TIMER");
    const isBulk = isBulkFollowUp(f);
    switch (activeFilter) {
      case "first-timers":
        return isFirstTimer;
      case "second-timers":
        return isSecondTimer;
      case "first-second":
        return isFirstTimer || isSecondTimer;
      case "individual":
        return !isBulk;
      case "bulk":
        return isBulk;
      default:
        return true;
    }
  };

  const filterCounts = FILTERS.reduce(
    (acc, f) => {
      acc[f.value] = allFollowUps.filter(matchesFilter).length;
      return acc;
    },
    {} as Record<FilterOption, number>,
  );
  filterCounts["all"] = allFollowUps.length;

  const filtered = allFollowUps.filter(
    (f) => matchesSearch(f) && matchesFilter(f),
  );

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <Loader2 className="w-10 h-10 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-full">
      <div className="space-y-6">
        {/* Controls */}
        <Card className="flex items-center justify-between gap-3 p-4 sm:p-6 flex-wrap">
          <Button
            variant="outline"
            className="flex items-center gap-2 border-accent/20 text-accent hover:bg-accent/10 font-bold text-sm h-9"
            onClick={() => navigate("/bulk-messaging")}
          >
            <MessageCircle className="w-4 h-4" />
            Send Bulk Follow-up
          </Button>
          <DataManagementActions
            hasFilters={false}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            type="follow-ups"
            onAddManual={() => setIsAddModalOpen(true)}
            onUploadSuccess={() =>
              queryClient.invalidateQueries({ queryKey: ["follow-ups"] })
            }
          />
        </Card>

        {/* Filter tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setActiveFilter(f.value)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-all border",
                activeFilter === f.value
                  ? "bg-accent text-white border-accent shadow-md shadow-accent/20"
                  : "bg-card text-muted-foreground border-border hover:border-accent/30 hover:text-foreground",
              )}
            >
              {f.label}
              <span
                className={cn(
                  "text-[11px] px-1.5 py-0.5 rounded-full min-w-[20px] text-center",
                  activeFilter === f.value
                    ? "bg-white/20 text-white"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {f.value === "all"
                  ? allFollowUps.length
                  : allFollowUps.filter((fu) => {
                    const tags = normalizeTags(fu.tags);
                    const isFT = tags.includes("FIRST_TIMER");
                    const isST = tags.includes("SECOND_TIMER");
                    const bulk = isBulkFollowUp(fu);
                    switch (f.value) {
                      case "first-timers":
                        return isFT;
                      case "second-timers":
                        return isST;
                      case "first-second":
                        return isFT || isST;
                      case "individual":
                        return !bulk;
                      case "bulk":
                        return bulk;
                      default:
                        return true;
                    }
                  }).length}
              </span>
            </button>
          ))}
        </div>

        <AddMemberModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          type="follow-ups"
          onSuccess={() =>
            queryClient.invalidateQueries({ queryKey: ["follow-ups"] })
          }
        />

        {/* List */}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <Card
              variant="ghost"
              padding="xl"
              className="flex flex-col items-center justify-center space-y-4"
            >
              <CheckCircle className="w-12 h-12 text-muted-foreground/30" />
              <p className="text-muted-foreground italic text-center">
                {searchTerm
                  ? `No follow-ups matching "${searchTerm}"`
                  : activeFilter !== "all"
                    ? `No ${FILTERS.find((f) => f.value === activeFilter)?.label.toLowerCase()} follow-ups.`
                    : "No pending follow-ups at the moment."}
              </p>
            </Card>
          ) : (
            filtered.map((followUp) => {
              const id = followUp.id ?? followUp._id ?? "";
              const bulk = isBulkFollowUp(followUp);

              if (bulk) {
                return (
                  <BulkCard
                    key={id}
                    followUp={followUp}
                    onDelete={() => {
                      if (confirm("Delete this follow-up record?")) {
                        deleteMutation.mutate(id);
                      }
                    }}
                  />
                );
              }

              return (
                <IndividualCard
                  key={id}
                  followUp={followUp}
                  isCompleting={updateMutation.isPending}
                  onComplete={() =>
                    updateMutation.mutate({ id, status: "COMPLETED" })
                  }
                  onDelete={() => {
                    if (confirm("Delete this follow-up record?")) {
                      deleteMutation.mutate(id);
                    }
                  }}
                />
              );
            })
          )}
        </div>

        {followUpsResponse && (followUpsResponse as any).meta && (
          <div className="mt-6 rounded-2xl overflow-hidden border border-border">
            <AppPagination
              currentPage={page}
              totalPages={(followUpsResponse as any).meta.totalPages || 1}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
