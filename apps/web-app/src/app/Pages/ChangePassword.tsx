import { useEffect } from "react";
import { useLayout } from "../contexts/LayoutContext";
import { ChangePasswordForm } from "../components/ChangePasswordForm";
import { Card } from "../components/ui/card";
import { Lock, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function ChangePassword() {
  const { setHeader } = useLayout();
  const navigate = useNavigate();

  useEffect(() => {
    setHeader("Change Password", "Update your account security credentials");
  }, [setHeader]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button
        variant="ghost"
        onClick={() => navigate("/settings")}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 p-0 h-auto font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Settings
      </Button>

      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Lock className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="text-foreground font-bold text-lg">Change Password</h3>
            <p className="text-sm text-muted-foreground">
              Ensure your account is using a long, random password to stay secure.
            </p>
          </div>
        </div>
        
        <div className="pt-2">
          <ChangePasswordForm onSuccess={() => navigate("/settings")} />
        </div>
      </Card>
    </div>
  );
}
