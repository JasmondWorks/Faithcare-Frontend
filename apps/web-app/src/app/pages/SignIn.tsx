import { Mail, Lock, ArrowRight, Church } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Logo from "../components/Logo";
import ErrorMessage from "../components/ui/error-message";
import toast from "react-hot-toast";
import { Form } from "../components/ui/form";
import { InputField } from "../components/ui/InputField";
import { Button } from "@/components/ui/button";
import { login } from "@/api/auth/auth";

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});

type SignInValues = z.infer<typeof signInSchema>;

export function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { initializeSession } = useAuth();

  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: SignInValues) => {
    setIsLoading(true);
    setError(null);
    try {
      const normalizedEmail = data.email.toLowerCase();
      const result = await login({
        email: normalizedEmail,
        password: data.password,
      });
      setIsLoading(false);

      // Handle unverified email case
      if (
        result.success !== true &&
        (result.error?.toLowerCase().includes("not verified") ||
          result.error?.toLowerCase().includes("unverified"))
      ) {
        const errorMessage =
          (result.error || "Account not verified") +
          ". You are now being redirected...";
        toast.error(errorMessage, { duration: 5000 });

        // Redirect after 3 seconds to allow user to read the message
        setTimeout(() => {
          navigate("/otp-verification", { state: { email: normalizedEmail } });
        }, 3000);
        return;
      }


      const sessionData = result?.data
      if (sessionData?.accessToken) {
        const newAccessToken = sessionData.accessToken;
        const newUser = sessionData.user;

        initializeSession(newUser, newAccessToken);

        const from = location.state?.from?.pathname || "/dashboard";
        navigate(from, { replace: true });
      } else {
        setError(result.error || "Login failed");
      }
    } catch {
      setIsLoading(false);
      setError("An unexpected error occurred");
    }
  };

  return (
    <div className="min-h-screen bg-background flex font-sans">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Logo />

          <div className="mb-10">
            <h2 className="text-3xl font-bold text-foreground mb-3 tracking-tight">
              Welcome back
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Sign in to continue your spiritual growth journey
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <InputField
                control={form.control}
                name="email"
                label="Email Address"
                placeholder="you@example.com"
                type="email"
                icon={<Mail />}
              />

              <InputField
                control={form.control}
                name="password"
                label="Password"
                placeholder="Enter your password"
                type="password"
                icon={<Lock />}
              />

              <div className="flex items-center justify-between px-1">
                <InputField
                  control={form.control}
                  name="rememberMe"
                  label="Remember me"
                  type="checkbox"
                  className="space-y-0"
                />
                <Link
                  to="/forgot-password"
                  className="text-sm text-accent hover:text-accent/80 transition-all font-medium whitespace-nowrap"
                >
                  Forgot password?
                </Link>
              </div>

              {error && <ErrorMessage message={error} />}

              <Button
                isLoading={isLoading}
                type="submit"
                className="w-full shadow-xl shadow-primary/20"
              >
                {isLoading ? (
                  "Signing In..."
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>
            </form>
          </Form>

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-background text-muted-foreground uppercase tracking-widest text-[10px] font-medium">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid gap-4 mb-10">
            <Button
              variant="outline"
              type="button"
              className="w-full text-foreground font-medium"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </Button>
          </div>

          <p className="text-center text-muted-foreground">
            Don't have an account?{" "}
            <Link
              to="/sign-up-choice"
              className="text-accent hover:text-accent/80 transition-all font-medium"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Hero */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-accent/10 to-accent/5 items-center justify-center p-16">
        <div className="max-w-lg">
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-8 border border-accent/20 shadow-xl shadow-accent/5">
            <Church className="w-8 h-8 text-accent" />
          </div>
          <h2 className="text-4xl font-bold text-foreground mb-6 tracking-tight">
            Empowering spiritual growth for your community
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed mb-10 opacity-80">
            FaithCare helps churches nurture deeper connections with their
            members while providing tools for personal spiritual development.
          </p>
          <div className="space-y-6">
            <div className="flex items-start gap-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mt-1 bg-success/10 border border-success/20 shadow-inner">
                <div className="w-2.5 h-2.5 rounded-full bg-success"></div>
              </div>
              <div>
                <p className="text-foreground font-bold text-lg">
                  Member Care Management
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Track first timers, prayer requests, and follow-ups with
                  automated tools.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mt-1 bg-success/10 border border-success/20 shadow-inner">
                <div className="w-2.5 h-2.5 rounded-full bg-success"></div>
              </div>
              <div>
                <p className="text-foreground font-bold text-lg">
                  Spiritual Productivity
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Daily scripture, journaling, and focus tools designed for
                  modern believers.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mt-1 bg-success/10 border border-success/20 shadow-inner">
                <div className="w-2.5 h-2.5 rounded-full bg-success"></div>
              </div>
              <div>
                <p className="text-foreground font-bold text-lg">
                  Built for Young Professionals
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Modern, intuitive design that fits your lifestyle and elevates
                  your experience.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
