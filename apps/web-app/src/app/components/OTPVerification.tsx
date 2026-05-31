import { useState, useEffect } from "react";
import {
  ShieldCheck,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { verifyOTP, resendOTP } from "@/api/auth/auth";
import { toast } from "react-hot-toast";
import { useAuth } from "../providers/AuthProvider";
import Logo from "./Logo";
import ErrorMessage from "./ui/error-message";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "./ui/form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { InputField } from "./ui/InputField";

const otpSchema = z.object({
  otp: z.string().length(6, "Please enter the full 6-digit code"),
});

type OtpValues = z.infer<typeof otpSchema>;

export function OTPVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const { initializeSession } = useAuth();
  const email =
    location.state?.email ||
    localStorage.getItem("pendingEmail") ||
    "your email";

  const [isVerifying, setIsVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const form = useForm<OtpValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (resendTimer > 0 && !canResend) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [resendTimer, canResend]);

  const onSubmit = async (data: OtpValues) => {
    setErrorMessage("");

    setIsVerifying(true);
    const res = await verifyOTP({ email, otp: data.otp });
    setIsVerifying(false);

    if (res.success) {
      toast.success("Verification successful!");

      // Use the centralized session initializer from useAuth
      type SessionUser = Parameters<typeof initializeSession>[0];
      const resData = res.data as { data?: { user?: SessionUser; accessToken?: string }; user?: SessionUser; accessToken?: string } | undefined;
      const sessionData = resData?.data ?? resData;
      if (sessionData?.accessToken) {
        await initializeSession(sessionData.user, sessionData.accessToken);
      }

      // userType is now synchronized in AuthProvider.login
      const userType = localStorage.getItem("userType") || "individual";
      if (userType === "individual") {
        navigate("/individual-onboarding");
      } else {
        navigate("/organization-onboarding");
      }
    } else {
      const errorMsg = res?.error || "Verification failed";
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    setResendTimer(30);
    setCanResend(false);

    const res = await resendOTP(email);
    if (res.success) {
      toast.success("OTP resent successfully");
    } else {
      toast.error(res.error || "Failed to resend OTP");
    }
  };

  return (
    <div className="min-h-screen bg-background flex font-sans">
      {/* Left Side - Hero */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-accent/10 to-accent/5 items-center justify-center p-16">
        <div className="max-w-lg">
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-6 border border-accent/20 shadow-xl shadow-accent/5">
            <ShieldCheck className="w-8 h-8 text-accent" />
          </div>
          <h2 className="text-4xl font-bold text-foreground mb-6">
            Security is our priority
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed mb-8">
            We've sent a 6-digit verification code to your email. This helps us
            ensure your account stays secure and private.
          </p>

          <div className="bg-card rounded-lg p-6 border border-neutral-200 shadow-lg">
            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="font-medium text-foreground">
                  Two-Factor Authentication
                </p>
                <p className="text-sm">
                  Protecting your spiritual journey and data.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Logo />

          <div className="mb-10">
            <h2 className="text-3xl font-bold text-foreground mb-3">
              Verify your email
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Enter the 6-digit code sent to{" "}
              <span className="text-foreground font-medium">{email}</span>
            </p>
            <Button
              variant="link"
              onClick={() => navigate(-1)}
              className="h-auto p-0 text-xs text-accent font-medium mt-2"
            >
              Entered the wrong email?
            </Button>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
              <div className="space-y-3">
                <div className="flex justify-center">
                   <InputField
                    control={form.control}
                    name="otp"
                    type="otp"
                    otpLength={6}
                  />
                </div>
                {errorMessage && <ErrorMessage message={errorMessage} />}
              </div>

              <div className="space-y-6">
                <Button
                  type="submit"
                  isLoading={isVerifying}
                  className="w-full shadow-xl shadow-primary/20"
                >
                  {isVerifying ? (
                    "Verifying..."
                  ) : (
                    <>
                      Verify Code
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </Button>

                <div className="text-center">
                  <Button
                    variant="link"
                    type="button"
                    onClick={handleResend}
                    disabled={!canResend}
                    className="h-auto p-0 text-sm text-accent font-medium"
                  >
                    <RefreshCw
                      className={`w-4 h-4 mr-2 ${!canResend ? "animate-none" : ""}`}
                    />
                    {canResend ? "Resend Code" : `Resend in ${resendTimer}s`}
                  </Button>
                </div>
              </div>
            </form>
          </Form>

          <p className="mt-12 text-center text-sm text-muted-foreground italic">
            Didn't receive the code? Check your spam folder or contact support.
          </p>
        </div>
      </div>
    </div>
  );
}
