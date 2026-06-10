import { forgotPassword, resetPassword, resendOTP } from "@/api/auth/auth";
import {
  Mail,
  ArrowRight,
  ArrowLeft,
  Lock,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { useEffect, useState } from "react";
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

const otpSchema = z.object({
  otp: z.string().length(6, "Enter the 6-digit code sent to your email"),
});

const passwordSchema = z
  .object({
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type EmailValues = z.infer<typeof emailSchema>;
type OtpValues = z.infer<typeof otpSchema>;
type PasswordValues = z.infer<typeof passwordSchema>;

type Step = "email" | "verify" | "password" | "done";

function isOtpError(message: string) {
  const lower = message.toLowerCase();
  return (
    lower.includes("otp") ||
    lower.includes("code") ||
    lower.includes("expired")
  );
}

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("email");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [verifiedOtp, setVerifiedOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const emailForm = useForm<EmailValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const otpForm = useForm<OtpValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  useEffect(() => {
    if (step !== "verify") return;

    let interval: ReturnType<typeof setInterval>;
    if (resendTimer > 0 && !canResend) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [resendTimer, canResend, step]);

  const onEmailSubmit = async (data: EmailValues) => {
    setIsLoading(true);
    setError(null);
    const result = await forgotPassword({ email: data.email.toLowerCase() });
    setIsLoading(false);
    if (result.success) {
      setSubmittedEmail(data.email.toLowerCase());
      setVerifiedOtp("");
      otpForm.reset();
      setResendTimer(30);
      setCanResend(false);
      setStep("verify");
    } else {
      setError(result.error || "Failed to send reset code. Please try again.");
    }
  };

  const onVerifySubmit = (data: OtpValues) => {
    setVerifiedOtp(data.otp);
    setError(null);
    passwordForm.reset();
    setStep("password");
  };

  const onPasswordSubmit = async (data: PasswordValues) => {
    setIsLoading(true);
    setError(null);
    const result = await resetPassword({
      email: submittedEmail,
      otp: verifiedOtp,
      newPassword: data.newPassword,
    });
    setIsLoading(false);
    if (result.success) {
      setStep("done");
    } else {
      const errorMessage =
        result.error ||
        "Failed to reset password. Check your code and try again.";

      if (isOtpError(errorMessage)) {
        setVerifiedOtp("");
        otpForm.reset({ otp: "" });
        setStep("verify");
      }

      setError(errorMessage);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    setResendTimer(30);
    setCanResend(false);
    setError(null);

    const result = await resendOTP({
      email: submittedEmail,
      type: "password_reset",
    });

    if (!result.success) {
      setError(result.error || "Failed to resend code. Please try again.");
    }
  };

  const goBack = () => {
    setError(null);
    if (step === "verify") {
      setStep("email");
      setVerifiedOtp("");
    } else if (step === "password") {
      setStep("verify");
      setVerifiedOtp("");
      otpForm.reset();
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

          {/* Step: Verify OTP */}
          {step === "verify" && (
            <>
              <div className="mb-10">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goBack}
                  className="px-0 hover:bg-transparent text-muted-foreground hover:text-foreground mb-6"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <h2 className="text-3xl font-bold text-foreground mb-3 tracking-tight">
                  Enter reset code
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  We sent a 6-digit code to{" "}
                  <span className="text-foreground font-medium">
                    {submittedEmail}
                  </span>
                  . Enter it below to continue.
                </p>
              </div>

              <Form {...otpForm}>
                <form
                  onSubmit={otpForm.handleSubmit(onVerifySubmit)}
                  className="space-y-6"
                >
                  <InputField
                    control={otpForm.control}
                    name="otp"
                    label="Reset Code"
                    placeholder="123456"
                    type="otp"
                    otpLength={6}
                    className="flex flex-col items-start w-full"
                  />

                  {error && <ErrorMessage message={error} />}

                  <Button
                    type="submit"
                    className="w-full shadow-xl shadow-primary/20"
                  >
                    Verify Code
                    <ArrowRight className="w-5 h-5" />
                  </Button>

                  <div className="text-center">
                    <Button
                      variant="link"
                      type="button"
                      onClick={handleResend}
                      disabled={!canResend}
                      className="h-auto p-0 text-sm text-accent font-medium"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      {canResend ? "Resend Code" : `Resend in ${resendTimer}s`}
                    </Button>
                  </div>
                </form>
              </Form>
            </>
          )}

          {/* Step: Set Password */}
          {step === "password" && (
            <>
              <div className="mb-10">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goBack}
                  className="px-0 hover:bg-transparent text-muted-foreground hover:text-foreground mb-6"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <h2 className="text-3xl font-bold text-foreground mb-3 tracking-tight">
                  Set a new password
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Choose a new password for your account.
                </p>
              </div>

              <Form {...passwordForm}>
                <form
                  onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                  className="space-y-6"
                >
                  <InputField
                    control={passwordForm.control}
                    name="newPassword"
                    label="New Password"
                    placeholder="At least 8 characters"
                    type="password"
                    icon={Lock}
                  />

                  <InputField
                    control={passwordForm.control}
                    name="confirmPassword"
                    label="Confirm Password"
                    placeholder="Repeat your new password"
                    type="password"
                    icon={Lock}
                  />

                  {error && <ErrorMessage message={error} />}

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
