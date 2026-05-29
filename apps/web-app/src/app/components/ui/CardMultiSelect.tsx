import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "./utils";
import { Button } from "@/components/ui/button";

export interface CardMultiSelectOption {
  label: string;
  value: string;
}

export interface CardMultiSelectProps {
  options: CardMultiSelectOption[];
  value?: string[];
  onChange?: (value: string[]) => void;
  className?: string;
  disabled?: boolean;
}

export function CardMultiSelect({
  options,
  value = [],
  onChange,
  className,
  disabled,
}: CardMultiSelectProps) {
  const toggleOption = (optionValue: string) => {
    if (disabled) return;
    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];
    onChange?.(newValue);
  };

  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-4", className)}>
      {options.map((option) => {
        const isSelected = value.includes(option.value);
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => toggleOption(option.value)}
            disabled={disabled}
            className={cn(
              "p-5 rounded-lg border transition-all text-left flex items-center justify-between group relative overflow-hidden active:scale-[0.98] min-h-[52px] h-auto font-normal outline-none",
              isSelected
                ? "border-accent bg-accent/5 ring-4 ring-accent/5"
                : "border-neutral-200 hover:border-accent bg-secondary/30",
              disabled && "opacity-50 cursor-not-allowed active:scale-100"
            )}
          >
            <span
              className={cn(
                "text-lg font-medium tracking-tight transition-colors",
                isSelected ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
              )}
            >
              {option.label}
            </span>
            <div
              className={cn(
                "w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-300",
                isSelected
                  ? "bg-accent border-accent scale-100"
                  : "border-muted-foreground/30 group-hover:border-accent/40 scale-90"
              )}
            >
              {isSelected && (
                <Check className="w-3 h-3 text-white stroke-[2.5px]" />
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
