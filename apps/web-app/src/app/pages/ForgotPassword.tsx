import { forgotPassword, resetPassword } from "@/api/auth/auth";
import {
  Mail,
  ArrowRight,
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  KeyRound,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Logo from "../components/Logo";
import ErrorMessage from "../components/ui/error-message";
import { Form } from "../components/ui/form";
import { InputField } from "../components/ui/InputField";
import { Button } from "@/components/ui/button";

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const resetSchema = z
  .object({
    otp: z.string().length(6, "Enter the 6-digit code sent to your email"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type EmailValues = z.infer<typeof emailSchema>;
type ResetValues = z.infer<typeof resetSchema>;

type Step = "email" | "reset" | "done";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("email");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const emailForm = useForm<EmailValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const resetForm = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { otp: "", newPassword: "", confirmPassword: "" },
  });

  const onEmailSubmit = async (data: EmailValues) => {
    setIsLoading(true);
    setError(null);
    const result = await forgotPassword({ email: data.email.toLowerCase() });
    setIsLoading(false);
    if (result.success) {
      setSubmittedEmail(data.email.toLowerCase());
      setStep("reset");
    } else {
      setError(result.error || "Failed to send reset code. Please try again.");
    }
  };

  const onResetSubmit = async (data: ResetValues) => {
    setIsLoading(true);
    setError(null);
    const result = await resetPassword({
      email: submittedEmail,
      otp: data.otp,
      newPassword: data.newPassword,
    });
    setIsLoading(false);
    if (result.success) {
      setStep("done");
    } else {
      setError(
        result.error ||
          "Failed to reset password. Check your code and try again.",
      );
    }
  };

  return (
    <div className="min-h-screen bg-background flex font-sans">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Logo />

          {/* Step: Email */}
          {step === "email" && (
            <>
              <div className="mb-10">
                <h2 className="text-3xl font-bold text-foreground mb-3 tracking-tight">
                  Forgot your password?
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Enter your account email and we'll send you a reset code.
                </p>
              </div>

              <Form {...emailForm}>
                <form
                  onSubmit={emailForm.handleSubmit(onEmailSubmit)}
                  className="space-y-6"
                >
                  <InputField
                    control={emailForm.control}
                    name="email"
                    label="Email Address"
                    placeholder="you@example.com"
                    type="email"
                    icon={Mail}
                  />

                {error && <ErrorMessage message={error} />}

                <Button
                  type="submit"
                  isLoading={isLoading}
                  className="w-full shadow-xl shadow-primary/20"
                >
                  {isLoading ? "Sending..." : "Send Reset Code"}
                  {!isLoading && <ArrowRight className="w-5 h-5" />}
                </Button>
                </form>
              </Form>
            </>
          )}

          {/* Step: Reset */}
          {step === "reset" && (
            <>
              <div className="mb-10">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setStep("email");
                    setError(null);
                  }}
                  className="px-0 hover:bg-transparent text-muted-foreground hover:text-foreground mb-6"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <h2 className="text-3xl font-bold text-foreground mb-3 tracking-tight">
                  Set a new password
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  We sent a 6-digit code to{" "}
                  <span className="text-foreground font-medium">
                    {submittedEmail}
                  </span>
                  . Enter it below along with your new password.
                </p>
              </div>

              <Form {...resetForm}>
                <form
                  onSubmit={resetForm.handleSubmit(onResetSubmit)}
                  className="space-y-6"
                >
                  {/* OTP */}
                  <InputField
                    control={resetForm.control}
                    name="otp"
                    label="Reset Code"
                    placeholder="123456"
                    type="otp"
                    otpLength={6}
                    className="flex flex-col items-start w-full"
                  />

                  {/* New Password */}
                  <InputField
                    control={resetForm.control}
                    name="newPassword"
                    label="New Password"
                    placeholder="At least 8 characters"
                    type="password"
                    icon={Lock}
                  />

                  {/* Confirm Password */}
                  <InputField
                    control={resetForm.control}
                    name="confirmPassword"
                    label="Confirm Password"
                    placeholder="Repeat your new password"
                    type="password"
                    icon={Lock}
                  />

                {error && (
                  <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
                    <p className="text-sm text-destructive font-medium">
                      {error}
                    </p>
                  </div>
                )}

                <Button
                  type="submit"
                  isLoading={isLoading}
                  className="w-full shadow-xl shadow-primary/20"
                >
                  {isLoading ? "Resetting..." : "Reset Password"}
                  {!isLoading && <ArrowRight className="w-5 h-5" />}
                </Button>
                </form>
              </Form>
            </>
          )}

          {/* Step: Done */}
          {step === "done" && (
            <div className="text-center py-8">
              <div className="w-20 h-20 rounded-full bg-success/10 border border-success/20 flex items-center justify-center mx-auto mb-8">
                <svg
                  className="w-10 h-10 text-success"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-3 tracking-tight">
                Password reset!
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-10">
                Your password has been updated successfully. You can now sign in
                with your new password.
              </p>
              <Button
                onClick={() => navigate("/")}
                className="w-full shadow-xl shadow-primary/20"
              >
                Back to Sign In
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          )}

          {step !== "done" && (
            <p className="text-center text-muted-foreground mt-10">
              Remember your password?{" "}
              <Link
                to="/"
                className="text-accent hover:text-accent/80 transition-all font-medium"
              >
                Sign in
              </Link>
            </p>
          )}
        </div>
      </div>

      {/* Right Side - Hero */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-accent/10 to-accent/5 items-center justify-center p-16">
        <div className="max-w-lg">
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-8 border border-accent/20 shadow-xl shadow-accent/5">
            <Sparkles className="w-8 h-8 text-accent" />
          </div>
          <h2 className="text-4xl font-bold text-foreground mb-6 tracking-tight">
            Empowering spiritual growth for your community
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed mb-10 opacity-80">
            FaithCare helps churches nurture deeper connections with their
            members while providing tools for personal spiritual development.
          </p>
          <div className="space-y-6">
            {[
              {
                title: "Member Care Management",
                desc: "Track first timers, prayer requests, and follow-ups with automated tools.",
              },
              {
                title: "Spiritual Productivity",
                desc: "Daily scripture, journaling, and focus tools designed for modern believers.",
              },
              {
                title: "Built for Young Professionals",
                desc: "Modern, intuitive design that fits your lifestyle and elevates your experience.",
              },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mt-1 bg-success/10 border border-success/20 shadow-inner shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-success" />
                </div>
                <div>
                  <p className="text-foreground font-bold text-lg">
                    {item.title}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
