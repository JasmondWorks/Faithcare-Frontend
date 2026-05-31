import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Loader2, ExternalLink, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { searchBibleReferences, type BibleReferenceSearchResult } from "@/api/scripture/scripture";
import { searchVerse } from "@/api/memorization/memorization";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "./hover-card";
import { cn } from "@/lib/utils";
import { InputField } from "./InputField";

export function BibleReferenceInput({
  value,
  onChange,
  className,
  wrapperClassName,
  inputClassName,
  placeholder = "Scripture reference…",
  onSelect,
  onKeyDown,
}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  wrapperClassName?: string;
  inputClassName?: string;
  placeholder?: string;
  onSelect?: (reference: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedObj, setSelectedObj] = useState<BibleReferenceSearchResult | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: searchResponse, isFetching } = useQuery({
    queryKey: ["bible-reference-search", value],
    queryFn: () => searchBibleReferences(value),
    enabled: value.trim().length > 0 && isOpen,
    staleTime: 60000,
  });

  const suggestions = searchResponse?.data || [];

  const { data: previewResponse, isFetching: isPreviewFetching } = useQuery({
    queryKey: ["bible-verse-preview", selectedObj?.reference],
    queryFn: () => searchVerse(selectedObj!.reference),
    enabled: !!selectedObj && value.trim() === selectedObj.reference,
    staleTime: 60000,
  });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={cn("relative group", className)} ref={containerRef}>
      <div className={cn("relative flex items-center transition-colors", wrapperClassName || "bg-secondary/50 rounded-full border border-border/40 hover:border-accent/30 group-focus-within:border-accent/50 group-focus-within:bg-card")}>
        <InputField
          name="bibleReference"
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e: any) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (value.trim().length > 0) setIsOpen(true);
          }}
          onKeyDown={onKeyDown}
          icon={!wrapperClassName ? <BookOpen className="w-3.5 h-3.5 text-accent/70 group-focus-within:text-accent transition-colors" /> : undefined}
          iconPosition="left"
          className="flex-1 w-full !gap-0"
          inputClassName={cn(
            "!bg-transparent !border-none !outline-none !shadow-none !ring-0 !min-h-0 !h-auto !py-1.5 !min-w-[200px] font-medium focus:ring-0 flex-1 min-w-0 focus-visible:ring-0 focus-visible:border-transparent",
            inputClassName || "text-sm w-36 sm:w-52 placeholder:text-muted-foreground/40",
            !wrapperClassName ? "pl-11" : "",
            (isFetching || (selectedObj && value.trim() === selectedObj.reference)) ? "pr-10" : ""
          )}
        />
        <div className="absolute right-3 flex items-center gap-1">
          {isFetching && (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground/50" />
          )}
          {!isFetching && selectedObj && value.trim() === selectedObj.reference && (
            <>
              <HoverCard openDelay={200} closeDelay={200}>
                <HoverCardTrigger asChild>
                  <button
                    type="button"
                    className="text-accent hover:text-accent/80 hover:bg-accent/10 p-1 rounded-md transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </HoverCardTrigger>
                <HoverCardContent className="w-80 p-4 border border-border bg-card shadow-lg rounded-xl z-[60] text-left">
                  {isPreviewFetching ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-4 h-4 animate-spin text-accent" />
                    </div>
                  ) : previewResponse?.success && previewResponse.data ? (
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold text-foreground">
                        {previewResponse.data.reference} ({previewResponse.data.translation})
                      </h4>
                      <p className="text-xs text-muted-foreground italic leading-relaxed">
                        "{previewResponse.data.text}"
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">
                      Could not load preview.
                    </p>
                  )}
                </HoverCardContent>
              </HoverCard>

              <Link
                to={`/scripture/read?book=${encodeURIComponent(selectedObj.book)}&chapter=${encodeURIComponent(selectedObj.book + "." + selectedObj.chapter)}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Open in Reader"
                className="text-accent hover:text-accent/80 hover:bg-accent/10 p-1 rounded-md transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </>
          )}
        </div>
      </div>

      {isOpen && value.trim().length > 0 && suggestions.length > 0 && (
        <div className="absolute top-full left-0 mt-1 w-full sm:w-64 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, i) => (
            <button
              key={i}
              type="button"
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted/50 transition-colors focus:bg-muted focus:outline-none"
              onClick={() => {
                onChange(suggestion.reference);
                setSelectedObj(suggestion);
                setIsOpen(false);
                if (onSelect) onSelect(suggestion.reference);
              }}
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-accent/50 shrink-0" />
                <span className="font-medium text-foreground">{suggestion.reference}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
