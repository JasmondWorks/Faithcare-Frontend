import { useState } from "react";
import {
  LayoutDashboard,
  UserPlus,
  Heart,
  CheckCircle,
  BookOpen,
  Sparkles,
  Timer,
  Settings,
  Award,
  UserCheck,
  Users,
  X,
  LogOut,
  Send,
  FileText,
  Brain,
  ChevronDown,
  History,
  Bookmark,
  ListChecks,
  BarChart2,
  PlusCircle,
  Dumbbell,
  Library,
} from "lucide-react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useLayout } from "../contexts/LayoutContext";
import { useAuth } from "../providers/AuthProvider";
import Logo from "./Logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarProps {
  userType: "individual" | "organization";
}

// ── Flat nav item ─────────────────────────────────────────────────────────────

interface FlatItem {
  kind: "flat";
  id: string;
  label: string;
  icon: React.ElementType;
}

// ── Collapsible group ─────────────────────────────────────────────────────────

interface SubItem {
  to: string;
  label: string;
  icon: React.ElementType;
}

interface GroupItem {
  kind: "group";
  id: string;
  label: string;
  icon: React.ElementType;
  basePath: string;
  children: SubItem[];
}

type NavItem = FlatItem | GroupItem;

// ── Individual nav definition ─────────────────────────────────────────────────

const individualNav: NavItem[] = [
  { kind: "flat", id: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { kind: "flat", id: "/sunday-journal", label: "Sunday Journal", icon: BookOpen },
  {
    kind: "group",
    id: "scripture",
    label: "Scripture",
    icon: Sparkles,
    basePath: "/scripture",
    children: [
      { to: "/scripture", label: "Today", icon: Sparkles },
      { to: "/scripture/read", label: "Read Bible", icon: BookOpen },
      { to: "/scripture/plans", label: "Reading Plans", icon: ListChecks },
      { to: "/scripture/bookmarks", label: "Bookmarks", icon: Bookmark },
      { to: "/scripture/history", label: "History", icon: History },
    ],
  },
  // {
  //   kind: "group",
  //   id: "memorization",
  //   label: "Memorization",
  //   icon: Brain,
  //   basePath: "/memorization",
  //   children: [
  //     { to: "/memorization", label: "Dashboard", icon: LayoutDashboard },
  //     { to: "/memorization/practice", label: "Practice", icon: Dumbbell },
  //     { to: "/memorization/collections", label: "Collections", icon: Library },
  //     { to: "/memorization/add", label: "Add Verse", icon: PlusCircle },
  //     { to: "/memorization/progress", label: "Progress", icon: BarChart2 },
  //   ],
  // },
  { kind: "flat", id: "/focus-timer", label: "Focus Timer", icon: Timer },
  { kind: "flat", id: "/settings", label: "Settings", icon: Settings },
];

// ── Organization nav definition ───────────────────────────────────────────────

const organizationNav: NavItem[] = [
  { kind: "flat", id: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { kind: "flat", id: "/first-timers", label: "First Timers", icon: UserPlus },
  { kind: "flat", id: "/second-timers", label: "Second Timers", icon: UserCheck },
  { kind: "flat", id: "/salvation-records", label: "Salvation Records", icon: Award },
  { kind: "flat", id: "/communities", label: "Communities", icon: Users },
  { kind: "flat", id: "/prayer-requests", label: "Prayer Requests", icon: Heart },
  { kind: "flat", id: "/follow-ups", label: "Follow Ups", icon: CheckCircle },
  { kind: "flat", id: "/bulk-messaging", label: "Bulk Messaging", icon: Send },
  { kind: "flat", id: "/message-templates", label: "Message Templates", icon: FileText },
  { kind: "flat", id: "/settings", label: "Settings", icon: Settings },
];

// ── Group nav item component ──────────────────────────────────────────────────

function NavGroup({
  item,
  onNavigate,
}: {
  item: GroupItem;
  onNavigate: () => void;
}) {
  const { pathname } = useLocation();
  const isActive = pathname.startsWith(item.basePath);
  const [open, setOpen] = useState(isActive);
  const Icon = item.icon;

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 text-left",
          isActive
            ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
      >
        <Icon className="w-5 h-5 shrink-0" />
        <span className="flex-1">{item.label}</span>
        <ChevronDown
          className={cn(
            "w-4 h-4 shrink-0 transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="mt-1 ml-4 pl-4 border-l border-border/60 space-y-0.5">
          {item.children.map((child) => {
            const ChildIcon = child.icon;
            const isExact = child.to === item.basePath;
            const childActive = isExact
              ? pathname === child.to
              : pathname.startsWith(child.to);

            return (
              <NavLink
                key={child.to}
                to={child.to}
                end={isExact}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150",
                  childActive
                    ? "bg-accent/15 text-accent font-semibold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <ChildIcon className="w-4 h-4 shrink-0" />
                {child.label}
              </NavLink>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

export function Sidebar({ userType }: SidebarProps) {
  const { closeSidebar } = useLayout();
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const navItems = userType === "individual" ? individualNav : organizationNav;

  const userName =
    user?.name || (userType === "individual" ? "User" : "Admin");
  const userEmail = user?.email || "";
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <aside className="w-full bg-card flex flex-col h-full border-r border-border/50">
      {/* Logo & Close Button */}
      <div className="p-4 px-6 flex items-center justify-between">
        <div>
          <Logo target="dashboard" className="mb-2!" />
          <p className="text-xs text-muted-foreground mt-1 font-medium">
            {userType === "individual" ? "Personal Growth" : "Church Management"}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={closeSidebar}
          className="lg:hidden text-muted-foreground"
          aria-label="Close Menu"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          if (item.kind === "group") {
            return (
              <NavGroup key={item.id} item={item} onNavigate={closeSidebar} />
            );
          }

          const Icon = item.icon;
          const isActive =
            item.id === "/dashboard"
              ? pathname === item.id
              : pathname.startsWith(item.id);

          return (
            <Link
              key={item.id}
              to={item.id}
              onClick={closeSidebar}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 mt-auto space-y-2">
        <div className="flex items-center gap-3 px-4 py-3 bg-muted/40 rounded-lg group transition-all hover:bg-muted/60 border border-transparent hover:border-neutral-200">
          <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-bold shadow-inner">
            {userInitial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground font-bold truncate leading-tight">{userName}</p>
            <p className="text-[11px] text-muted-foreground truncate">{userEmail}</p>
          </div>
        </div>

        <Button
          variant="ghost"
          onClick={logout}
          className="w-full justify-start gap-3 px-4 py-2.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </Button>
      </div>
    </aside>
  );
}
