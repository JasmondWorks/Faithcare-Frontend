import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Form } from "./ui/form";
import { Button } from "@/components/ui/button";
import { InputField } from "./ui/InputField";
import { toast } from "react-hot-toast";
import {
  createFirstTimer,
  createSalvationRecord,
  createPrayerRequest,
  createFollowUp,
} from "@/api/organization/church";
import { useAuth } from "../providers/AuthProvider";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

// common local formats with optional spaces/dashes (min 7 digits stripped).
const phoneRegex = /^\+?[1-9]\d{6,14}$/;
const phoneValidation = z
  .string()
  .min(1, "Phone number is required")
  .refine(
    (val) => phoneRegex.test(val.replace(/[\s\-().]/g, "")),
    "Enter a valid phone number (e.g. +2348012345678)",
  );

const firstTimerSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phoneNumber: phoneValidation,
  visitType: z.enum(["first_time", "second_time"]),
  prayerRequest: z.string().optional(),
  serviceDate: z.string().min(1, "Service date is required"),
});

const salvationSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phoneNumber: phoneValidation,
  dateOfDecision: z.string().min(1, "Date of decision is required"),
  notes: z.string().optional(),
});

const prayerSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phoneNumber: phoneValidation,
  request: z.string().min(5, "Prayer request must be more detailed"),
  priority: z.enum(["HIGH", "MEDIUM", "LOW"]),
});

const followUpSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phoneNumber: phoneValidation,
  description: z.string().min(5, "Description is required"),
  priority: z.enum(["HIGH", "MEDIUM", "LOW"]),
  dueDate: z.string().min(1, "Due date is required"),
});

// â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  type:
  | "first-timers"
  | "second-timers"
  | "salvation-records"
  | "prayer-requests"
  | "follow-ups";
  onSuccess: () => void;
}

// â”€â”€ Shared field styles â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const labelCls =
  "text-base text-muted-foreground ml-1 font-medium mb-2 block";
const inputCls = "rounded-xl border-neutral-200 bg-muted/20 h-11 sm:h-12";

