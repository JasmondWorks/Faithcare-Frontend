import { useLayout } from "../contexts/LayoutContext";
import { useEffect, useState } from "react";
import {
  Plus,
  Upload,
  Users,
  Send,
  MessageCircle,
  Phone,
  Trash2,
  Loader2,
} from "lucide-react";
import { Badge } from "./ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCommunities, createCommunity, deleteCommunity } from "@/api/organization";
import { useAuth } from "../providers/AuthProvider";
import { toast } from "react-hot-toast";
import { useSearch } from "../contexts/SearchContext";
import { Button } from "@/components/ui/button";
import { Card } from "./ui/card";
import { cn } from "@/lib/utils";

interface CommunityMember {
  id: string | number;
  name: string;
  phone: string;
  email: string;
  joinDate: string;
}

interface Community {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  members: CommunityMember[];
  createdDate: string;
  profileImage?: string;
}

export function Communities() {
  const { setHeader } = useLayout();
  useEffect(() => {
    setHeader("Communities", "Manage your church groups and fellowships");
  }, []);

  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { searchTerm } = useSearch();
  const organizationId = user?.id || "";

  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(
    null,
  );
  const [showNewCommunityForm, setShowNewCommunityForm] = useState(false);
  const [showFollowUpMenu, setShowFollowUpMenu] = useState<
    string | number | null
  >(null);
  const [newCommunity, setNewCommunity] = useState({
    name: "",
    description: "",
  });

  // Query communities
  const { data: communitiesResponse, isLoading } = useQuery({
    queryKey: ["communities", organizationId],
    queryFn: () => getCommunities(organizationId),
    enabled: !!organizationId,
  });

  const _cr = (communitiesResponse?.data || []) as any;
  const communitiesData = Array.isArray(_cr) ? _cr : Array.isArray(_cr?.data) ? _cr.data : [];

  const communities: Community[] = communitiesData.map((c: any) => ({
    id: c.id || c._id,
    name: c.name,
    description: c.description || "No description provided",
    memberCount: c.members?.length || 0,
    members: (c.members || []).map((m: any) => ({
      id: m.id || m._id,
      name: m.fullName || m.name || "Unknown",
      phone: m.phoneNumber || "N/A",
      email: m.email || "N/A",
      joinDate: m.createdAt?.split("T")[0] || "N/A",
    })),
    profileImage: c.profileImage,
    createdDate: c.createdAt?.split("T")[0] || "N/A",
  }));

  // Client-side filtering based on global search term
  const filteredCommunities = communities.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Mutations
  const createMutation = useMutation({
    mutationFn: (payload: any) => createCommunity(organizationId, payload),
    onSuccess: () => {
      toast.success("Community created!");
      queryClient.invalidateQueries({ queryKey: ["communities"] });
      setShowNewCommunityForm(false);
      setNewCommunity({ name: "", description: "" });
    },
    onError: (error: any) =>
      toast.error(error.message || "Failed to create community"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCommunity(organizationId, id),
    onSuccess: () => {
      toast.success("Community deleted");
      queryClient.invalidateQueries({ queryKey: ["communities"] });
      setSelectedCommunity(null);
    },
    onError: (error: any) => toast.error(error.message || "Failed to delete"),
  });

  const handleCreateCommunity = () => {
    if (newCommunity.name.trim()) {
      createMutation.mutate({
        name: newCommunity.name,
        description: newCommunity.description,
        organizationId: organizationId,
      });
    }
  };

  const handleFileUpload = (
    communityId: string,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      toast.promise(
        new Promise((resolve) => setTimeout(resolve, 1500)), // Mock upload
        {
          loading: "Importing members...",
          success: "Members imported successfully!",
          error: "Import failed.",
        },
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
            <Users className="w-5 h-5 text-accent" />
            {searchTerm ? `Results for "${searchTerm}"` : "Active Groups"}
          </h2>
          <Button
            onClick={() => setShowNewCommunityForm(true)}
            size="sm"
            className="w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Community
          </Button>
        </div>

        {showNewCommunityForm && (
          <Card className="p-5 sm:p-8 shadow-md animate-in slide-in-from-top-4 duration-300">
            <h3 className="text-base sm:text-lg font-bold text-foreground mb-4">
              Create New Fellowship Group
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground uppercase tracking-wider ml-1 font-bold">
                  Group Name
                </label>
                <input
                  type="text"
                  value={newCommunity.name}
                  onChange={(e) =>
                    setNewCommunity({ ...newCommunity, name: e.target.value })
                  }
                  placeholder="e.g., Young Adults Fellowship"
                  className="w-full px-3 py-2.5 bg-secondary/30 border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary outline-none transition-all text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground uppercase tracking-wider ml-1 font-bold">
                  Description
                </label>
                <input
                  type="text"
                  value={newCommunity.description}
                  onChange={(e) =>
                    setNewCommunity({
                      ...newCommunity,
                      description: e.target.value,
                    })
                  }
                  placeholder="e.g., Connect with believers aged 18-35"
                  className="w-full px-3 py-2.5 bg-secondary/30 border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary outline-none transition-all text-sm"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleCreateCommunity}
                disabled={createMutation.isPending}
                isLoading={createMutation.isPending}
                size="sm"
                className="px-5 shadow-lg shadow-primary/20"
              >
                Save Fellowship
              </Button>
              <Button
                onClick={() => setShowNewCommunityForm(false)}
                variant="secondary"
                size="sm"
                className="px-5"
              >
                Cancel
              </Button>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCommunities.length === 0 ? (
            <Card
              variant="ghost"
              padding="xl"
              className="col-span-full flex flex-col items-center justify-center space-y-4"
            >
              <Users className="w-12 h-12 text-muted-foreground/30" />
              <p className="text-muted-foreground italic text-center">
                {searchTerm
                  ? `No groups found matching"${searchTerm}"`
                  : "No communities set up yet."}
              </p>
              {!searchTerm && (
                <Button
                  variant="link"
                  onClick={() => setShowNewCommunityForm(true)}
                  className="p-0 h-auto font-bold"
                >
                  Create your first group
                </Button>
              )}
            </Card>
          ) : (
            filteredCommunities.map((community) => (
              <Card
                key={community.id}
                padding="none"
                onClick={() => setSelectedCommunity(community)}
                className={cn(
                  "group relative transition-all cursor-pointer",
                  selectedCommunity?.id === community.id
                    ? "border-accent ring-2 ring-accent/20 bg-accent/5 shadow-xl"
                    : "hover:border-accent hover:shadow-2xl shadow-sm",
                )}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center overflow-hidden border border-accent/20 transition-transform group-hover:scale-110">
                      {community.profileImage ? (
                        <img
                          src={community.profileImage}
                          alt={community.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Users className="w-7 h-7 text-accent" />
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete"${community.name}" group?`))
                          deleteMutation.mutate(community.id);
                      }}
                      className="text-muted-foreground hover:bg-red-50 hover:text-red-500 opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-accent transition-colors">
                    {community.name}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px] mb-6 leading-relaxed">
                    {community.description}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="bg-primary/5 text-primary border-primary/20 font-bold px-2.5 py-0.5"
                      >
                        {community.memberCount} Members
                      </Badge>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider bg-muted/50 p-1 px-2 rounded-md">
                      Since {community.createdDate}
                    </span>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {selectedCommunity && (
          <Card padding="none" className="overflow-hidden shadow-2xl animate-in slide-in-from-bottom-5 duration-500">
            <div className="bg-gradient-to-r from-accent/10 via-accent/5 to-transparent p-5 sm:p-8 border-b border-border">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg sm:text-2xl font-bold text-foreground mb-1">
                    {selectedCommunity.name}
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
                    {selectedCommunity.description}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    asChild
                    className="cursor-pointer shadow-lg shadow-accent/20"
                    variant="default"
                    size="sm"
                  >
                    <label>
                      <Upload className="w-4 h-4 mr-2" />
                      Import Members
                      <input
                        type="file"
                        accept=".xlsx,.csv"
                        onChange={(e) =>
                          handleFileUpload(selectedCommunity.id, e)
                        }
                        className="hidden"
                      />
                    </label>
                  </Button>
                  <Button
                    onClick={() => setSelectedCommunity(null)}
                    variant="secondary"
                    size="sm"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-0 overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-8 py-5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Member
                    </th>
                    <th className="px-8 py-5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Joined
                    </th>
                    <th className="px-8 py-5 text-right text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Follow Up
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {selectedCommunity.members.length > 0 ? (
                    selectedCommunity.members.map((member) => (
                      <tr
                        key={member.id}
                        className="hover:bg-muted/30 transition-colors group"
                      >
                        <td className="px-8 py-5">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-foreground">
                              {member.name}
                            </span>
                            <span className="text-xs text-muted-foreground font-medium">
                              {member.phone} • {member.email}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className="text-xs text-muted-foreground font-bold">
                            {member.joinDate}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-right relative">
                          <Button
                            onClick={() =>
                              setShowFollowUpMenu(
                                showFollowUpMenu === member.id
                                  ? null
                                  : member.id,
                              )
                            }
                            size="sm"
                            className="shadow-md shadow-primary/10"
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Message
                          </Button>

                          {showFollowUpMenu === member.id && (
                            <div className="absolute right-8 mt-2 w-64 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden py-2 animate-in zoom-in-95 duration-200">
                              <Button
                                variant="ghost"
                                onClick={() => {
                                  toast.success("SMS Sent!");
                                  setShowFollowUpMenu(null);
                                }}
                                className="w-full justify-start gap-3 px-5 py-3 text-sm transition-colors"
                              >
                                <MessageCircle className="w-4 h-4 text-green-500" />{" "}
                                Send SMS
                              </Button>
                              <Button
                                variant="ghost"
                                onClick={() => {
                                  toast.success("WhatsApp Sent!");
                                  setShowFollowUpMenu(null);
                                }}
                                className="w-full justify-start gap-3 px-5 py-3 text-sm transition-colors"
                              >
                                <Phone className="w-4 h-4 text-green-600" />{" "}
                                WhatsApp
                              </Button>
                              <Button
                                variant="ghost"
                                onClick={() => {
                                  toast.success("Call Initiated!");
                                  setShowFollowUpMenu(null);
                                }}
                                className="w-full justify-start gap-3 px-5 py-3 text-sm transition-colors"
                              >
                                <Phone className="w-4 h-4 text-blue-500" /> Make
                                Call
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-8 py-20 text-center text-muted-foreground italic"
                      >
                        The"{selectedCommunity.name}" group has no members yet.
                        Use the import button to add believers from your
                        Excel/CSV records.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
