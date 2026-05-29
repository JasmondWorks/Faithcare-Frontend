import { Sparkles, Building2, User, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "../components/Logo";

export function SignUpChoice() {
  return (
    <div>
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <div className="w-full max-w-5xl">
          {/* Logo & Header */}
          <div className="text-center mb-12">
            <Logo alignment="center" />
            <h2 className="text-foreground mb-3 text-3xl">
              How will you use FaithCare?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Choose the account type that best fits your needs. You can always
              upgrade or change later.
            </p>
          </div>
          {/* Choice Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Individual Card */}
            <Link
              to="/sign-up-individual"
              className="bg-card rounded-xl p-8 border border-neutral-300 hover:border-accent transition-all text-left group hover:shadow-lg relative"
            >
              <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-colors">
                <User className="w-7 h-7 text-accent" />
              </div>
              <h3 className="text-foreground mb-3 flex items-center justify-between">
                Individual
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
              </h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Perfect for personal spiritual growth and productivity
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center mt-0.5"
                    style={{ backgroundColor: "#22c55e20" }}
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: "#22c55e" }}
                    ></div>
                  </div>
                  <p className="text-sm text-foreground">
                    Daily scripture & devotionals
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center mt-0.5"
                    style={{ backgroundColor: "#22c55e20" }}
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: "#22c55e" }}
                    ></div>
                  </div>
                  <p className="text-sm text-foreground">
                    Sunday message journaling
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center mt-0.5"
                    style={{ backgroundColor: "#22c55e20" }}
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: "#22c55e" }}
                    ></div>
                  </div>
                  <p className="text-sm text-foreground">
                    Focus timer for productivity
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center mt-0.5"
                    style={{ backgroundColor: "#22c55e20" }}
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: "#22c55e" }}
                    ></div>
                  </div>
                  <p className="text-sm text-foreground">
                    Personal growth tracking
                  </p>
                </div>
              </div>
              <TrialInfoBadge text="Free forever" />
              {/* <div className="mt-6 pt-6 border-t border-border">
                <p className="text-sm text-accent">Free forever</p>
              </div> */}
            </Link>
            {/* Organization Card */}
            <Link
              to="/sign-up-organization"
              className="bg-card rounded-xl p-8 border border-neutral-300 hover:border-accent transition-all text-left group hover:shadow-lg relative"
            >
              <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-colors">
                <Building2 className="w-7 h-7 text-accent" />
              </div>
              <h3 className="text-foreground mb-3 flex items-center justify-between">
                Church / Organization
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
              </h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Complete member care and church management platform
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center mt-0.5"
                    style={{ backgroundColor: "#22c55e20" }}
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: "#22c55e" }}
                    ></div>
                  </div>
                  <p className="text-sm text-foreground">
                    First timer management
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center mt-0.5"
                    style={{ backgroundColor: "#22c55e20" }}
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: "#22c55e" }}
                    ></div>
                  </div>
                  <p className="text-sm text-foreground">
                    Prayer request tracking
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center mt-0.5"
                    style={{ backgroundColor: "#22c55e20" }}
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: "#22c55e" }}
                    ></div>
                  </div>
                  <p className="text-sm text-foreground">
                    Follow-up automation
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center mt-0.5"
                    style={{ backgroundColor: "#22c55e20" }}
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: "#22c55e" }}
                    ></div>
                  </div>
                  <p className="text-sm text-foreground">
                    Team collaboration tools
                  </p>
                </div>
              </div>
              <TrialInfoBadge text="14-day free trial" />
              {/* <div className="mt-6 pt-6 border-t border-border">
                <p className="text-sm text-accent">14-day free trial</p>
              </div> */}
            </Link>
          </div>
          {/* Back to Sign In */}
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

function TrialInfoBadge({ text }: { text: string }) {
  return (
    <span className="rounded-full px-2 py-1 font-semibold text-accent bg-white absolute -right-3 -top-3 text-sm border border-accent/40">
      {text}
    </span>
  );
}
