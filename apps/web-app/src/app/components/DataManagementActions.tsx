import { useState, useRef } from "react";
import {
  Plus,
  Loader2,
  ListFilter,
  CloudUpload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { bulkUploadMembers } from "@/api/organization/church";
import { useAuth } from "../providers/AuthProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import SearchBar from "./ui/search-bar";

interface DataManagementActionsProps {
  type:
  | "first-timers"
  | "second-timers"
  | "salvation-records"
  | "prayer-requests"
  | "follow-ups";
  onAddManual: () => void;
  onUploadSuccess: () => void;
  searchTerm: string;
  setSearchTerm: (searchTerm: string) => void;
  hasFilters?: boolean;
}

export function DataManagementActions({
  type,
  onAddManual,
  onUploadSuccess,
  searchTerm,
  setSearchTerm,
  hasFilters = true,
}: DataManagementActionsProps) {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const organizationId = user?.organizationId || user?.id || "";

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
    ];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a valid Excel or CSV file");
      return;
    }

    setIsUploading(true);
    try {
      const res = await bulkUploadMembers(organizationId, type, file);
      if (res.success) {
        toast.success(`${type.replace("-", " ")} uploaded successfully`);
        onUploadSuccess();
      } else {
        toast.error(res.error || "Upload failed");
      }
    } catch {
      toast.error("An error occurred during upload");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-3">
      {hasFilters && (
        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors h-auto font-normal">
                <ListFilter className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Filter</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>All Sundays</DropdownMenuItem>
              <DropdownMenuItem>This Sunday</DropdownMenuItem>
              <DropdownMenuItem>Last Sunday</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <SearchBar
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      )}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".xlsx, .xls, .csv"
      />

      <div className="flex items-center gap-2 sm:ml-auto w-full sm:w-auto">
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex-1 sm:flex-none h-9 px-3 sm:px-5 rounded-xl border-border bg-card hover:bg-muted/50 text-foreground transition-all flex items-center justify-center gap-2 group text-sm"
        >
          {isUploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CloudUpload className="w-4 h-4 text-green-500 group-hover:scale-110 transition-transform" />
          )}
          <span className="font-medium">Bulk Upload</span>
        </Button>
        <Button
          onClick={onAddManual}
          className="flex-1 sm:flex-none h-9 px-3 sm:px-5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 group text-sm"
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
          <span className="font-medium">New Member</span>
        </Button>
      </div>
    </div>
  );
}
