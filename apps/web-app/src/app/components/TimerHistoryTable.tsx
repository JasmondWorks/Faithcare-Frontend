import React, { useState, useEffect, useRef } from "react";
import Table from "./ui/table/Table";
import type { TableColumn } from "./ui/table/types";
import { Trash2, MoreVertical } from "lucide-react";
import { cn } from "./ui/utils";
import { Button } from "@/components/ui/button";

interface TimerSession {
  _id?: string;
  id: string;
  duration: number;
  status: string;
  currentProgress: number;
  createdAt: string;
  isDeleted?: boolean;
  deletedAt?: string | null;
  updatedAt?: string;
  userId?: string;
}

interface TimerHistoryTableProps {
  data: TimerSession[];
  onDelete: (id: string) => void;
  isLoading?: boolean;
  emptyMessage?: string;
}

// Custom simple dropdown to avoid library overhead
const ActionsDropdown = ({ onDelete, id }: { onDelete: (id: string) => void; id: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 hover:bg-muted"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
      >
        <MoreVertical className="h-4 w-4" />
      </Button>

      {isOpen && (
        <div 
          className="absolute right-0 z-[100] mt-1 w-32 origin-top-right rounded-md border border-border bg-card p-1 shadow-lg animate-in fade-in zoom-in duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              onDelete(id);
              setIsOpen(false);
            }}
            className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm text-red-500 hover:bg-muted outline-none transition-colors"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

const TimerHistoryTable: React.FC<TimerHistoryTableProps> = ({
  data,
  onDelete,
  isLoading,
  emptyMessage = "No focus sessions recorded yet.",
}) => {
  // Map data to include the required 'id' field for the Table component
  const tableData = data.map((session) => ({
    ...session,
    id: session._id || session.id || "",
  }));

  const columns: TableColumn<any>[] = [
    {
      key: "createdAt",
      label: "Date",
      render: (item: TimerSession) => (
        <div className="flex flex-col">
          <span className="font-medium text-xs">
            {new Date(item.createdAt).toLocaleDateString()}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {new Date(item.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      ),
    },
    {
      key: "duration",
      label: "Duration",
      render: (item: TimerSession) => (
        <span className="font-medium text-xs">
          {item.duration} min{item.duration > 1 ? "s" : ""}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (item: TimerSession) => {
        const isCompleted = item.status === "COMPLETED";
        return (
          <span
            className={cn(
              "px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider",
              isCompleted
                ? "bg-green-100 text-green-600"
                : "bg-amber-100 text-amber-600",
            )}
          >
            {item.status}
          </span>
        );
      },
    },
    {
      key: "actions",
      label: "",
      className: "text-right",
      render: (item: TimerSession) => (
        <ActionsDropdown onDelete={onDelete} id={item._id || item.id || ""} />
      ),
    },
  ];

  return (
    <Table
      data={tableData}
      columns={columns}
      loading={isLoading}
      isPaginated={false}
      emptyMessage={emptyMessage}
      className="border-none shadow-none bg-transparent"
      containerClassName="overflow-visible"
    />
  );
};

// Memoize the entire component to prevent re-renders on every timer tick
export default React.memo(TimerHistoryTable);
