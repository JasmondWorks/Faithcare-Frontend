import { useLayout } from "../contexts/LayoutContext";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useWatch } from "react-hook-form";
import {
  getMessageTemplatePresets,
  getMessageTemplates,
  createMessageTemplate,
  updateMessageTemplate,
  deleteMessageTemplate,
} from "@/api/organization/church";
import { useAuth } from "../providers/AuthProvider";
import { toast } from "react-hot-toast";
import { Card } from "../components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  FileText,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  MessageCircle,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Sparkles,
  Copy,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

interface MessageTemplate {
  id?: string;
  _id?: string;
  name: string;
  channel: "whatsapp" | "sms" | string;
  trigger: string;
  body: string;
  variables?: string[];
  isActive?: boolean;
  isPreset?: boolean;
  createdAt?: string;
}

// ── Schema ────────────────────────────────────────────────────────────────────

const schema = z.object({
  name: z.string().min(2, "Template name is required"),
  channel: z.enum(["whatsapp", "sms"], { error: "Channel is required" }),
  trigger: z.string().min(1, "Trigger is required"),
  body: z.string().min(5, "Message body is required"),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

// ── Helpers ───────────────────────────────────────────────────────────────────

function extractVariables(body: string): string[] {
  return [...new Set([...body.matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1]))];
}

const TRIGGERS = [
  { value: "manual", label: "Manual" },
  { value: "on_registration", label: "On Registration" },
  { value: "day_3", label: "Day 3 Follow-up" },
  { value: "day_7", label: "Day 7 Follow-up" },
  { value: "auto", label: "Automatic" },
];

const labelCls = "text-sm font-medium text-muted-foreground mb-1.5 block";
const inputCls =
  "w-full px-4 py-2.5 rounded-xl border border-border bg-muted/20 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all placeholder:text-muted-foreground/50";

// ── Shared badge row ──────────────────────────────────────────────────────────

function TemplateBadges({
  channel,
  trigger,
  isActive,
  isPreset,
}: {
  channel: string;
  trigger: string;
  isActive?: boolean;
  isPreset?: boolean;
}) {
  const isWhatsApp = channel?.toLowerCase() === "whatsapp";
  const active = isActive !== false;
  const triggerLabel =
    TRIGGERS.find((t) => t.value === trigger)?.label ?? trigger ?? "manual";

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {isPreset && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border bg-amber-50 border-amber-200 text-amber-700 text-[10px] font-bold uppercase tracking-wider">
          <Sparkles className="w-2.5 h-2.5" />
          Preset
        </span>
      )}
      <span
        className={cn(
          "inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider",
          isWhatsApp
            ? "bg-green-50 text-green-700 border-green-200"
            : "bg-blue-50 text-blue-700 border-blue-200",
        )}
      >
        {isWhatsApp ? (
          <MessageCircle className="w-2.5 h-2.5" />
        ) : (
          <MessageSquare className="w-2.5 h-2.5" />
        )}
        {channel?.toUpperCase()}
      </span>
      <span className="inline-flex items-center px-2 py-0.5 rounded-full border border-border bg-muted/50 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
        {triggerLabel}
      </span>
      {!isPreset && (
        <span
          className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold",
            active
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-gray-100 text-gray-500 border-gray-200",
          )}
        >
          {active ? (
            <CheckCircle2 className="w-2.5 h-2.5" />
          ) : (
            <XCircle className="w-2.5 h-2.5" />
          )}
          {active ? "Active" : "Inactive"}
        </span>
      )}
    </div>
  );
}

// ── Preset card (read-only) ───────────────────────────────────────────────────

