import { useLayout } from "../contexts/LayoutContext";
import { useState, useEffect } from "react";
import { User, Bell, Lock, Palette, Globe, LogOut, ArrowRight } from "lucide-react";
import { useAuth } from "../providers/AuthProvider";
import { Card } from "../components/ui/card";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { InviteAdmin } from "../components/InviteAdmin";

export function Settings() {
  const { setHeader } = useLayout();
  const navigate = useNavigate();
  useEffect(() => {
    setHeader("Settings", "Manage your account and preferences");
  }, []);

  const { user, logout, userType } = useAuth();
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light",
  );

  // Sync theme with document class
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const userName = user?.name || `${userType} User`;
  const userEmail = user?.email || "faithcare";

  return (
    <div className="space-y-6">
      {/* Profile Settings */}
      <Card className="p-5 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-accent" />
            <h3 className="text-lg font-bold text-foreground">Profile Settings</h3>
          </div>
          <Button
            onClick={logout}
            variant="ghost"
            size="sm"
            className="text-destructive hover:bg-destructive/10 border border-destructive/20 sm:border-transparent"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block uppercase tracking-wider">
              Full Name
            </label>
            <input
              type="text"
              defaultValue={userName}
              className="w-full px-4 py-3 bg-muted/30 border-2 border-transparent focus:border-accent rounded-xl outline-none transition-all text-foreground"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-2 block uppercase tracking-wider">
              Email Address
            </label>
            <input
              type="email"
              defaultValue={userEmail}
              className="w-full px-4 py-3 bg-muted/30 border-2 border-transparent focus:border-accent rounded-xl outline-none transition-all text-foreground"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-2 block uppercase tracking-wider">
              Account Type
            </label>
            <input
              type="text"
              defaultValue={userType?.toUpperCase()}
              readOnly
              disabled
              className="w-full px-4 py-3 bg-muted/10 border-2 border-transparent rounded-xl text-muted-foreground cursor-not-allowed"
            />
          </div>
        </div>
      </Card>

      {/* Appearance Settings */}
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <Palette className="w-5 h-5 text-accent" />
          <h3 className="text-foreground font-bold">Appearance</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block uppercase tracking-wider">
              Theme Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Button
                onClick={() => setTheme("light")}
                variant={theme === "light" ? "default" : "outline"}
                className={`flex items-center justify-center gap-2 p-3 sm:p-4 h-auto rounded-xl border-2 transition-all text-sm sm:text-base ${theme === "light"
                  ? "border-accent bg-accent/5 text-accent"
                  : "border-border hover:border-accent/40 text-muted-foreground"
                  }`}
              >
                <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
                Light Mode
              </Button>
              <Button
                onClick={() => setTheme("dark")}
                variant={theme === "dark" ? "default" : "outline"}
                className={`flex items-center justify-center gap-2 p-3 sm:p-4 h-auto rounded-xl border-2 transition-all text-sm sm:text-base ${theme === "dark"
                  ? "border-accent bg-accent/5 text-accent"
                  : "border-border hover:border-accent/40 text-muted-foreground"
                  }`}
              >
                <Palette className="w-4 h-4 sm:w-5 sm:h-5" />
                Dark Mode
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Notification Settings */}
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-5 h-5 text-accent" />
          <h3 className="text-foreground font-bold">Notifications</h3>
        </div>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-foreground">Push Notifications</p>
              <p className="text-sm text-muted-foreground">
                Receive real-time updates about your activities
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-foreground">Email Digest</p>
              <p className="text-sm text-muted-foreground">
                Weekly summary of your spiritual growth progress
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
            </label>
          </div>
        </div>
      </Card>

      {/* Organization Admin Invite - Only for Organization Users */}
      {userType === "organization" && <InviteAdmin />}

      {/* Security Settings */}
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <Lock className="w-5 h-5 text-accent" />
          <h3 className="text-foreground font-bold">Security</h3>
        </div>
        <div className="space-y-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/settings/change-password")}
            className="w-full h-auto px-6 py-4 bg-muted/30 border-2 border-transparent hover:border-accent/40 rounded-xl transition-all text-left text-foreground flex items-center justify-between group font-normal"
          >
            Change Password
            <div className="w-8 h-8 rounded-lg bg-card flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-border">
              <ArrowRight className="w-4 h-4 text-accent" />
            </div>
          </Button>
          <Button
            variant="ghost"
            className="w-full h-auto px-6 py-4 bg-muted/30 border-2 border-transparent hover:border-accent/40 rounded-xl transition-all text-left text-foreground flex items-center justify-between group font-normal"
          >
            Two-Factor Authentication
            <span className="px-3 py-1 bg-warning/10 text-warning text-[10px] uppercase rounded-full">
              Recommended
            </span>
          </Button>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-center sm:justify-end pt-4 pb-8">
        <Button className="w-full sm:w-auto px-10 sm:px-12 h-auto py-3 sm:py-4 rounded-2xl shadow-xl shadow-primary/20 font-bold">
          Save All Changes
        </Button>
      </div>
    </div>
  );
}
