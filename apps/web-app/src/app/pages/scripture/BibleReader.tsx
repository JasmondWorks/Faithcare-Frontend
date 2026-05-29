import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  Volume2,
  Loader2,
  Globe,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  getBibles,
  getAudioBibles,
  getBooks,
  getChapters,
  getChapter,
  getAudioChapter,
  getBookmarks,
  addBookmark,
  removeBookmark,
} from "@/api/scripture/scripture";
import type { Verse } from "@/api/scripture/types";
import { Button } from "@/components/ui/button";
import { Card } from "../../components/ui/card";
import { VerseList } from "../../components/scripture/VerseList";
import { ReflectionPanel } from "../../components/scripture/ReflectionPanel";
import { AudioPlayer } from "../../components/scripture/AudioPlayer";
import { BookmarkActionSheet } from "../../components/scripture/BookmarkActionSheet";
import { cn } from "@/lib/utils";

const TRANSLATION_KEY = "scripture_translation_id";

// ── Skeletons ─────────────────────────────────────────────────────────────────

function GridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-16 bg-muted rounded-xl" />
      ))}
    </div>
  );
}

function VerseSkeleton() {
  return (
    <div className="space-y-2 animate-pulse">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-4 bg-muted rounded" style={{ width: `${60 + (i % 5) * 8}%` }} />
      ))}
    </div>
  );
}

// ── Translation selector ──────────────────────────────────────────────────────

interface TranslationSelectorProps {
  bibles: { id: string; name: string; abbreviation: string; language: string }[];
  selected: string;
  onChange: (id: string) => void;
}

