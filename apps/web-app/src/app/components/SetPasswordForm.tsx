import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Lock, Eye, EyeOff, ArrowRight, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { acceptInvite } from "@/api/auth/auth";

const schema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

interface SetPasswordFormProps {
  token: string;
  name: string;
  email: string;
  orgName: string;
  onSuccess: () => void;
}

export function SetPasswordForm({
  token,
  name,
  email,
  orgName,
  onSuccess,
}: SetPasswordFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setServerError(null);
    const result = await acceptInvite({ token, password: data.password });
    setIsLoading(false);
    if (result.success) {
      onSuccess();
    } else {
      setServerError(result.error || "Failed to set password. Please try again.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Personalized greeting */}
      <div>
        <div className="flex items-center gap-2 mb-5">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 rounded-full border border-accent/20">
            <Building2 className="w-3.5 h-3.5 text-accent" />
            <span className="text-xs font-semibold text-accent uppercase tracking-widest">
              {orgName}
            </span>
          </div>
        </div>
        <h2 className="text-3xl font-bold text-foreground mb-2 tracking-tight">
          Welcome, {name.split(" ")[0]}!
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          You've been invited to join{" "}
          <span className="font-medium text-foreground">{orgName}</span> on
          FaithCare. Set a password for{" "}
          <span className="font-medium text-foreground">{email}</span> to
          activate your account.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Password */}
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground ml-1">Password</label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              placeholder="At least 8 characters"
              className={`w-full pl-12 pr-12 py-4 bg-secondary/30 border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all text-foreground text-lg ${
                errors.password ? "border-destructive" : "border-border"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-destructive ml-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground ml-1">
            Confirm Password
          </label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
            <input
              {...register("confirmPassword")}
              type={showConfirm ? "text" : "password"}
              placeholder="Repeat your password"
              className={`w-full pl-12 pr-12 py-4 bg-secondary/30 border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all text-foreground text-lg ${
                errors.confirmPassword ? "border-destructive" : "border-border"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              tabIndex={-1}
              aria-label={showConfirm ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showConfirm ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-destructive ml-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {serverError && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
            <p className="text-sm text-destructive font-medium">{serverError}</p>
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl shadow-xl shadow-primary/20 active:scale-95"
        >
          {isLoading ? "Activating account…" : "Set Password & Activate"}
          {!isLoading && <ArrowRight className="w-5 h-5" />}
        </Button>
      </form>
    </div>
  );
}
