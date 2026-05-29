import { useState } from "react";
import { Loader2, Lock } from "lucide-react";
import { toast } from "react-hot-toast";
import { changePassword } from "@/api/auth";
import ErrorMessage from "./ui/error-message";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "./ui/form";
import { InputField } from "./ui/InputField";
import { Button } from "@/components/ui/button";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters long."),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match.",
    path: ["confirmPassword"],
  });

type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

export function ChangePasswordForm({ onSuccess }: { onSuccess?: () => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const form = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ChangePasswordValues) => {
    setErrorMsg("");
    setIsLoading(true);
    
    const res = await changePassword({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
    
    setIsLoading(false);

    if (res.success) {
      toast.success("Password changed successfully!");
      form.reset();
      if (onSuccess) onSuccess();
    } else {
      setErrorMsg(res.error || "Failed to change password.");
      toast.error(res.error || "Failed to change password.");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {errorMsg && <ErrorMessage message={errorMsg} />}
        
        <div className="space-y-4">
          <InputField
            control={form.control}
            name="currentPassword"
            label="Current Password"
            placeholder="Enter current password"
            type="password"
            icon={<Lock className="w-5 h-5" />}
          />

          <InputField
            control={form.control}
            name="newPassword"
            label="New Password"
            placeholder="Create new password"
            type="password"
            icon={<Lock className="w-5 h-5" />}
          />

          <InputField
            control={form.control}
            name="confirmPassword"
            label="Confirm New Password"
            placeholder="Confirm new password"
            type="password"
            icon={<Lock className="w-5 h-5" />}
          />
        </div>

        <Button
          type="submit"
          isLoading={isLoading}
          disabled={!form.formState.isValid}
          className="w-full shadow-xl shadow-primary/20"
        >
          {isLoading ? "Changing Password..." : "Change Password"}
        </Button>
      </form>
    </Form>
  );
}
