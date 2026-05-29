import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Sparkles,
  Loader2,
  CheckCircle2,
  Link2Off,
  Clock,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { registerFirstTimerPublic, verifyQrToken } from "@/api/organization/church";


// ── Types ─────────────────────────────────────────────────────────────────────

type PageState = "loading" | "invalid" | "expired" | "form" | "success";

interface OrgInfo {
  orgId: string;
  orgName: string;
  slug: string;
}

interface RegistrationFormValues {
  name: string;
  phoneNumber: string;
  email?: string;
  prayerRequest?: string;
  visitType: "first_time" | "second_time";
}

// ── Validation ────────────────────────────────────────────────────────────────

const phoneRegex = /^\+?[1-9]\d{7,14}$/;

const schema = z.object({
  name: z.string().min(2, "Please enter your full name"),
  phoneNumber: z
    .string()
    .min(1, "Phone number is required")
    .refine(
      (val) => phoneRegex.test(val.replace(/[\s\-().]/g, "")),
      "Enter a valid phone number (e.g. +2348012345678)",
    ),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  prayerRequest: z
    .string()
    .max(500, "Maximum 500 characters")
    .optional()
    .or(z.literal("")),
  visitType: z.enum(["first_time", "second_time"], {
    error: "Please select a category",
  }),
});

// ── Shared styles ─────────────────────────────────────────────────────────────

const inputCls =
  "w-full px-4 py-3.5 rounded-2xl border border-neutral-200 bg-white text-foreground text-base focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all placeholder:text-neutral-400 min-h-[52px]";

const labelCls = "block text-sm font-semibold text-foreground mb-1.5 ml-0.5";

// ── Brand mark (non-linking) ───────────────────────────────────────────────────

function BrandMark() {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      <Sparkles className="w-6 h-6 text-accent" />
      <span className="text-lg font-bold text-foreground tracking-tight">
        FaithCare
      </span>
    </div>
  );
}

// ── Status screens ────────────────────────────────────────────────────────────

