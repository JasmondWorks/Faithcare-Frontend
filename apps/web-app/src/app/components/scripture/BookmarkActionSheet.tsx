import { Bookmark, BookmarkCheck, X } from "lucide-react";
import type { Verse } from "@/api/scripture/types";
import { Button } from "@/components/ui/button";

interface BookmarkActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  verse: Verse | null;
  isBookmarked: boolean;
  onBookmark: () => void;
  onRemoveBookmark: () => void;
}

export function BookmarkActionSheet({
  isOpen,
  onClose,
  verse,
  isBookmarked,
  onBookmark,
  onRemoveBookmark,
}: BookmarkActionSheetProps) {
  if (!isOpen || !verse) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-2xl border-t border-border p-5 pb-8 max-w-lg mx-auto shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-bold text-accent uppercase tracking-wider">
            {verse.reference}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className="text-sm text-foreground/80 leading-relaxed mb-5 line-clamp-3 font-['Georgia',serif]">
          "{verse.text}"
        </p>

        <div className="space-y-2">
          {isBookmarked ? (
            <Button
              variant="outline"
              className="w-full gap-2 border-destructive/30 text-destructive hover:bg-destructive/10"
              onClick={() => { onRemoveBookmark(); onClose(); }}
            >
              <BookmarkCheck className="w-4 h-4" />
              Remove Bookmark
            </Button>
          ) : (
            <Button
              className="w-full gap-2"
              onClick={() => { onBookmark(); onClose(); }}
            >
              <Bookmark className="w-4 h-4" />
              Bookmark this verse
            </Button>
          )}
          <Button variant="ghost" className="w-full text-muted-foreground" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </>
  );
}
