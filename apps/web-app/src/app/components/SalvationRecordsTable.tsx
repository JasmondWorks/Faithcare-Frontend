import React from "react";
import Table from "./ui/table/Table";
import type { TableColumn } from "./ui/table/types";
import { Card } from "./ui/card";
import SearchBar from "./ui/search-bar";
import { useSearch } from "../contexts/SearchContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { ListFilter } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SalvationRecordsTable({ 
  data,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}: { 
  data: any[];
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}) {
  const { searchTerm, setSearchTerm } = useSearch();

  const columns: TableColumn[] = [
    {
      key: "name",
      label: "Name",
    },
    {
      key: "contactInfo",
      label: "Contact Info",
    },
    {
      key: "decisionDate",
      label: "Decision Date",
    },
    {
      key: "prayerRequests",
      label: "Prayer Requests",
    },
    {
      key: "reflections",
      label: "Reflections/Notes",
    },
    {
      key: "status",
      label: "Status",
    },
    {
      key: "actions",
      label: "Actions",
    },
  ];
  return (
    <Card className="space-y-4">
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div>
          <h1 className="text-foreground font-bold text-lg">
            Salvation Records
          </h1>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 h-auto py-1.5 font-normal">
                <ListFilter className="w-4 h-4" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>All Sundays</DropdownMenuItem>
              <DropdownMenuItem>This Sunday</DropdownMenuItem>
              <DropdownMenuItem>Last Sunday</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <SearchBar
            placeholder="Search by name, email, or phone"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <Table
        data={data.map((item) => ({
          ...item,
          contacts: `${item.phone} - ${item.email}`,
          visits: `${item.firstVisit} - ${item.secondVisit}`,
          prayerRequests: item.prayerRequest,
          status: item.status,
          actions: "Actions",
        }))}
        columns={columns}
        isPaginated={true}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </Card>
  );
}
