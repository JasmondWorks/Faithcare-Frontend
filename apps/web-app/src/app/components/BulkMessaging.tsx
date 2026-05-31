import { Card } from "./ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "./ui/textarea";
import { MessageCircle, MessageSquare, Send, ArrowLeft, Loader2, AlertCircle, Check, Users } from "lucide-react";
import { useLayout } from "../contexts/LayoutContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getFollowUps, sendBulkMessage } from "@/api/organization/church";
import { useAuth } from "../providers/AuthProvider";
import { toast } from "react-hot-toast";

interface FollowUpItem {
  id?: string;
  _id?: string;
  name?: string;
  phone?: string;
  phoneNumber?: string;
  status?: string;
}

export function BulkMessaging() {
  const { setHeader } = useLayout();
  const navigate = useNavigate();
  const { user } = useAuth();
  const organizationId = user?.organizationId || "";

  const [selectedPlatform, setSelectedPlatform] = useState<"whatsapp" | "sms">("whatsapp");
  const [messageContent, setMessageContent] = useState("");
  const [selectedRecipientIds, setSelectedRecipientIds] = useState<string[]>([]);

  useEffect(() => {
    setHeader("Bulk Messaging", "Send bulk SMS and WhatsApp messages to members");
  }, []);

  const { data: followUpsResponse, isLoading, isError, error } = useQuery({
    queryKey: ["follow-ups", organizationId],
    queryFn: () => getFollowUps(),
    enabled: !!organizationId,
  });

  // Helper to robustly find the data array
  const followUps: FollowUpItem[] = (() => {
    const r = followUpsResponse as
      | Record<string, unknown>
      | FollowUpItem[]
      | null
      | undefined;
    if (!r) return [];
    if (Array.isArray(r)) return r;
    if (Array.isArray(r.data)) return r.data as FollowUpItem[];
    if (r.data && Array.isArray((r.data as Record<string, unknown>).data))
      return (r.data as Record<string, unknown>).data as FollowUpItem[];
    if (r.data && Array.isArray((r.data as Record<string, unknown>).followUps))
      return (r.data as Record<string, unknown>).followUps as FollowUpItem[];

    const findArray = (obj: unknown): FollowUpItem[] => {
      if (!obj || typeof obj !== "object") return [];
      const record = obj as Record<string, unknown>;
      for (const key in record) {
        if (Array.isArray(record[key])) return record[key] as FollowUpItem[];
        if (typeof record[key] === "object" && record[key] !== null) {
          const nested = findArray(record[key]);
          if (nested.length > 0) return nested;
        }
      }
      return [];
    };
    return findArray(r);
  })();

  const pendingFollowUps = followUps.filter((f: FollowUpItem) => f.status?.toUpperCase() !== "COMPLETED");

  // Initialize selected recipients when data loads
  useEffect(() => {
    if (pendingFollowUps.length > 0 && selectedRecipientIds.length === 0) {
      setSelectedRecipientIds(pendingFollowUps.map((f: FollowUpItem) => f.id || f._id || ""));
    }
  }, [pendingFollowUps.length]);

  const sendMutation = useMutation({
    mutationFn: () => sendBulkMessage(organizationId, {
      platform: selectedPlatform,
      content: messageContent,
      recipientIds: selectedRecipientIds,
    }),
    onSuccess: (res) => {
      if (res.success) {
        toast.success(`Successfully sent ${selectedRecipientIds.length} ${selectedPlatform.toUpperCase()} messages!`);
        setMessageContent("");
        navigate("/follow-ups");
      } else {
        toast.error(res.error || "Failed to send messages");
      }
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "An error occurred");
    }
  });

  const toggleRecipient = (id: string) => {
    setSelectedRecipientIds(prev =>
      prev.includes(id) ? prev.filter(rid => rid !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedRecipientIds.length === pendingFollowUps.length) {
      setSelectedRecipientIds([]);
    } else {
      setSelectedRecipientIds(pendingFollowUps.map((f: FollowUpItem) => f.id || f._id || ""));
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-accent" />
        <p className="text-muted-foreground animate-pulse font-medium">Fetching recipient data...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4 p-8">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold">Failed to load data</h3>
        <p className="text-muted-foreground text-center max-w-md">
          {(error instanceof Error ? error.message : "") || "There was an error connecting to the server. Please try again."}
        </p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Retry Connection
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Composer */}
        <div className="lg:col-span-7 space-y-4 sm:space-y-6">
          <Card className="p-5 sm:p-8 space-y-4 sm:space-y-6">
            <div className="space-y-1 sm:space-y-2">
              <h2 className="text-lg sm:text-xl font-bold">Compose Message</h2>
              <p className="text-muted-foreground text-xs sm:text-sm">Draft your follow-up message below.</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Select Platform</label>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <Button
                    variant={selectedPlatform === "whatsapp" ? "default" : "outline"}
                    onClick={() => setSelectedPlatform("whatsapp")}
                    className={`flex-1 flex gap-2 h-11 sm:h-12 rounded-lg transition-all text-sm ${selectedPlatform === "whatsapp" ? "bg-green-600 hover:bg-green-700 text-white" : ""}`}
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </Button>
                  <Button
                    variant={selectedPlatform === "sms" ? "default" : "outline"}
                    onClick={() => setSelectedPlatform("sms")}
                    className={`flex-1 flex gap-2 h-11 sm:h-12 rounded-lg transition-all text-sm ${selectedPlatform === "sms" ? "bg-blue-600 hover:bg-blue-700 text-white" : ""}`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    SMS
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Message Content</label>
                <Textarea
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="Hi {{name}}, we were glad to have you at Faithcare..."
                  className="min-h-[200px] rounded-lg border-neutral-200 focus:ring-accent text-lg p-4 leading-relaxed"
                />
                <div className="flex justify-between items-center">
                  <p className="text-[10px] text-muted-foreground italic">Use {"{{name}}"} to personalize the message.</p>
                  <p className="text-[10px] text-muted-foreground font-medium">{messageContent.length} characters</p>
                </div>
              </div>

              <Button
                onClick={() => sendMutation.mutate()}
                disabled={sendMutation.isPending || !messageContent.trim() || selectedRecipientIds.length === 0}
                className="w-full h-12 sm:h-14 rounded-lg bg-primary text-primary-foreground font-bold flex gap-3 hover:scale-[1.02] transition-all shadow-xl shadow-primary/20 text-base sm:text-lg disabled:opacity-50"
              >
                {sendMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                {sendMutation.isPending ? "Sending Messages..." : `Send to ${selectedRecipientIds.length} Recipients`}
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Column: Recipients & Integration */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-5 sm:p-8 space-y-4 sm:space-y-6 flex flex-col h-full max-h-[500px] sm:max-h-[700px]">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                  <Users className="w-5 h-5 text-accent" />
                  Recipients
                </h2>
                <p className="text-muted-foreground text-[10px] sm:text-xs">Select who receives this message.</p>
              </div>
              <Button variant="ghost" size="sm" onClick={toggleAll} className="text-[10px] sm:text-xs font-bold text-accent px-2">
                {selectedRecipientIds.length === pendingFollowUps.length ? "Deselect All" : "Select All"}
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {pendingFollowUps.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-neutral-200 rounded-lg bg-muted/20">
                  <p className="text-muted-foreground text-sm">No pending follow-ups found.</p>
                </div>
              ) : (
                pendingFollowUps.map((f: FollowUpItem) => {
                  const id = f.id || f._id || "";
                  const isSelected = selectedRecipientIds.includes(id);
                  return (
                    <div
                      key={id}
                      onClick={() => toggleRecipient(id)}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${isSelected ? "border-accent bg-accent/5" : "border-neutral-200 hover:bg-muted/50"}`}
                    >
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${isSelected ? "bg-accent border-accent text-white" : "border-muted-foreground/30 bg-card"}`}>
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">{f.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{f.phone || f.phoneNumber || "No phone"}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-4 border-t border-border space-y-4">
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-muted-foreground font-medium">Platform</span>
                <span className={selectedPlatform === "whatsapp" ? "text-green-600 uppercase tracking-tighter" : "text-blue-600 uppercase tracking-tighter"}>{selectedPlatform}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-muted-foreground font-medium">Recipients</span>
                <span>{selectedRecipientIds.length} Members</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent transition-all duration-500"
                  style={{ width: `${(selectedRecipientIds.length / (pendingFollowUps.length || 1)) * 100}%` }}
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}


