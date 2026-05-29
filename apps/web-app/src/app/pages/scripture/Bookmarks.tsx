import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Bookmark, Trash2, BookOpen } from "lucide-react";
import { toast } from "react-hot-toast";
import { getBookmarks, removeBookmark } from "@/api/scripture/scripture";
import type { BookmarkedVerse } from "@/api/scripture/types";
import { Card } from "../../components/ui/card";
import { cn } from "@/lib/utils";

// ── Skeleton ──────────────────────────────────────────────────────────────────

function BookmarkSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex gap-3 p-4 border border-border rounded-xl">
          <div className="h-6 w-16 bg-muted rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 bg-muted rounded w-full" />
            <div className="h-3.5 bg-muted rounded w-4/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Group by book ─────────────────────────────────────────────────────────────

function groupByBook(bookmarks: BookmarkedVerse[]): Map<string, BookmarkedVerse[]> {
  const map = new Map<string, BookmarkedVerse[]>();
  for (const bm of bookmarks) {
    const book = bm.verseReference.split(" ").slice(0, -1).join(" ") || bm.chapterId;
    if (!map.has(book)) map.set(book, []);
    map.get(book)!.push(bm);
  }
  return map;
}

// ── Bookmark row ──────────────────────────────────────────────────────────────

interface BookmarkRowProps {
  bookmark: BookmarkedVerse;
  onDelete: (id: string) => void;
  isDeleting: boolean;
  onClick: () => void;
}

function BookmarkRow({ bookmark, onDelete, isDeleting, onClick }: BookmarkRowProps) {
  const [swipeOpen, setSwipeOpen] = useState(false);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border transition-all group",
        swipeOpen && "border-red-200",
      )}
    >
      <div
        className="flex items-start gap-3 p-4 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={onClick}
      >
        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-[11px] font-bold uppercase tracking-wider shrink-0 mt-0.5">
          {bookmark.verseReference}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-foreground leading-relaxed line-clamp-2 font-['Georgia',serif]">
            {bookmark.verseText}
          </p>
          {bookmark.note && (
            <p className="text-xs text-muted-foreground italic mt-1 line-clamp-1">
              {bookmark.note}
            </p>
          )}
          <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wider font-medium mt-1.5">
            {new Date(bookmark.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (confirm("Delete this bookmark?")) onDelete(bookmark.id);
          }}
          disabled={isDeleting}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all shrink-0"
          title="Delete bookmark"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Bookmarks() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: res, isLoading } = useQuery({
    queryKey: ["scripture-bookmarks"],
    queryFn: getBookmarks,
    staleTime: 60_000,
  });

  const bookmarks = (res?.data ?? []).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const deleteMutation = useMutation({
    mutationFn: (id: string) => removeBookmark(id),
    onSuccess: () => {
      toast.success("Bookmark removed");
      queryClient.invalidateQueries({ queryKey: ["scripture-bookmarks"] });
      setDeletingId(null);
    },
    onError: () => {
      toast.error("Failed to remove bookmark");
      setDeletingId(null);
    },
  });

  const handleDelete = (id: string) => {
    setDeletingId(id);
    deleteMutation.mutate(id);
  };

  const handleNavigateToVerse = (bm: BookmarkedVerse) => {
    navigate(
      `/scripture/read?bibleId=${encodeURIComponent(bm.bibleId)}&book=${encodeURIComponent(bm.chapterId.split(".")[0])}&chapter=${encodeURIComponent(bm.chapterId)}`,
    );
  };

  if (isLoading) return <div className="max-w-2xl mx-auto"><BookmarkSkeleton /></div>;

  if (bookmarks.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto border border-accent/20">
          <Bookmark className="w-7 h-7 text-accent" />
        </div>
        <p className="font-bold text-foreground">No saved verses yet</p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Long-press any verse while reading to bookmark it.
        </p>
      </div>
    );
  }

  const grouped = groupByBook(bookmarks);

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {Array.from(grouped.entries()).map(([book, items]) => (
        <section key={book} className="space-y-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5 text-accent" />
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              {book}
            </p>
            <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full font-bold">
              {items.length}
            </span>
          </div>
          <div className="space-y-2">
            {items.map((bm) => (
              <BookmarkRow
                key={bm.id}
                bookmark={bm}
                isDeleting={deletingId === bm.id}
                onDelete={handleDelete}
                onClick={() => handleNavigateToVerse(bm)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
