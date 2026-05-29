import { useState } from "react";
import { Mail, UserPlus, Shield } from "lucide-react";
import { toast } from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "./ui/form";
import { InputField } from "./ui/InputField";
import { Button } from "@/components/ui/button";
import { Card } from "./ui/card";

const inviteAdminSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  role: z.string().min(1, "Please select a role"),
});

type InviteAdminValues = z.infer<typeof inviteAdminSchema>;

export function InviteAdmin() {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<InviteAdminValues>({
    resolver: zodResolver(inviteAdminSchema),
    defaultValues: {
      fullName: "",
      email: "",
      role: "",
    },
  });

  const onSubmit = async (data: InviteAdminValues) => {
    setIsLoading(true);
    try {
      // For now, we use a placeholder or the existing invite-admin endpoint
      // Note: Backend might need update to support 'role' and 'organizationId' for this invite
      const { apiRequest } = await import("@/api/helper");
      const response = await apiRequest("/auth/invite-admin", {
        method: "POST",
        body: JSON.stringify({
          fullName: data.fullName,
          email: data.email,
          organizationRole: data.role,
        }),
      });

      if (response.ok) {
        toast.success(`Invite sent to ${data.email}`);
        form.reset();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to send invite");
      }
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-5 sm:p-8">
      <div className="flex items-center gap-3 mb-6">
        <UserPlus className="w-5 h-5 text-accent" />
        <h3 className="text-lg font-bold text-foreground">Invite Administrator</h3>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              control={form.control}
              name="fullName"
              label="Full Name *"
              placeholder="e.g. John Doe"
              type="text"
              icon={<Mail className="w-5 h-5" />} // Using Mail as placeholder icon, or User
            />
            <InputField
              control={form.control}
              name="email"
              label="Email Address *"
              placeholder="e.g. admin@church.com"
              type="email"
              icon={<Mail className="w-5 h-5" />}
            />
          </div>

          <InputField
            control={form.control}
            name="role"
            label="Admin Role *"
            type="select"
            placeholder="Select a role"
            icon={<Shield className="w-5 h-5" />}
            options={[
              { value: "SENIOR_PASTOR", label: "Senior Pastor" },
              { value: "ASSOCIATE_PASTOR", label: "Associate Pastor" },
              { value: "YOUTH_PASTOR", label: "Youth Pastor" },
              { value: "WORSHIP_LEADER", label: "Worship Leader" },
              { value: "CHURCH_ADMIN", label: "Church Administrator" },
              { value: "VOLUNTEER_LEADER", label: "Volunteer Leader" },
              { value: "OTHER", label: "Other" },
            ]}
          />

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full sm:w-auto px-10 h-[52px] rounded-xl font-bold"
            >
              {isLoading ? "Sending Invite..." : "Send Invitation"}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
}