// â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function AddMemberModal({
  isOpen,
  onClose,
  type,
  onSuccess,
}: AddMemberModalProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const organizationId = user?.organizationId || user?.id || "";
  const queryClient = useQueryClient();

  const getSchema = () => {
    switch (type) {
      case "first-timers":
      case "second-timers":
        return firstTimerSchema;
      case "salvation-records":
        return salvationSchema;
      case "prayer-requests":
        return prayerSchema;
      case "follow-ups":
        return followUpSchema;
      default:
        return firstTimerSchema;
    }
  };

  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const form = useForm<any>({
    resolver: zodResolver(getSchema()),
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      visitType: type === "second-timers" ? "second_time" : "first_time",
      prayerRequest: "",
      serviceDate: today,
      dateOfDecision: today,
      notes: "",
      request: "",
      priority: "MEDIUM",
      description: "",
      dueDate: tomorrow,
    },
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      let res;

      switch (type) {
        case "first-timers":
        case "second-timers": {
          const payload = {
            name: data.name,
            phoneNumber: data.phoneNumber,
            email: data.email || undefined,
            prayerRequest: data.prayerRequest || undefined,
            visitType: data.visitType,
            serviceDate: data.serviceDate,
            qrToken: "",  // manual entry — no QR token
          };
          res = await createFirstTimer(payload as any);

          // If a prayer request was entered, also create it on the Prayer Requests page
          if (res?.success && data.prayerRequest?.trim()) {
            const prRes = await createPrayerRequest(organizationId, {
              name: data.name,
              phoneNumber: data.phoneNumber,
              email: data.email || undefined,
              request: data.prayerRequest.trim(),
              priority: "MEDIUM",
            });
            if (prRes?.success) {
              // Invalidate so the Prayer Requests page refetches immediately
              queryClient.invalidateQueries({ queryKey: ["prayer-requests"] });
            }
          }
          break;
        }
        case "salvation-records":
          res = await createSalvationRecord(organizationId, {
            name: data.name,
            phoneNumber: data.phoneNumber,
            email: data.email || undefined,
            decisionDate: data.dateOfDecision,
            notes: data.notes || undefined,
          });
          break;
        case "prayer-requests":
          res = await createPrayerRequest(organizationId, {
            name: data.name,
            phoneNumber: data.phoneNumber,
            email: data.email || undefined,
            request: data.request,
            priority: data.priority,
          });
          break;
        case "follow-ups":
          res = await createFollowUp({
            contactName: data.name,
            contactPhone: data.phoneNumber || "",
            tags: ["OTHER"],
            priority: data.priority,
            description: data.description,
            dueDate: data.dueDate,
          });
          break;
      }

      if (res?.success) {
        toast.success("Record added successfully");
        onSuccess();
        onClose();
        form.reset();
      } else {
        toast.error((res as any)?.error || "Failed to add record");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const title = type
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const isFirstOrSecond = type === "first-timers" || type === "second-timers";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[520px] rounded-lg p-5 sm:p-8 max-h-[90vh] overflow-y-auto border-neutral-200">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight">
            Add New {title.slice(0, -1)}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Enter the details manually to update the church records.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 mt-4"
          >
            {/* â”€â”€ Name â”€â”€ */}
            <InputField
              control={form.control}
              name="name"
              label="Full Name"
              placeholder="Amara Nwosu"
              type="text"
              labelClassName={labelCls}
              inputClassName={inputCls}
            />

            {/* â”€â”€ Email + Phone â”€â”€ */}
            <div className="grid grid-cols-2 gap-4">
              <InputField
                control={form.control}
                name="email"
                label="Email"
                placeholder="amara@example.com"
                type="email"
                labelClassName={labelCls}
                inputClassName={inputCls}
              />

              <InputField
                control={form.control}
                name="phoneNumber"
                label="Phone Number"
                placeholder="+2349087654321"
                type="text"
                labelClassName={labelCls}
                inputClassName={inputCls}
              />
            </div>

            {/* â”€â”€ First / Second Timer fields â”€â”€ */}
            {isFirstOrSecond && (
              <>
                <InputField
                  control={form.control}
                  name="visitType"
                  label="Visit Type"
                  type="custom"
                  labelClassName={labelCls}
                >
                  {(field) => (
                    <>
                      <input type="hidden" {...field} />
                      <div className={`${inputCls} flex items-center px-4 text-foreground/80 bg-muted/30 cursor-not-allowed select-none`}>
                        {type === "second-timers" ? "Second Time" : "First Time"}
                      </div>
                    </>
                  )}
                </InputField>

                <InputField
                  control={form.control}
                  name="serviceDate"
                  label="Service Date"
                  type="text"
                  labelClassName={labelCls}
                  inputClassName={inputCls}
                />

                <InputField
                  control={form.control}
                  name="prayerRequest"
                  label="Prayer Request (optional)"
                  placeholder="Trusting God for a new job opportunity."
                  type="textarea"
                  labelClassName={labelCls}
                  inputClassName="rounded-lg border-neutral-200 bg-muted/20 min-h-[90px]"
                />
              </>
            )}

            {/* â”€â”€ Salvation Record fields â”€â”€ */}
            {type === "salvation-records" && (
              <>
                <InputField
                  control={form.control}
                  name="dateOfDecision"
                  label="Date of Decision"
                  type="text"
                  labelClassName={labelCls}
                  inputClassName={inputCls}
                />

                <InputField
                  control={form.control}
                  name="notes"
                  label="Notes (optional)"
                  placeholder="Made decision during altar call..."
                  type="textarea"
                  labelClassName={labelCls}
                  inputClassName="rounded-lg border-neutral-200 bg-muted/20 min-h-[90px]"
                />
              </>
            )}

            {/* â”€â”€ Prayer Request fields â”€â”€ */}
            {type === "prayer-requests" && (
              <>
                <InputField
                  control={form.control}
                  name="request"
                  label="Prayer Request"
                  placeholder="Details of the request..."
                  type="textarea"
                  labelClassName={labelCls}
                  inputClassName="rounded-lg border-neutral-200 bg-muted/20 min-h-[100px]"
                />

                <InputField
                  control={form.control}
                  name="priority"
                  label="Priority"
                  type="select"
                  options={[
                    { value: "HIGH", label: "High" },
                    { value: "MEDIUM", label: "Medium" },
                    { value: "LOW", label: "Low" },
                  ]}
                  placeholder="Select priority"
                  labelClassName={labelCls}
                />
              </>
            )}

            {/* â”€â”€ Follow-up fields â”€â”€ */}
            {type === "follow-ups" && (
              <>
                <InputField
                  control={form.control}
                  name="description"
                  label="Description"
                  placeholder="Follow up details..."
                  type="textarea"
                  labelClassName={labelCls}
                  inputClassName="rounded-lg border-neutral-200 bg-muted/20 min-h-[100px]"
                />

                <div className="grid grid-cols-2 gap-4">
                  <InputField
                    control={form.control}
                    name="dueDate"
                    label="Due Date"
                    type="text"
                    labelClassName={labelCls}
                    inputClassName={inputCls}
                  />

                  <InputField
                    control={form.control}
                    name="priority"
                    label="Priority"
                    type="select"
                    options={[
                      { value: "HIGH", label: "High" },
                      { value: "MEDIUM", label: "Medium" },
                      { value: "LOW", label: "Low" },
                    ]}
                    placeholder="Select priority"
                    labelClassName={labelCls}
                  />
                </div>
              </>
            )}

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isLoading}
                className="px-8"
              >
                Add Entry
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
