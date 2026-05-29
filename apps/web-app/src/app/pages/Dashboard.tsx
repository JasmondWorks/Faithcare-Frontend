import { OrganizationDashboard } from "../components/OrganizationDashboard";
import { IndividualDashboard } from "../components/IndividualDashboard";
import { useAuth } from "../providers/AuthProvider";

export default function Dashboard() {
  const { user } = useAuth();
  // Determine if it's an organization based on the user object
  // (e.g., if they have an organizationId or a specific role)
  const isOrganization =
    user?.organizationId ||
    user?.role === "ADMIN" ||
    user?.role === "ORGANIZATION";

  return (
    <div>
      {isOrganization ? <OrganizationDashboard /> : <IndividualDashboard />}
    </div>
  );
}
