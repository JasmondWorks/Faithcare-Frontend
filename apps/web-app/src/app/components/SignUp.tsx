import { signUpOrg, signUpUser } from "@/api/auth/auth";
import {
  Sparkles,
  Mail,
  Lock,
  User,
  ArrowRight,
  Phone,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Logo from "./Logo";
import { Form } from "./ui/form";
import { InputField } from "./ui/InputField";
import { Button } from "@/components/ui/button";

const signUpSchema = z
  .object({
    fullName: z.string().min(2, "Full name is required"),
    email: z.string().email("Invalid email address"),
    phoneNumber: z.string().min(10, "Valid phone number is required"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[a-zA-Z]/, "Password must contain letters")
      .regex(/[0-9]/, "Password must contain numbers"),
    confirmPassword: z.string(),
    terms: z.boolean().refine((val) => val === true, {
      message: "You must agree to the terms",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignUpValues = z.infer<typeof signUpSchema>;

export function SignUp({ type }: { type: string }) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverEmailError, setServerEmailError] = useState<string | null>(null);

  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  });

  const onSubmit = async (data: SignUpValues) => {
    setIsLoading(true);
    setServerEmailError(null);
    localStorage.setItem("userType", type);

    // Normalize email to lowercase for case-insensitive uniqueness
    const normalizedEmail = data.email.toLowerCase();

    const signUpFn = type === "individual" ? signUpUser : signUpOrg;

    const res = await signUpFn({
      email: normalizedEmail,
      password: data.password,
      fullName: data.fullName,
      phone: data.phoneNumber,
    });

    setIsLoading(false);

    if (res.success) {
      localStorage.setItem("pendingEmail", normalizedEmail);
      navigate("/otp-verification", { state: { email: normalizedEmail } });
    } else {
      const errMsg = res.error || "Registration failed";
      if (
        errMsg.toLowerCase().includes("already exists") ||
        errMsg.toLowerCase().includes("already registered") ||
        errMsg.toLowerCase().includes("email is taken") ||
        errMsg.toLowerCase().includes("duplicate")
      ) {
        setServerEmailError(
          "An account with this email already exists. Please sign in instead.",
        );
      } else {
        toast.error(errMsg);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-accent/10 to-accent/5 items-center justify-center p-16">
        <div className="max-w-lg">
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-6 border border-accent/20">
            <Sparkles className="w-8 h-8" style={{ color: "#d4a574" }} />
          </div>
          <h2 className="text-foreground mb-4">
            Join thousands of churches growing together
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed mb-8">
            Start your journey with FaithCare and transform how you connect with
            your community and grow spiritually.
          </p>

          <div className="bg-white rounded-xl p-6 border border-accent/20">
            <p className="text-muted-foreground italic mb-4">
              "FaithCare has revolutionized how we care for our members. The
              combination of church management and personal spiritual tools is
              exactly what our community needed."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-accent-foreground">
                JM
              </div>
              <div>
                <p className="text-foreground text-sm">Pastor John Miller</p>
                <p className="text-xs text-muted-foreground">
                  Grace Community Church
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Logo />

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Create your account
            </h2>
            <p className="text-muted-foreground">
              Get started with FaithCare in just a few steps
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <InputField
                control={form.control}
                name="fullName"
                label="Full Name"
                placeholder="John Doe"
                icon={User}
              />

              <InputField
                control={form.control}
                name="email"
                label="Email Address"
                placeholder="you@example.com"
                type="email"
                icon={Mail}
              />

              {serverEmailError && (
                <div className="mt-2 flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <svg
                    className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <p className="text-sm text-red-500 font-bold">
                      {serverEmailError}
                    </p>
                    <Link
                      to="/sign-in"
                      className="text-xs text-accent hover:underline mt-0.5 inline-block"
                    >
                      Sign in instead →
                    </Link>
                  </div>
                </div>
              )}

              <InputField
                control={form.control}
                name="phoneNumber"
                label="Phone Number"
                placeholder="xxxxxxx"
                type="text"
                icon={Phone}
              />

              <InputField
                control={form.control}
                name="password"
                label="Password"
                placeholder="Create a strong password"
                type="password"
                icon={Lock}
                description="Must be at least 8 characters with letters and numbers"
              />

              <InputField
                control={form.control}
                name="confirmPassword"
                label="Confirm Password"
                placeholder="Re-enter your password"
                type="password"
                icon={Lock}
              />

              <div className="flex items-center gap-2">
                <InputField
                  control={form.control}
                  name="terms"
                  type="checkbox"
                  className="space-y-0"
                  label={
                    <>
                      I agree to the{" "}
                      <Button
                        variant="link"
                        type="button"
                        className="h-auto p-0 text-accent font-normal"
                      >
                        Terms of Service
                      </Button>{" "}
                      and{" "}
                      <Button
                        variant="link"
                        type="button"
                        className="h-auto p-0 text-accent font-normal"
                      >
                        Privacy Policy
                      </Button>
                    </>
                  }
                />
              </div>

            <Button
              isLoading={isLoading}
              type="submit"
              className="w-full shadow-xl shadow-primary/20 font-bold"
            >
              {isLoading ? (
                "Creating Account..."
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
            </form>
          </Form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-background text-muted-foreground">
                Or sign up with
              </span>
            </div>
          </div>

          <div className="grid gap-4 mb-10">
            <Button variant="outline" type="button" className="w-full text-foreground font-medium">
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

          {/* Sign In Link */}
          <p className="text-center text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/sign-in"
              className="text-accent hover:text-accent/80 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