function TranslationSelector({ bibles, selected, onChange }: TranslationSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
      <select
        value={selected}
        onChange={(e) => onChange(e.target.value)}
        className="text-sm font-semibold text-foreground bg-transparent border-none outline-none cursor-pointer max-w-[200px] truncate"
      >
        {bibles.map((b) => (
          <option key={b.id} value={b.id}>
            {b.abbreviation !== b.name ? `${b.abbreviation} — ${b.name}` : b.name}
          </option>
        ))}
      </select>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function BibleReader() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const bookId = searchParams.get("book");
  const chapterId = searchParams.get("chapter");
  const paramBibleId = searchParams.get("bibleId");

  const [translationId, setTranslationId] = useState<string>(
    paramBibleId || localStorage.getItem(TRANSLATION_KEY) || "",
  );
  const [showAudio, setShowAudio] = useState(false);

  // Fetch Bibles (translation list)
  const { data: biblesRes, isLoading: biblesLoading } = useQuery({
    queryKey: ["bibles"],
    queryFn: getBibles,
    staleTime: 30 * 60_000,
  });
  const bibles = biblesRes?.data ?? [];

  // Set default translation once bibles load
  useEffect(() => {
    if (bibles.length > 0 && !translationId) {
      const fallback = bibles[0].id;
      setTranslationId(fallback);
      localStorage.setItem(TRANSLATION_KEY, fallback);
    }
  }, [bibles, translationId]);

  const handleTranslationChange = (id: string) => {
    setTranslationId(id);
    localStorage.setItem(TRANSLATION_KEY, id);
  };

  // Books for selected translation
  const { data: booksRes, isLoading: booksLoading } = useQuery({
    queryKey: ["books", translationId],
    queryFn: () => getBooks(translationId),
    enabled: !!translationId,
    staleTime: 30 * 60_000,
  });
  const books = booksRes?.data ?? [];

  // Resolve friendly book names (e.g. "1 Thessalonians") to ID (e.g. "1TH")
  const matchedBook = books.find(
    (b) =>
      b.id.toLowerCase() === bookId?.toLowerCase() ||
      b.name.toLowerCase() === bookId?.toLowerCase()
  );

  const resolvedBookId = matchedBook ? matchedBook.id : bookId;

  let resolvedChapterId = chapterId;
  if (matchedBook && chapterId) {
    if (chapterId.toLowerCase().startsWith(matchedBook.name.toLowerCase())) {
      resolvedChapterId = matchedBook.id + chapterId.substring(matchedBook.name.length);
    } else if (chapterId.toLowerCase().startsWith(bookId!.toLowerCase())) {
      resolvedChapterId = matchedBook.id + chapterId.substring(bookId!.length);
    }
  }

  // Chapters for selected book
  const { data: chaptersRes, isLoading: chaptersLoading } = useQuery({
    queryKey: ["chapters", translationId, resolvedBookId],
    queryFn: () => getChapters(translationId, resolvedBookId!),
    enabled: !!translationId && !!resolvedBookId && !resolvedChapterId,
    staleTime: 30 * 60_000,
  });
  const chapters = chaptersRes?.data ?? [];

  // Chapter content
  const { data: chapterRes, isLoading: chapterLoading } = useQuery({
    queryKey: ["chapter", translationId, resolvedChapterId],
    queryFn: () => getChapter(translationId, resolvedChapterId!),
    enabled: !!translationId && !!resolvedChapterId,
    staleTime: 10 * 60_000,
  });
  const chapterData = chapterRes?.data?.chapter;
  const reflection = chapterRes?.data?.reflection;

  // Audio bibles
  const { data: audioBiblesRes } = useQuery({
    queryKey: ["audio-bibles"],
    queryFn: getAudioBibles,
    staleTime: 60 * 60_000,
  });
  const audioBibleId = audioBiblesRes?.data?.[0]?.id;

  // Audio for current chapter
  const { data: audioRes, isLoading: audioLoading } = useQuery({
    queryKey: ["audio-chapter", audioBibleId, resolvedChapterId],
    queryFn: () => getAudioChapter(audioBibleId!, resolvedChapterId!),
    enabled: !!audioBibleId && !!resolvedChapterId && showAudio,
    staleTime: 30 * 60_000,
  });
  const audioData = audioRes?.data;

  // Bookmarks
  const { data: bookmarksRes } = useQuery({
    queryKey: ["scripture-bookmarks"],
    queryFn: getBookmarks,
    staleTime: 60_000,
  });
  const bookmarkedRefs = new Set((bookmarksRes?.data ?? []).map((b) => b.verseReference));

  const addBM = useMutation({
    mutationFn: addBookmark,
    onSuccess: () => { toast.success("Bookmarked"); queryClient.invalidateQueries({ queryKey: ["scripture-bookmarks"] }); },
  });
  const removeBM = useMutation({
    mutationFn: removeBookmark,
    onSuccess: () => { toast.success("Bookmark removed"); queryClient.invalidateQueries({ queryKey: ["scripture-bookmarks"] }); },
  });

  const handleToggleBookmark = (verse: Verse) => {
    const existing = (bookmarksRes?.data ?? []).find(
      (b) => b.verseReference === verse.reference,
    );

    if (existing) {
      removeBM.mutate(existing.id || (existing as any)._id);
    } else {
      addBM.mutate({
        bibleId: translationId,
        chapterId: resolvedChapterId!,
        verseReference: verse.reference,
        verseText: verse.text,
      });
    }
  };

  const goToBook = (bid: string) => setSearchParams({ book: bid });
  const goToChapter = (cid: string) => setSearchParams({ book: resolvedBookId!, chapter: cid });
  const goBack = () => {
    if (resolvedChapterId) setSearchParams({ book: resolvedBookId! });
    else if (resolvedBookId) setSearchParams({});
  };

  const navigateChapter = (cid: string | null) => {
    if (!cid) return;
    setSearchParams({ book: resolvedBookId!, chapter: cid });
    setShowAudio(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Group books into OT/NT
  const OT_COUNT = 39;
  const otBooks = books.slice(0, OT_COUNT);
  const ntBooks = books.slice(OT_COUNT);

  const currentBook = books.find((b) => b.id === resolvedBookId);

  // ── BOOK LIST ──
  if (!bookId && !chapterId) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {booksLoading ? (
          <GridSkeleton count={12} />
        ) : (
          <>
            {otBooks.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  Old Testament
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {otBooks.map((book) => (
                    <button
                      key={book.id}
                      type="button"
                      onClick={() => goToBook(book.id)}
                      className="text-left px-4 py-3 rounded-xl border border-border hover:border-accent/40 hover:bg-accent/5 transition-all group"
                    >
                      <p className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors truncate">
                        {book.name}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {ntBooks.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  New Testament
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ntBooks.map((book) => (
                    <button
                      key={book.id}
                      type="button"
                      onClick={() => goToBook(book.id)}
                      className="text-left px-4 py-3 rounded-xl border border-border hover:border-accent/40 hover:bg-accent/5 transition-all group"
                    >
                      <p className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors truncate">
                        {book.name}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  // ── CHAPTER LIST ──
  if (bookId && !chapterId) {
    return (
      <div className="max-w-2xl mx-auto space-y-5">
        <button
          type="button"
          onClick={goBack}
          className="flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline"
        >
          <ChevronLeft className="w-4 h-4" />
          All Books
        </button>

        <div>
          <h2 className="text-2xl font-bold text-foreground mb-1">
            {currentBook?.nameLong ?? currentBook?.name ?? bookId}
          </h2>
          <p className="text-sm text-muted-foreground">Select a chapter</p>
        </div>

        {chaptersLoading ? (
          <div className="grid grid-cols-5 sm:grid-cols-8 gap-2 animate-pulse">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="h-10 bg-muted rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
            {chapters.map((ch) => (
              <button
                key={ch.id}
                type="button"
                onClick={() => goToChapter(ch.id)}
                className="h-10 rounded-lg border border-border text-sm font-semibold text-foreground hover:border-accent hover:bg-accent hover:text-white transition-all"
              >
                {ch.number}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── CHAPTER READER ──
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back + header row */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goBack}
            className="flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline"
          >
            <ChevronLeft className="w-4 h-4" />
            {currentBook?.name ?? resolvedBookId}
          </button>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          {biblesLoading ? (
            <div className="h-8 w-32 bg-muted animate-pulse rounded-lg" />
          ) : (
            <div className="bg-muted/50 hover:bg-muted/80 transition-colors rounded-full px-3 py-1">
              <TranslationSelector
                bibles={bibles}
                selected={translationId}
                onChange={handleTranslationChange}
              />
            </div>
          )}

          {audioBibleId && (
            <button
              type="button"
              onClick={() => setShowAudio((v) => !v)}
              className={cn(
                "flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all",
                showAudio
                  ? "bg-accent text-white border-accent"
                  : "border-border text-muted-foreground hover:border-accent hover:text-accent",
              )}
            >
              {audioLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Volume2 className="w-3.5 h-3.5" />}
              Audio
            </button>
          )}
        </div>
      </div>

      {/* Chapter heading */}
      <h2 className="text-2xl font-bold text-foreground">
        {chapterData?.reference ?? resolvedChapterId}
      </h2>

      {/* Audio player */}
      {showAudio && (
        <div>
          {audioLoading ? (
            <div className="h-16 bg-muted animate-pulse rounded-2xl" />
          ) : audioData?.audioUrl ? (
            <AudioPlayer audioUrl={audioData.audioUrl} reference={audioData.reference} />
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground p-4 bg-muted/30 rounded-2xl">
              <AlertCircle className="w-4 h-4" />
              Audio unavailable for this chapter.
            </div>
          )}
        </div>
      )}

      {/* Verses */}
      <Card padding="lg">
        {chapterLoading ? (
          <VerseSkeleton />
        ) : chapterData?.verses?.length ? (
          <VerseList
            verses={chapterData.verses}
            bookmarkable
            bookmarkedRefs={bookmarkedRefs}
            onBookmark={handleToggleBookmark}
          />
        ) : (
          <p className="text-sm text-muted-foreground italic">No verses found.</p>
        )}
      </Card>

      {/* Reflection (collapsed by default in reader) */}
      {reflection && <ReflectionPanel reflection={reflection} defaultOpen={false} />}

      {/* Chapter navigation */}
      {chapterData && (
        <div className="flex items-center justify-between gap-4 pt-2 pb-6">
          <Button
            variant="outline"
            className="gap-1.5"
            disabled={!chapterData.prevChapterId}
            onClick={() => navigateChapter(chapterData.prevChapterId)}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            className="gap-1.5"
            disabled={!chapterData.nextChapterId}
            onClick={() => navigateChapter(chapterData.nextChapterId)}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

    </div>
  );
}
