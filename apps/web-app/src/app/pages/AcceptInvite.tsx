import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Loader2, AlertTriangle, CheckCircle2, Sparkles } from "lucide-react";
import { verifyInviteToken } from "@/api/auth/auth";
import { SetPasswordForm } from "../components/SetPasswordForm";
import Logo from "../components/Logo";
import { Button } from "@/components/ui/button";

// ── Page-level state as a discriminated union ──────────────────────────────

type PageState =
  | { status: "verifying" }
  | { status: "invalid"; message: string }
  | { status: "ready"; name: string; email: string; orgName: string }
  | { status: "done"; name: string; email: string };

export default function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [state, setState] = useState<PageState>({ status: "verifying" });

  useEffect(() => {
    if (!token) {
      setState({ status: "invalid", message: "No invite token found in the link. Please use the original link from your email." });
      return;
    }

    verifyInviteToken({ token }).then((result) => {
      if (result.success && result.data) {
        const { name, email, orgName } = result.data;
        setState({ status: "ready", name, email, orgName });
      } else {
        setState({
          status: "invalid",
          message: result.error || "This invite link is invalid or has already been used.",
        });
      }
    });
  }, [token]);

  const handleSuccess = () => {
    if (state.status === "ready") {
      setState({ status: "done", name: state.name, email: state.email });
    }
  };

  return (
    <div className="min-h-screen bg-background flex font-sans">

      {/* ── Left: Form panel ──────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Logo />

          {/* Verifying */}
          {state.status === "verifying" && (
            <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
              <Loader2 className="w-10 h-10 animate-spin text-accent" />
              <div>
                <p className="font-semibold text-foreground">Verifying your invite…</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Just a moment while we validate your link.
                </p>
              </div>
            </div>
          )}

          {/* Invalid / expired */}
          {state.status === "invalid" && (
            <div className="py-8">
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-5">
                  <AlertTriangle className="w-8 h-8 text-destructive" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2 tracking-tight">
                  Invite link invalid
                </h2>
                <p className="text-muted-foreground leading-relaxed max-w-sm">
                  {state.message}
                </p>
              </div>
              <Button asChild className="w-full rounded-2xl shadow-xl shadow-primary/20">
                <Link to="/sign-in">Go to Sign In</Link>
              </Button>
            </div>
          )}

          {/* Set password form */}
          {state.status === "ready" && (
            <SetPasswordForm
              token={token}
              name={state.name}
              email={state.email}
              orgName={state.orgName}
              onSuccess={handleSuccess}
            />
          )}

          {/* Success */}
          {state.status === "done" && (
            <div className="py-8">
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-success/10 border border-success/20 flex items-center justify-center mb-5">
                  <CheckCircle2 className="w-8 h-8 text-success" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2 tracking-tight">
                  Account activated!
                </h2>
                <p className="text-muted-foreground leading-relaxed max-w-sm">
                  Your FaithCare admin account for{" "}
                  <span className="font-medium text-foreground">{state.email}</span>{" "}
                  is ready. Sign in to get started.
                </p>
              </div>
              <Button asChild className="w-full rounded-2xl shadow-xl shadow-primary/20">
                <Link to="/sign-in">Sign In to FaithCare</Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ── Right: Branded hero ───────────────────────────────────────── */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-accent/10 to-accent/5 items-center justify-center p-16">
        <div className="max-w-lg">
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-8 border border-accent/20 shadow-xl shadow-accent/5">
            <Sparkles className="w-8 h-8 text-accent" />
          </div>
          <h2 className="text-4xl font-bold text-foreground mb-6 tracking-tight">
            You're joining a community of faith
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed mb-10 opacity-80">
            FaithCare gives your ministry the tools to track members, manage
            follow-ups, and build deeper connections — all in one place.
          </p>
          <div className="space-y-6">
            {[
              {
                title: "Member Care at Scale",
                desc: "Track first timers, prayer requests, and follow-ups without dropping a single name.",
              },
              {
                title: "Real-Time Insights",
                desc: "Know who's engaged, who needs attention, and where your congregation is growing.",
              },
              {
                title: "Built for Admins",
                desc: "A purpose-built dashboard so your team can focus on people, not paperwork.",
              },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mt-1 bg-success/10 border border-success/20 shadow-inner shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-success" />
                </div>
                <div>
                  <p className="text-foreground font-bold text-lg">{item.title}</p>
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
