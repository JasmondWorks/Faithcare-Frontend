import { CheckIcon, ChevronDown, MinusIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import type { TableColumn, TableProps } from "./types";
import { cn } from "@/app/components/ui/utils";
import AppPagination from "../AppPagination";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../dropdown-menu";

const Table = <T extends { id: string | number }>(props: TableProps<T>) => {
  const {
    variant = "default",
    data,
    columns,
    loading = false,
    emptyMessage = "No data found.",
    onRowSelect,
    selectable = false,
    actions = [],
    activate = [],
    className = "",
    rowClassName,
    onItemClick,
    getRowHref,
    isPaginated = true,
    currentPage = 1,
    totalPages = 1,
    onPageChange,
    hasHeaders = true,
    containerClassName,
  } = props;

  const [selectedItems, setSelectedItems] = useState<Set<string | number>>(
    new Set(),
  );
  const total = data?.length ?? 0;
  const selectedCount = selectedItems.size;
  const allSelected = total > 0 && selectedCount === total;
  const someSelected = selectedCount > 0 && selectedCount < total;

  const handleHeaderToggle = () => {
    if (allSelected || someSelected) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(data?.map((item) => item.id)));
    }
  };

  const handleSelectItem = (id: string | number) => {
    const next = new Set(selectedItems);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedItems(next);
  };

  useEffect(() => {
    if (onRowSelect) {
      onRowSelect(data?.filter((item) => selectedItems.has(item.id)));
    }
  }, [selectedItems, data, onRowSelect]);

  const renderCellContent = (
    column: TableColumn<T>,
    item: T,
    index: number,
  ) => {
    if (column.render) return column.render(item, index);
    const value = column.key
      .split(".")
      .reduce((obj: any, key) => obj?.[key], item);
    return value ?? "N/A";
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="border-primary h-12 w-12 animate-spin rounded-full border-b-2" />
      </div>
    );
  }

  if (variant === "minimal") {
    return <TableVariant {...props} />;
  }

  return (
    <div className={cn("w-full", className)}>
      {/*
        Outer: carries the shadow and rounded corners.
        NO overflow-hidden here â€” overflow-hidden clips box-shadow.
      */}
      <div
        className={cn(
          "w-full border border-border bg-card",
          isPaginated ? "rounded-t-2xl" : "rounded-2xl",
        )}
      >
        {/*
          Inner: overflow-hidden so table content respects the rounded corners.
          Separate from the shadow container so the shadow isn't clipped.
        */}
        <div
          className={cn(
            "w-full",
            isPaginated ? "rounded-t-2xl" : "rounded-2xl",
            containerClassName || "overflow-hidden",
          )}
        >
          <div className={cn("w-full", containerClassName ? "" : "overflow-x-auto")}>
            <table className="min-w-full divide-y divide-border">
              {hasHeaders && (
                <thead className="bg-accent/10">
                  <tr>
                    {selectable && (
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase"
                      >
                        <div
                          role="button"
                          aria-label="Select all rows"
                          onClick={handleHeaderToggle}
                          className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-sm border border-border bg-transparent hover:border-accent"
                        >
                          {allSelected ? (
                            <CheckIcon className="h-4 w-4 text-accent" />
                          ) : someSelected ? (
                            <MinusIcon className="h-4 w-4 text-accent" />
                          ) : null}
                        </div>
                      </th>
                    )}
                    {columns.map((column, colIndex) => (
                      <th
                        key={column.key || column.label || colIndex}
                        scope="col"
                        className={cn(
                          "px-6 py-3 text-left text-[0.7rem] font-semibold tracking-wider text-accent-foreground/80 uppercase",
                          column.className,
                        )}
                        style={{ width: column.width }}
                      >
                        {column.label}
                      </th>
                    ))}
                    {actions.length > 0 && (
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    )}
                    {activate.length > 0 && (
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Activate</span>
                      </th>
                    )}
                  </tr>
                </thead>
              )}
              <tbody className="divide-y divide-border bg-card">
                {data?.length === 0 ? (
                  <tr>
                    <td
                      colSpan={
                        columns.length +
                        (selectable ? 1 : 0) +
                        (actions.length > 0 ? 1 : 0) +
                        (activate.length > 0 ? 1 : 0)
                      }
                      className="px-6 py-12 text-center text-sm text-muted-foreground"
                    >
                      {emptyMessage}
                    </td>
                  </tr>
                ) : (
                  data?.map((item, index) => (
                    <tr
                      key={item.id}
                      className={cn(
                        "transition-colors hover:bg-muted/30",
                        rowClassName ? rowClassName(item, index) : "",
                        onItemClick || getRowHref ? "cursor-pointer" : "",
                      )}
                      onClick={(e) => {
                        // Prevent row click if clicking a button or interactive element
                        if ((e.target as HTMLElement).closest("button")) return;
                        e.stopPropagation();
                        onItemClick?.(item);
                      }}
                    >
                      {selectable && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div
                            role="button"
                            aria-label="Select row"
                            onClick={() => handleSelectItem(item.id)}
                            className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-sm border border-border bg-transparent hover:border-accent"
                          >
                            {selectedItems.has(item.id) && (
                              <CheckIcon className="h-4 w-4 text-accent" />
                            )}
                          </div>
                        </td>
                      )}
                      {columns.map((column, colIndex) => (
                        <td
                          key={column.key || column.label || colIndex}
                          className={cn(
                            "px-6 py-4 text-sm whitespace-nowrap text-foreground",
                            column.className,
                            colIndex === 0 && getRowHref ? "relative" : "",
                          )}
                        >
                          {colIndex === 0 && getRowHref && (
                            <Link
                              to={getRowHref(item)}
                              className="absolute inset-0"
                              aria-label="View row"
                            />
                          )}
                          {renderCellContent(column, item, index)}
                        </td>
                      ))}
                      {actions.length > 0 && (
                        <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="inline-flex items-center gap-1 h-9 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground shadow-sm hover:bg-muted transition-colors focus:ring-0 focus-visible:ring-0"
                                >
                                  Actions
                                  <ChevronDown className="h-4 w-4 opacity-50" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40">
                                {actions
                                  .filter(
                                    (action) =>
                                      !action.condition ||
                                      action.condition(item),
                                  )
                                  .map((action, actionIndex) => (
                                    <DropdownMenuItem
                                      key={actionIndex}
                                      onClick={() => action.onClick(item)}
                                      className={cn(
                                        "cursor-pointer",
                                        action.className,
                                      )}
                                    >
                                      {action.label}
                                    </DropdownMenuItem>
                                  ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isPaginated && (
        <div className="overflow-hidden rounded-b-2xl border-x border-b border-border">
          <AppPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange!}
          />
        </div>
      )}
    </div>
  );
};

const TableVariant = <T extends { id: string | number }>(
  props: TableProps<T>,
) => {
  const { data, columns, emptyMessage, hasHeaders = true } = props;

  const renderCell = (column: TableColumn<T>, item: T, index: number) => {
    if (column.render) return column.render(item, index);
    const value = column.key
      .split(".")
      .reduce((obj: any, key) => obj?.[key], item);
    return value ?? "N/A";
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-full border-y border-border">
        {hasHeaders && (
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.label}
                  scope="col"
                  className="py-2 pr-6 text-left text-xs font-semibold tracking-wider text-muted-foreground uppercase first:pl-0"
                  style={{ width: column.width }}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody className="divide-y divide-border">
          {!data?.length ? (
            <tr>
              <td
                colSpan={columns.length}
                className="py-4 text-center text-sm text-muted-foreground"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                {columns.map((column) => (
                  <td
                    key={column.label}
                    className={cn(
                      "py-4 pr-6 text-sm whitespace-nowrap text-muted-foreground first:pl-0",
                      column.className,
                    )}
                    style={{ width: column.width }}
                  >
                    {renderCell(column, item, index)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