function PresetCard({
  template,
  onUse,
}: {
  template: MessageTemplate;
  onUse: () => void;
}) {
  const vars = template.variables?.length
    ? template.variables
    : extractVariables(template.body ?? "");

  return (
    <Card
      padding="none"
      className="flex flex-col bg-amber-50/40 border-amber-100 hover:border-amber-200 hover:shadow-md transition-all"
    >
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div>
          <TemplateBadges
            channel={template.channel}
            trigger={template.trigger}
            isPreset
          />
          <h3 className="font-bold text-foreground text-sm leading-tight mt-2">
            {template.name}
          </h3>
        </div>
        <p className="text-sm text-foreground/70 leading-relaxed line-clamp-3 flex-1">
          {template.body}
        </p>
        {vars.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {vars.map((v) => (
              <span
                key={v}
                className="inline-flex items-center px-2 py-0.5 rounded-full bg-accent/8 border border-accent/15 text-accent text-[11px] font-mono font-semibold"
              >
                {`{{${v}}}`}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="px-5 py-3 border-t border-amber-100 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {(template.body ?? "").length} chars
        </span>
        <button
          type="button"
          onClick={onUse}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
        >
          <Copy className="w-3 h-3" />
          Use template
        </button>
      </div>
    </Card>
  );
}

// ── Org template card (editable) ──────────────────────────────────────────────

function TemplateCard({
  template,
  onEdit,
  onDelete,
  isDeleting,
}: {
  template: MessageTemplate;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const vars = template.variables?.length
    ? template.variables
    : extractVariables(template.body ?? "");

  return (
    <Card
      padding="none"
      className="group flex flex-col hover:shadow-lg hover:border-accent/30 transition-all"
    >
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <TemplateBadges
              channel={template.channel}
              trigger={template.trigger}
              isActive={template.isActive}
            />
            <h3 className="font-bold text-foreground text-sm leading-tight mt-2">
              {template.name}
            </h3>
            {template.createdAt && (
              <p className="text-[11px] text-muted-foreground/50 mt-0.5">
                {new Date(template.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button
              type="button"
              onClick={onEdit}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-accent hover:bg-accent/10 transition-colors"
              title="Edit"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onDelete}
              disabled={isDeleting}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
              title="Delete"
            >
              {isDeleting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
        <p className="text-sm text-foreground/70 leading-relaxed line-clamp-3 flex-1">
          {template.body}
        </p>
        {vars.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {vars.map((v) => (
              <span
                key={v}
                className="inline-flex items-center px-2 py-0.5 rounded-full bg-accent/8 border border-accent/15 text-accent text-[11px] font-mono font-semibold"
              >
                {`{{${v}}}`}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="px-5 py-3 border-t border-border/40 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {(template.body ?? "").length} chars
        </span>
        <button
          type="button"
          onClick={onEdit}
          className="text-xs font-semibold text-accent hover:underline"
        >
          Edit
        </button>
      </div>
    </Card>
  );
}

// ── Template form modal ───────────────────────────────────────────────────────

function TemplateModal({
  isOpen,
  onClose,
  editing,
  prefill,
  onSubmit,
  isSaving,
}: {
  isOpen: boolean;
  onClose: () => void;
  /** Set when editing an existing org template (triggers PATCH). */
  editing: MessageTemplate | null;
  /** Set when copying a preset (triggers POST with pre-filled values). */
  prefill: Partial<FormValues> | null;
  onSubmit: (values: FormValues) => void;
  isSaving: boolean;
}) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      channel: "whatsapp",
      trigger: "manual",
      body: "",
      isActive: true,
    },
  });

  const bodyValue = useWatch({ control, name: "body", defaultValue: "" });
  const detectedVars = extractVariables(bodyValue);

  useEffect(() => {
    if (!isOpen) return;
    if (editing) {
      reset({
        name: editing.name ?? "",
        channel: (editing.channel as "whatsapp" | "sms") ?? "whatsapp",
        trigger: editing.trigger ?? "manual",
        body: editing.body ?? "",
        isActive: editing.isActive ?? true,
      });
    } else if (prefill) {
      reset({
        name: prefill.name ?? "",
        channel: prefill.channel ?? "whatsapp",
        trigger: prefill.trigger ?? "manual",
        body: prefill.body ?? "",
        isActive: prefill.isActive ?? true,
      });
    } else {
      reset({ name: "", channel: "whatsapp", trigger: "manual", body: "", isActive: true });
    }
  }, [isOpen, editing, prefill]);

  const isEditing = !!editing;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[540px] rounded-xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto border-neutral-200">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight">
            {isEditing ? "Edit Template" : prefill ? "Create from Preset" : "New Template"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            {isEditing
              ? "Update this message template for your organisation."
              : prefill
                ? "This template is pre-filled from a preset. Customise it and save as your own."
                : "Create a reusable message template for follow-ups and bulk messaging."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          {/* Name */}
          <div>
            <label className={labelCls}>Template Name</label>
            <input
              {...register("name")}
              placeholder="e.g. Welcome Message"
              className={cn(inputCls, errors.name && "border-destructive")}
            />
            {errors.name && (
              <p className="text-xs text-destructive mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Channel + Trigger */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Channel</label>
              <select
                {...register("channel")}
                className={cn(inputCls, "cursor-pointer", errors.channel && "border-destructive")}
              >
                <option value="whatsapp">WhatsApp</option>
                <option value="sms">SMS</option>
              </select>
              {errors.channel && (
                <p className="text-xs text-destructive mt-1">{errors.channel.message}</p>
              )}
            </div>
            <div>
              <label className={labelCls}>Trigger</label>
              <select {...register("trigger")} className={cn(inputCls, "cursor-pointer")}>
                {TRIGGERS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Body */}
          <div>
            <label className={labelCls}>Message Body</label>
            <textarea
              {...register("body")}
              placeholder="Hi {{name}}, welcome to {{church_name}}! We're so glad you joined us."
              rows={6}
              className={cn(
                "w-full px-4 py-3 rounded-xl border border-border bg-muted/20 text-foreground text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all placeholder:text-muted-foreground/50",
                errors.body && "border-destructive",
              )}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Wrap variable names in{" "}
              <code className="bg-muted px-1 py-0.5 rounded text-accent font-mono text-[11px]">
                {"{{double_braces}}"}
              </code>{" "}
              to personalise messages.
            </p>
            {errors.body && (
              <p className="text-xs text-destructive mt-1">{errors.body.message}</p>
            )}
            {detectedVars.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5 items-center">
                <span className="text-xs text-muted-foreground font-medium">Variables:</span>
                {detectedVars.map((v) => (
                  <span
                    key={v}
                    className="inline-flex items-center px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-[11px] font-mono font-semibold"
                  >
                    {`{{${v}}}`}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* isActive toggle */}
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-medium text-foreground">Active</p>
              <p className="text-xs text-muted-foreground">
                Inactive templates won't appear in the send flow.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" {...register("isActive")} className="sr-only peer" />
              <div className="w-10 h-5 bg-muted rounded-full peer peer-checked:bg-accent transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
            </label>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving} isLoading={isSaving} className="px-8">
              {isEditing ? "Save Changes" : "Create Template"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Section header ────────────────────────────────────────────────────────────

function SectionHeader({
  title,
  subtitle,
  count,
}: {
  title: string;
  subtitle: string;
  count?: number;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
          {title}
          {count !== undefined && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              {count}
            </span>
          )}
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function MessageTemplates() {
  const { setHeader } = useLayout();
  useEffect(() => {
    setHeader(
      "Message Templates",
      "Manage reusable message templates for follow-ups and bulk messaging.",
    );
  }, []);

  const { user } = useAuth();
  const queryClient = useQueryClient();
  const organizationId = user?.organizationId ?? "";

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MessageTemplate | null>(null);
  const [prefill, setPrefill] = useState<Partial<FormValues> | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ── Queries ──

  const { data: presetsData, isLoading: isLoadingPresets } = useQuery({
    queryKey: ["message-template-presets"],
    queryFn: getMessageTemplatePresets,
    staleTime: 10 * 60_000,
  });

  const { data: orgData, isLoading: isLoadingOrg } = useQuery({
    queryKey: ["message-templates", organizationId],
    queryFn: getMessageTemplates,
    enabled: !!organizationId,
  });

  const presets: MessageTemplate[] = presetsData?.data ?? [];
  // Org endpoint may also return presets — keep only org-owned ones here
  const allOrgTemplates: MessageTemplate[] = orgData?.data ?? [];
  const orgTemplates = allOrgTemplates.filter((t) => !t.isPreset);

  const isLoading = isLoadingPresets || isLoadingOrg;

  // ── Mutations ──

  const createMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const result = await createMessageTemplate({
        ...values,
        variables: extractVariables(values.body),
      } as any);
      if (!result.success) throw new Error(result.error || "Failed to create template");
      return result;
    },
    onSuccess: () => {
      toast.success("Template created.");
      queryClient.invalidateQueries({ queryKey: ["message-templates"] });
      setModalOpen(false);
      setPrefill(null);
    },
    onError: (e: any) => toast.error(e.message || "Failed to create template"),
  });

  const updateMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const result = await updateMessageTemplate(
        editing?.id ?? editing?._id ?? "",
        { ...values, variables: extractVariables(values.body) } as any,
      );
      if (!result.success) throw new Error(result.error || "Failed to update template");
      return result;
    },
    onSuccess: () => {
      toast.success("Template updated.");
      queryClient.invalidateQueries({ queryKey: ["message-templates"] });
      setModalOpen(false);
      setEditing(null);
    },
    onError: (e: any) => toast.error(e.message || "Failed to update template"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteMessageTemplate(id);
      if (!result.success) throw new Error(result.error || "Failed to delete template");
      return result;
    },
    onSuccess: () => {
      toast.success("Template deleted.");
      queryClient.invalidateQueries({ queryKey: ["message-templates"] });
      setDeletingId(null);
    },
    onError: (e: any) => toast.error(e.message || "Failed to delete template"),
  });

  const handleSubmit = (values: FormValues) => {
    if (editing) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  };

  const handleDelete = (template: MessageTemplate) => {
    const id = template.id ?? template._id ?? "";
    if (!confirm(`Delete "${template.name}"? This cannot be undone.`)) return;
    setDeletingId(id);
    deleteMutation.mutate(id);
  };

  const openCreate = () => {
    setEditing(null);
    setPrefill(null);
    setModalOpen(true);
  };

  const openFromPreset = (preset: MessageTemplate) => {
    setEditing(null);
    setPrefill({
      name: preset.name,
      channel: preset.channel as "whatsapp" | "sms",
      trigger: preset.trigger,
      body: preset.body,
      isActive: true,
    });
    setModalOpen(true);
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-8">
      {/* Action bar */}
      <Card className="flex items-center justify-between gap-4 flex-wrap">
        <p className="text-sm text-muted-foreground">
          {orgTemplates.length} custom template{orgTemplates.length !== 1 ? "s" : ""}
          {presets.length > 0 && ` · ${presets.length} presets`}
        </p>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          New Template
        </Button>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      ) : (
        <>
          {/* ── Preset Templates ── */}
          {presets.length > 0 && (
            <div className="space-y-4">
              <SectionHeader
                title="Preset Templates"
                subtitle="System-provided templates. Use them as a starting point for your own."
                count={presets.length}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {presets.map((tpl) => (
                  <PresetCard
                    key={tpl._id ?? tpl.id}
                    template={tpl}
                    onUse={() => openFromPreset(tpl)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── Your Templates ── */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <SectionHeader
                title="Your Templates"
                subtitle="Templates created for your organisation. Full edit and delete access."
                count={orgTemplates.length}
              />
            </div>

            {orgTemplates.length === 0 ? (
              <Card
                variant="ghost"
                padding="xl"
                className="flex flex-col items-center justify-center gap-4 py-16"
              >
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center border border-accent/20">
                  <FileText className="w-6 h-6 text-accent" />
                </div>
                <div className="text-center max-w-xs">
                  <p className="font-bold text-foreground mb-1">No custom templates yet</p>
                  <p className="text-sm text-muted-foreground">
                    Create your own or click "Use template" on a preset above to get started.
                  </p>
                </div>
                <Button onClick={openCreate} className="gap-2 mt-1">
                  <Plus className="w-4 h-4" />
                  Create your first template
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {orgTemplates.map((tpl) => {
                  const id = tpl.id ?? tpl._id ?? "";
                  return (
                    <TemplateCard
                      key={id}
                      template={tpl}
                      isDeleting={deleteMutation.isPending && deletingId === id}
                      onEdit={() => {
                        setEditing(tpl);
                        setPrefill(null);
                        setModalOpen(true);
                      }}
                      onDelete={() => handleDelete(tpl)}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      <TemplateModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
          setPrefill(null);
        }}
        editing={editing}
        prefill={prefill}
        onSubmit={handleSubmit}
        isSaving={isSaving}
      />
    </div>
  );
}
