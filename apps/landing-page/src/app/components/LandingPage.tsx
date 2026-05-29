import {
  Users,
  MessageSquare,
  ArrowRight,
  Smartphone,
  Clock,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  SparklesIcon,
} from "lucide-react";
import { Navbar } from "./Navbar";

const webAppUrl = process.env.NEXT_PUBLIC_WEB_APP_URL ?? "";

export function LandingPage() {
  return (
    <>
      <style>
        {`
          :root {
            --ease-out: cubic-bezier(0, 0, 0.2, 1);
            --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
          }

          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(24px); }
            to { opacity: 1; transform: translateY(0); }
          }

          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
            100% { transform: translateY(0px); }
          }

          .animate-fade-up {
            animation: fadeUp 0.6s var(--ease-out) both;
          }
          .animate-float {
            animation: float 6s ease-in-out infinite;
          }

          .delay-100 { animation-delay: 100ms; }
          .delay-200 { animation-delay: 200ms; }
          .delay-300 { animation-delay: 300ms; }
          .delay-400 { animation-delay: 400ms; }
          .delay-500 { animation-delay: 500ms; }

          .shadow-card {
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04), 0 8px 24px rgba(0, 0, 0, 0.04);
          }
          .shadow-premium {
            box-shadow: 0 1px 1px rgba(0, 0, 0, 0.04), 0 4px 8px rgba(0, 0, 0, 0.04), 0 16px 32px rgba(0, 0, 0, 0.04);
          }
          .shadow-glow {
            box-shadow: 0 0 20px rgba(212, 165, 116, 0.25), 0 0 60px rgba(212, 165, 116, 0.1);
          }

          .transition-spring {
            transition: all 0.4s var(--ease-spring);
          }

          .bg-grid-subtle {
            background-image:
              linear-gradient(rgba(150, 150, 150, 0.06) 1px, transparent 1px),
              linear-gradient(90deg, rgba(150, 150, 150, 0.06) 1px, transparent 1px);
            background-size: 32px 32px;
          }

          .grain-overlay::after {
            content: "";
            position: absolute;
            inset: 0;
            pointer-events: none;
            opacity: 0.03;
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
            background-size: 256px 256px;
            z-index: 10;
          }
        `}
      </style>

      <div className="bg-background font-sans selection:bg-accent/20 relative overflow-hidden grain-overlay">
        {/* Navigation */}

        <Navbar />

        <main className="pt-16">
          {/* Hero */}
          <section className="relative flex items-center py-16 overflow-hidden bg-grid-subtle">
            <div className="absolute top-0 right-0 -mr-32 -mt-32 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-6xl mx-auto px-6 w-full relative z-10">
              <div className="grid lg:grid-cols-[3fr_1.7fr] gap-8 gap-x-20 items-center">
                {/* Left: Copy */}
                <div className="flex flex-col justify-center text-left">
                  <div className="animate-fade-up flex items-center gap-2 mb-6">
                    <span className="px-3 py-1 bg-accent/10 text-[hsl(31,53%,40%)] text-xs font-semibold uppercase tracking-widest rounded-full border border-accent/20">
                      Two Experiences. One Unified Platform.
                    </span>
                  </div>

                  <h1 className="animate-fade-up delay-100 text-5xl lg:text-6xl font-extrabold text-foreground tracking-tighter leading-tighter mb-4">
                    Structure Your Ministry.
                    <br />
                    <span className="text-accent">Deepen Your Faith.</span>
                  </h1>

                  <p className="animate-fade-up delay-200 text-base lg:text-lg text-muted-foreground max-w-prose leading-relaxed mb-8 lg:mb-10">
                    The complete ecosystem for churches to manage their
                    congregation, and for individuals to track their personal
                    spiritual growth. Choose your path.
                  </p>

                  <div className="animate-fade-up delay-300 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <a
                      href={`${webAppUrl}/sign-up-organization`}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 bg-accent px-6 py-3 rounded-lg font-bold transition-spring hover:bg-accent/90 hover:shadow-glow hover:-translate-y-0.5 active:translate-y-0 active:shadow-none border border-accent text-white"
                    >
                      Register Organization
                      <ArrowRight className="w-4 h-4" />
                    </a>
                    <a
                      href={`${webAppUrl}/sign-up-individual`}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 bg-transparent text-foreground px-6 py-3 rounded-lg font-bold transition-spring hover:-translate-y-px active:translate-y-0 border border-neutral-400 hover:bg-white"
                    >
                      Join as Individual
                    </a>
                  </div>

                  <p className="animate-fade-up delay-400 mt-6 text-sm text-muted-foreground flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                    Separate dashboards. Tailored experiences.
                  </p>
                </div>

                {/* Right: Mockup */}
                <div className="relative flex items-center animate-fade-up delay-500">
                  {/* Soft glow to ground the floating cards */}
                  <div className="absolute w-80 h-80 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

                  <div className="relative w-full flex flex-col gap-3 animate-float">
                    {/* Card 1: First Timer */}
                    <div className="bg-card border border-border rounded-2xl p-5 shadow-premium cursor-default">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center shrink-0">
                          <Users className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground leading-snug">
                            John Doe
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            First Timer • Attended Sunday
                          </p>
                        </div>
                      </div>
                      <div className="h-px w-full bg-border mb-3" />
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" /> 2 days ago
                        </span>
                        <span className="text-success font-semibold bg-success/10 px-2 py-0.5 rounded-md">
                          Follow-up Needed
                        </span>
                      </div>
                    </div>

                    {/* Card 2: Admin feedback — indented right */}
                    <div className="bg-card border border-border rounded-2xl p-5 shadow-premium ml-8 cursor-default">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                          <MessageSquare className="w-4 h-4 text-primary" />
                          Admin Feedback
                        </div>
                        <span className="text-xs text-muted-foreground">
                          10:30 AM
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        &ldquo;Hi John, it was great having you at service this
                        Sunday. Do you have any prayer requests?&rdquo;
                      </p>
                    </div>

                    {/* Card 3: WhatsApp action — indented left */}
                    <div className="bg-success text-success-foreground rounded-2xl p-4 shadow-premium flex items-center justify-between mr-8 cursor-pointer transition-spring hover:-translate-y-0.5">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4" />
                        <span className="text-xs font-semibold">
                          Send WhatsApp Template
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 opacity-70" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Problem Section */}
          <section className="py-24 lg:py-32 bg-secondary/30 border-y border-border/30 relative">
            <div className="max-w-6xl mx-auto px-6 relative z-10">
              <div className="max-w-2xl mx-auto mb-16 text-center">
                <h2 className="text-[2rem] lg:text-[2.75rem] font-bold text-foreground tracking-tight leading-tight mb-4">
                  The Chaos of Manual Tracking
                </h2>
                <p className="text-base lg:text-lg text-muted-foreground leading-relaxed">
                  Many churches struggle to retain visitors because their
                  follow-up processes are fragmented, manual, and easily
                  forgotten.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    title: "Lost First-Timer Data",
                    desc: "Paper cards and messy spreadsheets lead to lost contact details and missed opportunities to connect with new visitors.",
                  },
                  {
                    title: "Unorganized Feedback",
                    desc: "Feedback from members gets lost in the noise. There's no clear timestamp or history of who reached out and when.",
                  },
                  {
                    title: "Delayed Follow-ups",
                    desc: "Without automated messaging and templates, reaching out to members takes too long, causing them to slip through the cracks.",
                  },
                ].map((problem, i) => (
                  <div
                    key={i}
                    className="bg-card p-8 rounded-2xl border border-border transition-spring hover:-translate-y-1 hover:shadow-card"
                  >
                    <div className="w-10 h-10 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center mb-5">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-foreground leading-snug mb-2">
                      {problem.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {problem.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Admin Features */}
          <section className="py-24 lg:py-32">
            <div className="max-w-6xl mx-auto px-6">
              <div className="text-center max-w-2xl mx-auto mb-20">
                <h2 className="text-[2rem] lg:text-[2.75rem] font-bold text-foreground tracking-tight leading-tight mb-4">
                  For Organizations &amp; Admins
                </h2>
                <p className="text-base lg:text-lg text-muted-foreground leading-relaxed">
                  A comprehensive command center to track attendance, manage
                  feedback, and communicate effortlessly with your entire
                  congregation.
                </p>
              </div>

              {/* Admin Feature 1 */}
              <div className="grid lg:grid-cols-12 gap-16 items-center mb-32">
                <div className="lg:col-span-6 order-2 lg:order-1 bg-secondary rounded-3xl p-2 border border-border/50 shadow-inner overflow-hidden flex items-center justify-center max-h-[500px]">
                  <div className="w-full h-full rounded-2xl overflow-hidden border border-border/40 shadow-premium bg-background">
                    <img
                      src="/images/features/admin-dashboard.png"
                      alt="Admin Dashboard Overview"
                      className="w-full h-full object-cover object-left-top"
                    />
                  </div>
                </div>

                <div className="lg:col-span-6 order-1 lg:order-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold uppercase tracking-widest mb-5">
                    Management &amp; Feedback
                  </div>
                  <h3 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight leading-tight mb-4">
                    Track Attendances &amp; Timestamped Feedbacks
                  </h3>
                  <p className="text-base text-muted-foreground leading-relaxed mb-8">
                    Keep a centralized database of who attended, when, and their
                    visitation history. Manage feedback from first-timers
                    directly within the platform.
                  </p>
                  <ul className="space-y-5">
                    <li className="flex items-start gap-4">
                      <div className="w-9 h-9 rounded-full bg-success/10 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-5 h-5 text-success" />
                      </div>
                      <div>
                        <span className="font-semibold text-foreground block mb-1">
                          Transparent History
                        </span>
                        <span className="text-muted-foreground leading-relaxed block">
                          See messages sent by admins and responses received,
                          completely time-stamped for accountability.
                        </span>
                      </div>
                    </li>
                    <li className="flex items-start gap-4">
                      <div className="w-9 h-9 rounded-full bg-success/10 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-5 h-5 text-success" />
                      </div>
                      <div>
                        <span className="font-semibold text-foreground block mb-1">
                          Admin-Centric Model
                        </span>
                        <span className="text-muted-foreground leading-relaxed block">
                          Organizations manage members. Members don&apos;t need
                          their own login, keeping friction at absolute zero.
                        </span>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Admin Feature 2 */}
              <div className="grid lg:grid-cols-12 gap-16 items-center">
                <div className="lg:col-span-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold uppercase tracking-widest mb-5">
                    Communication
                  </div>
                  <h3 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight leading-tight mb-4">
                    WhatsApp &amp; Bulk SMS Integrations
                  </h3>
                  <p className="text-base text-muted-foreground leading-relaxed mb-8">
                    Reaching out shouldn&apos;t require switching between apps.
                    FaithCare connects your church directly to your
                    members&apos; phones.
                  </p>
                  <ul className="space-y-5">
                    <li className="flex items-start gap-4">
                      <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Smartphone className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <span className="font-semibold text-foreground block mb-1">
                          WhatsApp Integration
                        </span>
                        <span className="text-muted-foreground leading-relaxed block">
                          Redirect or text users directly from within the
                          platform using the WhatsApp API.
                        </span>
                      </div>
                    </li>
                    <li className="flex items-start gap-4">
                      <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                        <MessageSquare className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <span className="font-semibold text-foreground block mb-1">
                          Message Templates &amp; Bulk SMS
                        </span>
                        <span className="text-muted-foreground leading-relaxed block">
                          Utilize pre-saved follow-up templates or send mass SMS
                          broadcasts to the entire congregation instantly.
                        </span>
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="lg:col-span-6 bg-secondary rounded-3xl p-2 border border-border/50 shadow-inner overflow-hidden flex items-center justify-center max-h-[500px]">
                  <div className="w-full h-full rounded-2xl overflow-hidden border border-border/40 shadow-premium bg-background">
                    <img
                      src="/images/features/admin-dashboard.png"
                      alt="Admin Messaging and Bulk SMS"
                      className="w-full h-full object-cover object-left-top"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Member Features */}
          <section className="py-24 lg:py-32 bg-secondary/20 border-t border-border/30">
            <div className="max-w-6xl mx-auto px-6">
              <div className="text-center max-w-2xl mx-auto mb-20">
                <h2 className="text-[2rem] lg:text-[2.75rem] font-bold text-foreground tracking-tight leading-tight mb-4">
                  For Individual Believers
                </h2>
                <p className="text-base lg:text-lg text-muted-foreground leading-relaxed">
                  FaithCare isn&apos;t just an administration tool for churches.
                  It&apos;s a powerful, independent daily companion for
                  individuals on their spiritual journey.
                </p>
              </div>

              {/* Member Feature 1 */}
              <div className="grid lg:grid-cols-12 gap-16 items-center mb-32">
                <div className="lg:col-span-6 order-2 lg:order-1 bg-secondary rounded-3xl p-2 border border-border/50 shadow-inner overflow-hidden flex items-center justify-center max-h-[500px]">
                  <div className="w-full h-full rounded-2xl overflow-hidden border border-border/40 shadow-premium bg-background">
                    <img
                      src="/images/features/dashboard.png"
                      alt="FaithCare User Dashboard"
                      className="w-full h-full object-cover object-left-top"
                    />
                  </div>
                </div>

                <div className="lg:col-span-6 order-1 lg:order-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold uppercase tracking-widest mb-5">
                    Personal Growth
                  </div>
                  <h3 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight leading-tight mb-4">
                    Spiritual Habit Tracking
                  </h3>
                  <p className="text-base text-muted-foreground leading-relaxed mb-8">
                    Individuals can log in to a beautifully designed,
                    independent dashboard to track their streaks, monitor their
                    weekly progress, and build consistent spiritual habits.
                  </p>
                  <ul className="space-y-5">
                    <li className="flex items-start gap-4">
                      <div className="w-9 h-9 rounded-full bg-success/10 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-5 h-5 text-success" />
                      </div>
                      <div>
                        <span className="font-semibold text-foreground block mb-1">
                          Visual Progress
                        </span>
                        <span className="text-muted-foreground leading-relaxed block">
                          Easily view scriptures read, focus sessions completed,
                          and journal entries written over time.
                        </span>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Member Feature 2 */}
              <div className="grid lg:grid-cols-12 gap-16 items-center mb-32">
                <div className="lg:col-span-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold uppercase tracking-widest mb-5">
                    Daily Devotion
                  </div>
                  <h3 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight leading-tight mb-4">
                    Daily Scriptures &amp; Focus Timer
                  </h3>
                  <p className="text-base text-muted-foreground leading-relaxed mb-8">
                    Start every day with the Word. Our curated daily scriptures
                    and built-in focus timer help individuals dedicate
                    uninterrupted time to God.
                  </p>
                  <ul className="space-y-5">
                    <li className="flex items-start gap-4">
                      <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Smartphone className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <span className="font-semibold text-foreground block mb-1">
                          Weekly Focus
                        </span>
                        <span className="text-muted-foreground leading-relaxed block">
                          Follow a structured reading plan with the &ldquo;This
                          Week&apos;s Focus&rdquo; timeline to stay grounded and
                          grow consistently in your faith.
                        </span>
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="lg:col-span-6 bg-secondary rounded-3xl p-2 border border-border/50 shadow-inner overflow-hidden flex items-center justify-center max-h-[500px]">
                  <div className="w-full h-full rounded-2xl overflow-hidden border border-border/40 shadow-premium bg-background">
                    <img
                      src="/images/features/daily-scripture.png"
                      alt="Daily Scripture Feature"
                      className="w-full h-full object-cover object-left-top"
                    />
                  </div>
                </div>
              </div>

              {/* Member Feature 3 */}
              <div className="grid lg:grid-cols-12 gap-16 items-center">
                <div className="lg:col-span-6 order-2 lg:order-1 bg-secondary rounded-3xl p-2 border border-border/50 shadow-inner overflow-hidden flex items-center justify-center max-h-[500px]">
                  <div className="w-full h-full rounded-2xl overflow-hidden border border-border/40 shadow-premium bg-background">
                    <img
                      src="/images/features/sunday-journal.png"
                      alt="Sunday Journal Feature"
                      className="w-full h-full object-cover object-left-top"
                    />
                  </div>
                </div>

                <div className="lg:col-span-6 order-1 lg:order-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold uppercase tracking-widest mb-5">
                    Reflection
                  </div>
                  <h3 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight leading-tight mb-4">
                    Sunday Journal
                  </h3>
                  <p className="text-base text-muted-foreground leading-relaxed mb-8">
                    A dedicated space to reflect on Sunday&apos;s message, take
                    notes, and refer back to previous sermons. Never lose your
                    sermon notes again.
                  </p>
                  <ul className="space-y-5">
                    <li className="flex items-start gap-4">
                      <div className="w-9 h-9 rounded-full bg-success/10 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-5 h-5 text-success" />
                      </div>
                      <div>
                        <span className="font-semibold text-foreground block mb-1">
                          Organized History
                        </span>
                        <span className="text-muted-foreground leading-relaxed block">
                          Access all your previous entries in one place. Easily
                          recall what God spoke to you weeks or months ago.
                        </span>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="py-32 bg-foreground text-background relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-subtle opacity-10" />
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/20 rounded-full blur-[100px] pointer-events-none translate-x-1/2 -translate-y-1/2" />

            <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight leading-tight">
                Ready to Join FaithCare?
              </h2>
              <p className="text-lg text-background/70 mb-10 max-w-prose mx-auto leading-relaxed">
                Whether you&apos;re organizing a ministry or building your
                personal spiritual habits, FaithCare is built for you.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href={`${webAppUrl}/sign-up-organization`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-accent text-white px-8 py-4 rounded-lg text-base font-bold transition-spring hover:bg-accent/90 hover:-translate-y-0.5 hover:shadow-glow active:translate-y-0 border border-accent"
                >
                  Register Organization
                  <ArrowRight className="w-5 h-5" />
                </a>
                <a
                  href={`${webAppUrl}/sign-up-individual`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-transparent text-background px-8 py-4 rounded-lg text-base font-bold transition-spring hover:bg-background/10 hover:-translate-y-0.5 active:translate-y-0 border border-background/30"
                >
                  Join as Individual
                </a>
              </div>
            </div>
          </section>
        </main>

        <footer className="bg-background py-12 border-t border-border/40 relative z-10">
          <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm font-bold text-foreground">
                FaithCare
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} FaithCare. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Contact
              </a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

