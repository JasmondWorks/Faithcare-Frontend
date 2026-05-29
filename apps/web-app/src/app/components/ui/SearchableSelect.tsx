import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface SearchableSelectProps<T> {
  placeholder?: string;
  options: T[];
  isLoading?: boolean;
  onSelect?: (item: T | null) => void;
  onSearch?: (searchTerm: string) => void;
  selectedItem?: T | null;
  getDisplayValue: (item: T) => React.ReactNode;
  getStringValue?: (item: T) => string;
  getListDisplayValue?: (item: T) => React.ReactNode;
  value?: string;
  onInputChange?: (value: string) => void;
  icon?: any;
  containerClassName?: string;
  inputClassName?: string;
  required?: boolean;
}

const placeholderRows = Array.from({ length: 5 });

const SearchableSelect = <T,>({
  placeholder,
  options,
  isLoading = false,
  onSelect,
  onSearch,
  selectedItem,
  getDisplayValue,
  getStringValue,
  getListDisplayValue,
  value: controlledValue,
  onInputChange,
  icon,
  containerClassName = "",
  inputClassName = "",
  required = false,
}: SearchableSelectProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(controlledValue ?? "");
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);

  const updateDropdownPosition = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    updateDropdownPosition();
    const onResizeOrScroll = () => updateDropdownPosition();
    window.addEventListener("resize", onResizeOrScroll);
    window.addEventListener("scroll", onResizeOrScroll, true);
    return () => {
      window.removeEventListener("resize", onResizeOrScroll);
      window.removeEventListener("scroll", onResizeOrScroll, true);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        portalRef.current &&
        !portalRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (controlledValue !== undefined) {
      setSearchTerm(controlledValue);
    }
  }, [controlledValue]);

  const getValueAsString = (item: T): string => {
    if (getStringValue) return getStringValue(item);
    const displayValue = getDisplayValue(item);
    if (typeof displayValue === "string") return displayValue;
    if (typeof displayValue === "number") return displayValue.toString();
    return String(displayValue);
  };

  useEffect(() => {
    if (controlledValue === undefined && selectedItem) {
      setSearchTerm(getValueAsString(selectedItem));
    }
  }, [selectedItem, controlledValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = e.target.value;

    if (selectedItem && nextValue !== getValueAsString(selectedItem)) {
      onSelect?.(null);
    }

    if (controlledValue === undefined) {
      setSearchTerm(nextValue);
    }

    onInputChange?.(nextValue);
    onSearch?.(nextValue);
    setIsOpen(true);
  };

  const handleOptionClick = (item: T) => {
    onSelect?.(item);
    setIsOpen(false);
    const label = getValueAsString(item);
    if (controlledValue === undefined) {
      setSearchTerm(label);
    }
    onInputChange?.(label);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    updateDropdownPosition();
    onSearch?.(controlledValue !== undefined ? controlledValue : searchTerm);
  };

  const inputValue =
    controlledValue !== undefined ? controlledValue : searchTerm;

  const filteredOptions = options.filter((item) =>
    getValueAsString(item).toLowerCase().includes(inputValue.toLowerCase()),
  );

  return (
    <div
      className={cn("w-full relative block", containerClassName)}
      ref={containerRef}
    >
      <div className="relative group">
        {icon && (
          <div className="absolute left-4.5 top-1/2 -translate-y-1/2 z-10 text-muted-foreground group-focus-within:text-accent transition-colors">
            {React.isValidElement(icon)
              ? icon
              : React.createElement(icon, {
                  className: "w-4 h-4",
                  strokeWidth: 1.5,
                })}
          </div>
        )}
        <input
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          className={
            cn(
              "w-full h-[52px] bg-secondary/30 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent transition-all text-foreground font-medium tracking-tight text-lg m-0",
              icon ? "pl-12" : "pl-4",
              "pr-10",
              inputClassName
            )
          }
          required={required}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full hover:bg-gray-100/50"
          onClick={() => setIsOpen((o) => !o)}
          tabIndex={-1}
        >
          <ChevronDown
            className={cn(
              "size-4 text-muted-foreground opacity-50 transition-transform duration-200",
              isOpen && "rotate-180",
            )}
          />
        </Button>
      </div>

      {isOpen && (
        <div
          ref={portalRef}
          className="fixed z-[60] bg-white rounded-xl shadow-lg border border-gray-200 py-2 mt-1"
          style={{
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            width: dropdownPosition.width,
          }}
        >
          {isLoading ? (
            <ul className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
              {placeholderRows.map((_, index) => (
                <li key={index} className="px-4 py-3">
                  <div className="h-4 w-full bg-gray-200 animate-pulse rounded" />
                </li>
              ))}
            </ul>
          ) : filteredOptions.length > 0 ? (
            <ul className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
              {filteredOptions.map((item, index) => (
                <li
                  key={index}
                  className="px-4 py-3 cursor-pointer hover:bg-gray-50 text-sm transition-colors text-gray-700"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleOptionClick(item);
                  }}
                >
                  {getListDisplayValue
                    ? getListDisplayValue(item)
                    : getDisplayValue(item)}
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-3 text-sm text-gray-500">
              No results found.{" "}
              {inputValue
                ? `You can use "${inputValue}" as a custom name.`
                : ""}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
