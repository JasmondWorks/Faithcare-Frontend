import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMessageTemplates, getMessageTemplatePresets } from "@/api/organization/church";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Built-in templates (swap body with API data once templates API exists) ────

export interface FollowUpTemplate {
  id: string;
  label: string;
  body: string;
}

interface RawTemplate {
  id?: string;
  _id?: string;
  name: string;
  body?: string;
  message?: string;
  isActive?: boolean;
}

const TEMPLATES: FollowUpTemplate[] = [
  {
    id: "welcome",
    label: "Welcome",
    body: "Hi {{name}}, we were so glad to have you with us this Sunday! We hope you felt right at home. We'd love to stay connected — feel free to reach out anytime.",
  },
  {
    id: "second-visit",
    label: "Second Visit",
    body: "Hi {{name}}, it's wonderful to see you returning to our family! We truly appreciate your continued presence. Is there anything we can do to help you feel more connected?",
  },
  {
    id: "prayer",
    label: "Prayer Follow-up",
    body: "Hi {{name}}, we wanted to check in and let you know that our team is still believing with you in prayer. You are in our hearts.",
  },
  {
    id: "event",
    label: "Invite to Event",
    body: "Hi {{name}}, we have an exciting service coming up and would love to have you join us! We believe it will be a real blessing.",
  },
  {
    id: "custom",
    label: "Custom",
    body: "",
  },
];

function personalize(template: string, name: string) {
  return template.replace(/\{\{name\}\}/g, name.split(" ")[0] || name);
}

// ── Props ─────────────────────────────────────────────────────────────────────

export interface SendFollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
  } | null;
  tag: "FIRST_TIMER" | "SECOND_TIMER";
  isSending: boolean;
  onSend: (memberId: string, message: string) => void;
  organizationId?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function SendFollowUpModal({
  isOpen,
  onClose,
  member,
  tag,
  isSending,
  onSend,
  organizationId,
}: SendFollowUpModalProps) {
  const { data: orgData, isLoading: isLoadingOrg } = useQuery({
    queryKey: ["message-templates", organizationId],
    queryFn: getMessageTemplates,
    enabled: !!organizationId && isOpen,
    staleTime: 60_000,
  });

  const { data: presetData, isLoading: isLoadingPresets } = useQuery({
    queryKey: ["message-template-presets"],
    queryFn: getMessageTemplatePresets,
    enabled: isOpen,
    staleTime: 10 * 60_000,
  });

  const isLoadingTemplates = isLoadingOrg || isLoadingPresets;

  // Merge org templates + presets, deduplicated by id, active only
  const apiTemplates: FollowUpTemplate[] = (() => {
    const orgList: RawTemplate[] = Array.isArray(orgData?.data)
      ? orgData.data
      : [];
    const presetList: RawTemplate[] = Array.isArray(presetData?.data)
      ? presetData.data
      : [];
    const merged = [...orgList, ...presetList];
    const seen = new Set<string>();
    return merged
      .filter((t) => t.isActive !== false)
      .reduce<FollowUpTemplate[]>((acc, t) => {
        const key = t.id ?? t._id ?? t.name;
        if (seen.has(key)) return acc;
        seen.add(key);
        acc.push({ id: key, label: t.name, body: t.body ?? t.message ?? "" });
        return acc;
      }, []);
  })();

  const templates = apiTemplates.length
    ? [...apiTemplates, { id: "custom", label: "Custom", body: "" }]
    : TEMPLATES;
  const [selectedId, setSelectedId] = useState<string>(templates[0].id);
  const [message, setMessage] = useState("");

  // Pre-fill message whenever the selected template or member changes
  useEffect(() => {
    const tpl = templates.find((t) => t.id === selectedId);
    if (!tpl) return;
    setMessage(tpl.body ? personalize(tpl.body, member?.name ?? "") : "");
  }, [selectedId, member?.name]);

  // Reset selection when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedId(templates[0].id);
    }
  }, [isOpen]);

  const handleSend = () => {
    if (!member || !message.trim()) return;
    onSend(member.id, message.trim());
  };

  const tagLabel = tag === "FIRST_TIMER" ? "First Timer" : "Second Timer";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[540px] rounded-xl p-5 sm:p-8 max-h-[90vh] overflow-y-auto border-neutral-200">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight">
            Send Follow-up
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            {member
              ? `Sending to ${member.name} · ${tagLabel}`
              : "Compose a follow-up message."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Template grid */}
          <div>
            <p className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider flex items-center gap-2">
              Choose a template
              {isLoadingTemplates && (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-accent" />
              )}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {templates.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => setSelectedId(tpl.id)}
                  className={cn(
                    "text-left px-3 py-3 rounded-xl border text-sm font-semibold transition-all",
                    selectedId === tpl.id
                      ? "border-accent bg-accent/8 text-accent shadow-sm"
                      : "border-border bg-card text-foreground hover:border-accent/40 hover:bg-accent/5",
                  )}
                >
                  {tpl.label}
                  {tpl.id === "custom" && (
                    <span className="block text-xs font-normal text-muted-foreground mt-0.5">
                      Write your own
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Message editor */}
          <div>
            <p className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
              Message
            </p>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message…"
              rows={5}
              className="w-full px-4 py-3 rounded-xl border border-border bg-muted/20 text-foreground text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all placeholder:text-muted-foreground/50"
            />
            <p className="text-xs text-muted-foreground mt-1 text-right">
              {message.length} chars
            </p>
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSend}
            disabled={isSending || !message.trim()}
            isLoading={isSending}
            className="px-8"
          >
            Send Follow-up
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
