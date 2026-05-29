import * as React from "react";
import PhoneInput, { getCountryCallingCode } from "react-phone-number-input";
import * as Flags from "country-flag-icons/react/3x2";
import "react-phone-number-input/style.css";
import en from "react-phone-number-input/locale/en.json";
import { cn } from "./utils";
import { ChevronDown, Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Button } from "@/components/ui/button";

export interface PhoneInputProps extends Omit<
  React.ComponentProps<"input">,
  "onChange" | "value"
> {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

const CustomInput = React.forwardRef<HTMLInputElement, any>(
  ({ dialCode, ...props }, ref) => {
    const prefix = `+${dialCode}`;

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      const { selectionStart, value } = e.currentTarget;
      const prefixWithSpace = `${prefix} `;
      const isAtPrefix = (selectionStart || 0) <= prefixWithSpace.length;

      // Prevent backspacing into the prefix
      if (e.key === "Backspace" && (selectionStart || 0) <= prefixWithSpace.length) {
        e.preventDefault();
      }

      // Prevent selecting/editing the prefix
      if (isAtPrefix && e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        // If typing, ensure cursor is after prefix
        e.currentTarget.setSelectionRange(
          prefixWithSpace.length,
          prefixWithSpace.length,
        );
      }
    };

    const handleClick = (e: React.MouseEvent<HTMLInputElement>) => {
      const { selectionStart } = e.currentTarget;
      const prefixWithSpace = `${prefix} `;
      if ((selectionStart || 0) < prefixWithSpace.length) {
        e.currentTarget.setSelectionRange(
          prefixWithSpace.length,
          prefixWithSpace.length,
        );
      }
    };

    return (
      <input
        {...props}
        ref={ref}
        onKeyDown={handleKeyDown}
        onClick={handleClick}
        className={cn(
          "w-full h-[52px] bg-secondary/30 border border-neutral-200 rounded-lg focus-visible:ring-4 focus-visible:ring-accent/5 focus-visible:border-accent transition-all text-foreground font-medium tracking-tight text-lg pl-[92px] pr-6",
          props.className,
        )}
      />
    );
  },
);
CustomInput.displayName = "CustomInput";

const CountrySelect = ({ value, onChange, labels, options, disabled }: any) => {
  const [search, setSearch] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const Flag = Flags ? (Flags as any)[value] : null;

  const filteredOptions = options.filter((option: any) => {
    if (!option.value) return false;
    const countryName = labels?.[option.value] || (en as any)[option.value] || "";
    return (
      countryName.toLowerCase().includes(search.toLowerCase()) ||
      option.value.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="absolute left-0 top-0 bottom-0 px-3 py-0 h-full flex items-center gap-1 border-r rounded-r-none z-20 cursor-pointer group-hover:bg-neutral-50/50 transition-colors">
          <div className="flex items-center gap-1.5 px-2">
            {Flag ? (
              <Flag className="w-6 h-4 shadow-sm" />
            ) : (
              <span className="text-xl">🌐</span>
            )}
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground opacity-50" />
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0 overflow-hidden" align="start">
        <div className="p-2 border-b">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              autoFocus
              placeholder="Search country..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-secondary/20 rounded-md outline-none focus:ring-2 focus:ring-neutral-200 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="max-h-[300px] overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-neutral-200">
          {filteredOptions.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground italic">
              No countries found
            </div>
          ) : (
            filteredOptions.map((option: any) => {
              const OptionFlag = Flags ? (Flags as any)[option.value] : null;
              return (
                <button
                  key={option.value}
                  type="button"
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-md transition-all text-left group/option",
                    value === option.value
                      ? "bg-neutral-100 font-semibold"
                      : "hover:bg-neutral-50",
                  )}
                  onClick={() => {
                    onChange(option.value);
                    setSearch("");
                    setOpen(false);
                  }}
                >
                  <div className="flex-shrink-0 w-6 h-4 overflow-hidden rounded-[2px] shadow-sm border border-border/50">
                    {OptionFlag ? <OptionFlag /> : <span>🌐</span>}
                  </div>
                  <span className="flex-1 truncate text-foreground/80 group-hover/option:text-foreground">
                    {labels?.[option.value] ||
                      (en as any)[option.value] ||
                      option.value}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">
                    +{getCountryCallingCode(option.value)}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export const PhoneInputComponent = React.forwardRef<any, PhoneInputProps>(
  ({ value, onChange, className, disabled, placeholder, ...props }, ref) => {
    const [country, setCountry] = React.useState<any>("NG");
    const dialCode = React.useMemo(() => {
      try {
        return getCountryCallingCode(country);
      } catch (e) {
        return "234";
      }
    }, [country]);

    return (
      <div className={cn("relative flex items-center group w-full", className)}>
        <PhoneInput
          international
          withCountryCallingCode
          defaultCountry="NG"
          onCountryChange={setCountry}
          value={value}
          onChange={(val) => onChange?.(val || "")}
          disabled={disabled}
          placeholder={placeholder}
          labels={en}
          inputComponent={CustomInput}
          countrySelectComponent={CountrySelect}
          numberInputProps={{ dialCode } as any}
          className="w-full"
        />
      </div>
    );
  },
);

PhoneInputComponent.displayName = "PhoneInputComponent";

export { PhoneInputComponent as PhoneInput };
