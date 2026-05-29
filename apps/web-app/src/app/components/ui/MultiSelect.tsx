import * as React from "react";
import { X, Check, ChevronsUpDown } from "lucide-react";
import { Badge } from "./badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover";
import { cn } from "./utils";
import { Button } from "@/components/ui/button";

export interface MultiSelectProps {
  options: { label: string; value: string }[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelect({
  options,
  selected = [],
  onChange,
  placeholder = "Select options...",
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const handleUnselect = (value: string) => {
    onChange(selected.filter((s) => s !== value));
  };

  const handleSelect = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((s) => s !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          role="combobox"
          aria-expanded={open}
          className={cn(
            "flex min-h-[52px] w-full items-center justify-between rounded-lg border border-neutral-200 bg-secondary/30 px-4 py-2 text-lg font-medium tracking-tight transition-all focus-within:ring-4 focus-within:ring-accent/5 focus-within:border-accent cursor-pointer",
            className
          )}
          onClick={() => setOpen(!open)}
        >
          <div className="flex flex-wrap gap-1">
            {selected.length > 0 ? (
              selected.map((value) => {
                const option = options.find((o) => o.value === value);
                return (
                  <Badge
                    key={value}
                    variant="secondary"
                    className="rounded-md px-2 py-0.5 text-xs font-bold bg-accent/10 text-accent border-accent/20"
                  >
                    {option?.label || value}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-1 h-4 w-4 rounded-full outline-none hover:bg-accent/20 transition-colors p-0"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleUnselect(value);
                        }
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onClick={() => handleUnselect(value)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                );
              })
            ) : (
              <span className="text-muted-foreground font-medium opacity-50">
                {placeholder}
              </span>
            )}
          </div>
          <ChevronsUpDown className="h-5 w-5 shrink-0 opacity-50" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-full min-w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search..." className="h-12" />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  onSelect={() => {
                    handleSelect(option.value);
                  }}
                  className="flex items-center gap-2 px-4 py-3 cursor-pointer"
                >
                  <div
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-md border border-primary transition-all",
                      selected.includes(option.value)
                        ? "bg-primary text-primary-foreground"
                        : "opacity-50"
                    )}
                  >
                    {selected.includes(option.value) && (
                      <Check className="h-3 w-3 stroke-[3]" />
                    )}
                  </div>
                  <span className="font-medium">{option.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
