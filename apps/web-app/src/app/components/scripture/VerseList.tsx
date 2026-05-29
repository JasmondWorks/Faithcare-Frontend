import { useRef } from "react";
import { Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Verse } from "@/api/scripture/types";

interface VerseListProps {
  verses: Verse[];
  bookmarkable?: boolean;
  bookmarkedRefs?: Set<string>;
  onBookmark?: (verse: Verse) => void;
}

export function VerseList({
  verses,
  bookmarkable = false,
  bookmarkedRefs = new Set(),
  onBookmark,
}: VerseListProps) {
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTouchStart = (verse: Verse) => {
    if (!bookmarkable) return;
    longPressTimer.current = setTimeout(() => {
      onBookmark?.(verse);
    }, 600);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  return (
    <div className="space-y-3">
      {verses.map((verse) => {
        const isBookmarked = bookmarkedRefs.has(verse.reference);

        return (
          <div
            key={verse.number}
            className={cn(
              "relative group leading-[1.8] text-[17px] text-foreground py-1 pr-8 rounded-md transition-colors",
              isBookmarked && "bg-accent/5",
            )}
            onTouchStart={() => handleTouchStart(verse)}
            onTouchEnd={handleTouchEnd}
            onTouchMove={handleTouchEnd}
          >
            <sup className="text-xs font-bold text-accent/70 mr-1.5 select-none">
              {verse.number}
            </sup>
            <span className="font-['Georgia',serif]">{verse.text}</span>

            {bookmarkable && (
              <button
                type="button"
                onClick={() => onBookmark?.(verse)}
                className={cn(
                  "absolute right-1 top-2 p-1.5 rounded-md transition-all",
                  isBookmarked
                    ? "text-accent opacity-100"
                    : "text-muted-foreground/40 md:opacity-0 group-hover:opacity-100 hover:text-accent hover:bg-accent/10",
                )}
                title={isBookmarked ? "Bookmarked" : "Bookmark verse"}
              >
                {isBookmarked ? (
                  <Bookmark className="w-4 h-4 fill-current" />
                ) : (
                  <Bookmark className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