function StatusScreen({
  icon,
  iconBg,
  heading,
  body,
}: {
  icon: React.ReactNode;
  iconBg: string;
  heading: string;
  body: string;
}) {
  return (
    <div className="flex flex-col items-center text-center py-6">
      <div
        className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${iconBg}`}
      >
        {icon}
      </div>
      <h1 className="text-2xl font-bold text-foreground mb-3 tracking-tight">
        {heading}
      </h1>
      <p className="text-muted-foreground leading-relaxed max-w-xs">{body}</p>
    </div>
  );
}

// ── Registration form ─────────────────────────────────────────────────────────

function RegistrationForm({
  org,
  token,
  onSuccess,
}: {
  org: OrgInfo;
  token: string;
  onSuccess: (orgName: string) => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isExpiredMidSession, setIsExpiredMidSession] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegistrationFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      phoneNumber: "",
      email: "",
      prayerRequest: "",
      visitType: undefined,
    },
  });

  const prayerRequestValue = watch("prayerRequest") ?? "";
  const visitTypeValue = watch("visitType");

  const onSubmit = async (values: RegistrationFormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setIsExpiredMidSession(false);

    const result = await registerFirstTimerPublic({
      qrToken: token,
      name: values.name,
      phoneNumber: values.phoneNumber,
      email: values.email || undefined,
      prayerRequest: values.prayerRequest || undefined,
      visitType: values.visitType,
      serviceDate: new Date().toISOString().split("T")[0],
    });

    setIsSubmitting(false);

    if (result.success) {
      onSuccess(org.orgName);
      return;
    }

    if ((result as any).expired) {
      setIsExpiredMidSession(true);
    } else {
      setSubmitError(result.error ?? "Registration failed. Please try again.");
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2 tracking-tight leading-tight">
          Welcome to <span className="text-accent">{org.orgName}</span>
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          Fill in your details below so we can follow up with you.
        </p>
      </div>

      {/* Expired mid-session error */}
      {isExpiredMidSession && (
        <div className="flex items-start gap-3 p-4 mb-6 bg-orange-50 border border-orange-200 rounded-2xl">
          <Clock className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
          <p className="text-sm text-orange-800 font-medium leading-relaxed">
            Your session has expired. Please scan the QR code again to register.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {/* Full Name */}
        <div>
          <label className={labelCls}>
            Full Name <span className="text-accent">*</span>
          </label>
          <input
            {...register("name")}
            type="text"
            placeholder="Amara Nwosu"
            autoComplete="name"
            className={`${inputCls} ${errors.name ? "border-destructive" : ""}`}
          />
          {errors.name && (
            <p className="text-xs text-destructive mt-1.5 ml-0.5">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Phone Number */}
        <div>
          <label className={labelCls}>
            Phone Number <span className="text-accent">*</span>
          </label>
          <input
            {...register("phoneNumber")}
            type="tel"
            inputMode="tel"
            placeholder="+2348012345678"
            autoComplete="tel"
            className={`${inputCls} ${errors.phoneNumber ? "border-destructive" : ""}`}
          />
          {errors.phoneNumber && (
            <p className="text-xs text-destructive mt-1.5 ml-0.5">
              {errors.phoneNumber.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className={labelCls}>
            Email Address{" "}
            <span className="text-neutral-400 font-normal text-xs">
              (optional)
            </span>
          </label>
          <input
            {...register("email")}
            type="email"
            inputMode="email"
            placeholder="amara@example.com"
            autoComplete="email"
            className={`${inputCls} ${errors.email ? "border-destructive" : ""}`}
          />
          {errors.email && (
            <p className="text-xs text-destructive mt-1.5 ml-0.5">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Prayer Request */}
        <div>
          <label className={labelCls}>
            Prayer Request{" "}
            <span className="text-neutral-400 font-normal text-xs">
              (optional)
            </span>
          </label>
          <textarea
            {...register("prayerRequest")}
            placeholder="Share anything you'd like the team to pray for…"
            rows={4}
            maxLength={500}
            className={`w-full px-4 py-3.5 rounded-2xl border border-neutral-200 bg-white text-foreground text-base focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all placeholder:text-neutral-400 resize-none leading-relaxed ${errors.prayerRequest ? "border-destructive" : ""
              }`}
          />
          <div className="flex items-center justify-between mt-1.5 ml-0.5">
            {errors.prayerRequest ? (
              <p className="text-xs text-destructive">
                {errors.prayerRequest.message}
              </p>
            ) : (
              <span />
            )}
            <span className="text-xs text-neutral-400 ml-auto">
              {prayerRequestValue.length}/500
            </span>
          </div>
        </div>

        {/* Visit Type */}
        <div>
          <label className={labelCls}>
            How many times have you visited?{" "}
            <span className="text-accent">*</span>
          </label>
          <div className="grid grid-cols-1 gap-3 mt-1">
            {(
              [
                {
                  value: "first_time",
                  label: "This is my first visit",
                  sub: "First time here — welcome!",
                },
                {
                  value: "second_time",
                  label: "I've been here before",
                  sub: "Great to see you again!",
                },
              ] as const
            ).map((opt) => {
              const isSelected = visitTypeValue === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    setValue("visitType", opt.value, { shouldValidate: true })
                  }
                  className={`w-full text-left px-4 py-4 rounded-2xl border-2 transition-all ${isSelected
                    ? "border-accent bg-accent/5"
                    : "border-neutral-200 bg-white hover:border-accent/40"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${isSelected ? "border-accent" : "border-neutral-300"
                        }`}
                    >
                      {isSelected && (
                        <div className="w-2.5 h-2.5 rounded-full bg-accent" />
                      )}
                    </div>
                    <div>
                      <p
                        className={`font-semibold text-sm ${isSelected ? "text-accent" : "text-foreground"}`}
                      >
                        {opt.label}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {opt.sub}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          {errors.visitType && (
            <p className="text-xs text-destructive mt-1.5 ml-0.5">
              {errors.visitType.message}
            </p>
          )}
        </div>

        {/* Server error */}
        {submitError && (
          <div className="flex items-start gap-3 p-4 bg-destructive/5 border border-destructive/20 rounded-2xl">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <p className="text-sm text-destructive font-medium leading-relaxed">
              {submitError}
            </p>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-accent text-white font-bold text-base rounded-2xl shadow-lg shadow-accent/25 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100 min-h-[56px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Submitting…
            </>
          ) : (
            <>
              Submit Registration
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Register() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [state, setState] = useState<PageState>("loading");
  const [org, setOrg] = useState<OrgInfo | null>(null);
  const [successOrgName, setSuccessOrgName] = useState("");

  useEffect(() => {
    if (!token) {
      setState("invalid");
      return;
    }


    (async function () {
      const result = await verifyQrToken({ token });

      if (result.success && result.data) {
        setOrg(result.data);
        setState("form");
      } else if ((result as any).expired) {
        setState("expired");
      } else {
        setState("invalid");
      }
    })()
  }, [token]);

  const handleSuccess = (orgName: string) => {
    setSuccessOrgName(orgName);
    setState("success");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent/5 via-background to-accent/3 flex items-start justify-center p-5 pt-10 pb-16">
      <div className="w-full max-w-md">
        <BrandMark />

        {/* Loading */}
        {state === "loading" && (
          <div className="bg-white rounded-3xl p-8 shadow-xl shadow-black/5 border border-neutral-100 flex flex-col items-center text-center gap-4 py-16">
            <Loader2 className="w-10 h-10 animate-spin text-accent" />
            <div>
              <p className="font-semibold text-foreground">
                Checking your link…
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Just a moment.
              </p>
            </div>
          </div>
        )}

        {/* Invalid */}
        {state === "invalid" && (
          <div className="bg-white rounded-3xl p-8 shadow-xl shadow-black/5 border border-neutral-100">
            <StatusScreen
              iconBg="bg-neutral-100"
              icon={<Link2Off className="w-9 h-9 text-neutral-500" />}
              heading="Invalid QR Code"
              body="This link is not a valid registration link. Please scan the QR code displayed at the venue."
            />
          </div>
        )}

        {/* Expired */}
        {state === "expired" && (
          <div className="bg-white rounded-3xl p-8 shadow-xl shadow-black/5 border border-neutral-100">
            <StatusScreen
              iconBg="bg-orange-50"
              icon={<Clock className="w-9 h-9 text-orange-400" />}
              heading="QR Code Expired"
              body="This QR code is no longer active. Please scan the latest QR code displayed at the venue or ask the admin to refresh it."
            />
          </div>
        )}

        {/* Form */}
        {state === "form" && org && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-black/5 border border-neutral-100">
            <RegistrationForm
              org={org}
              token={token}
              onSuccess={handleSuccess}
            />
          </div>
        )}

        {/* Success */}
        {state === "success" && (
          <div className="bg-white rounded-3xl p-8 shadow-xl shadow-black/5 border border-neutral-100">
            <div className="flex flex-col items-center text-center py-4">
              <div className="w-20 h-20 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-3 tracking-tight">
                You're registered!
              </h1>
              <p className="text-muted-foreground leading-relaxed max-w-xs">
                Welcome to{" "}
                <span className="font-semibold text-foreground">
                  {successOrgName}
                </span>
                . We're glad you're here today. Expect a message from us soon.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
