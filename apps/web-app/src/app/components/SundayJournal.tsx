import { useLayout } from "../contexts/LayoutContext";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Save, BookOpen, Calendar, Loader2, Trash2, Plus, Edit3 } from "lucide-react";
import {
  createJournalEntry,
  getJournalEntries,
  updateJournalEntry,
  deleteJournalEntry,
} from "@/api/individual/individual";
import { useAuth } from "../providers/AuthProvider";
import { toast } from "react-hot-toast";
import { useSearch } from "../contexts/SearchContext";
import { Card } from "./ui/card";
import { Button } from "@/components/ui/button";
import { JournalEditor } from "./ui/JournalEditor";
import { cn } from "@/lib/utils";
import AppPagination from "./ui/AppPagination";
import { BibleReferenceInput } from "./ui/BibleReferenceInput";

interface JournalEntry {
  _id: string;
  id?: string;
  title: string;
  scriptureReference: string;
  content: string;
  createdAt: string;
}

/** Strip HTML tags to produce a plain-text excerpt for list previews. */
function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function extractEntries(data: unknown): JournalEntry[] {
  if (Array.isArray(data)) return data as JournalEntry[];
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.entries)) return obj.entries as JournalEntry[];
    if (Array.isArray(obj.data)) return obj.data as JournalEntry[];
    if (Array.isArray(obj.docs)) return obj.docs as JournalEntry[];
  }
  return [];
}

export function SundayJournal() {
  const { setHeader } = useLayout();
  useEffect(() => {
    setHeader("Sunday Journal", "Keep a record of your spiritual growth and Sunday messages.");
  }, []);

  const { user } = useAuth();
  const location = useLocation();
  const linkedEntryId = (location.state as { entryId?: string } | null)?.entryId;

  const { searchTerm } = useSearch();

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [currentEntryId, setCurrentEntryId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [scripture, setScripture] = useState("");
  const [content, setContent] = useState("");   // HTML string from TipTap
  const [isSaving, setIsSaving] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  const fetchEntries = async () => {
    setIsFetching(true);
    try {
      const res = await getJournalEntries({ page, limit });


      if (res.success) {
        setEntries(extractEntries(res.data));
        if (res.meta?.totalPages) setTotalPages(res.meta.totalPages);
      }
    } catch {
      // silent — handled by toast on save
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchEntries();
    }
  }, [user?.id, page]);

  useEffect(() => {
    if (!linkedEntryId || entries.length === 0) return;
    const target = entries.find((e) => (e._id || e.id) === linkedEntryId);
    if (target) selectEntry(target);
  }, [linkedEntryId, entries]);

  const filteredEntries = entries.filter((entry) => {
    const q = searchTerm.toLowerCase();
    return (
      (entry.title || "").toLowerCase().includes(q) ||
      stripHtml(entry.content || "").toLowerCase().includes(q) ||
      (entry.scriptureReference || "").toLowerCase().includes(q)
    );
  });

  const handleNewEntry = () => {
    setCurrentEntryId(null);
    setTitle("");
    setScripture("");
    setContent("");
  };

  const selectEntry = (entry: JournalEntry) => {
    const id = entry._id || entry.id;
    if (!id) return;
    setCurrentEntryId(id);
    setTitle(entry.title || "");
    setScripture(entry.scriptureReference || "");
    setContent(entry.content || "");
  };

  const clearForm = () => {
    setTitle("");
    setScripture("");
    setContent("");
  }

  const handleSave = async () => {
    const userId = user?.id;

    if (!title.trim()) { toast.error("Please add a title for your reflection."); return; }
    if (!content || stripHtml(content).trim().length === 0) {
      toast.error("Please write your reflection before saving.");
      return;
    }

    setIsSaving(true);
    const payload = {
      userId,
      title: title.trim(),
      scriptureReference: scripture.trim(),
      content: content.trim(),
    };

    try {
      const res = currentEntryId
        ? await updateJournalEntry(currentEntryId, payload)
        : await createJournalEntry(payload);

      if (res.success) {
        toast.success(currentEntryId ? "Reflection updated." : "Reflection saved.");
        if (!currentEntryId) handleNewEntry();
        fetchEntries()
        clearForm()
      } else {
        toast.error(res.error || "Failed to save.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Delete this journal entry?")) return;
    try {
      const res = await deleteJournalEntry(id);
      if (res.success) {
        toast.success("Entry deleted.");
        if (currentEntryId === id) handleNewEntry();
        fetchEntries();
      }
    } catch {
      toast.error("Failed to delete entry.");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-[1600px] mx-auto w-full">

      {/* ── Left: Document Editor ─────────────────────────────────────── */}
      <Card className="flex-1 flex flex-col" padding="none">

        {/* Document chrome — title + scripture + date */}
        <div className="px-8 pt-10 pb-6 border-b border-border/40">
          {/* Title */}
          <input
            type="text"
            placeholder="Untitled Reflection"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-4xl sm:text-5xl font-bold text-foreground placeholder:text-muted-foreground/20 tracking-tight mb-5 leading-tight"
          />

          {/* Metadata row */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <BibleReferenceInput
              value={scripture}
              onChange={setScripture}
            />
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary/30 rounded-full text-xs font-medium uppercase tracking-widest opacity-40 select-none">
              <Calendar className="w-3 h-3" />
              {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </div>
          </div>
        </div>

        {/* Writing area */}
        <div className="flex-1 px-8 py-8">
          <JournalEditor
            value={content}
            onChange={setContent}
            placeholder="What stood out to you from today's message? Jot down key insights, challenges, or ways you plan to apply what you heard…"
            className="text-lg"
          />
        </div>

        {/* Footer actions */}
        <div className="px-8 py-5 border-t border-border/40 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNewEntry}
            className="text-muted-foreground hover:text-foreground gap-2"
          >
            <Plus className="w-4 h-4" />
            New entry
          </Button>

          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="gap-2 px-6 rounded-xl shadow-md shadow-primary/20"
          >
            {isSaving
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Save className="w-4 h-4" />
            }
            {currentEntryId ? "Update" : "Save reflection"}
          </Button>
        </div>
      </Card>

      {/* ── Right: Records sidebar ────────────────────────────────────── */}
      <div className="w-full lg:w-80 xl:w-96 flex flex-col gap-4 shrink-0">

        {/* Records list */}
        <Card padding="none" className="flex flex-col overflow-hidden h-full">
          <div className="px-5 py-4 border-b border-border/40 flex items-center justify-between">
            <h3 className="font-bold text-foreground flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-accent" />
              {searchTerm ? `Results for "${searchTerm}"` : "Message Records"}
            </h3>
            {entries.length > 0 && (
              <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                {filteredEntries.length}
              </span>
            )}
          </div>

          <div className="overflow-y-auto divide-y divide-border/40">
            {isFetching ? (
              <div className="flex items-center justify-center gap-3 text-muted-foreground min-h-[120px] py-8">
                <Loader2 className="w-5 h-5 animate-spin text-accent" />
                <span className="text-sm font-medium">Syncing…</span>
              </div>
            ) : filteredEntries.length === 0 ? (
              <div className="py-16 px-5 text-center">
                <BookOpen className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground italic">
                  {searchTerm ? `No entries match "${searchTerm}"` : "No entries yet. Start your first reflection."}
                </p>
              </div>
            ) : (
              filteredEntries.map((entry) => {
                const id = entry._id || entry.id;
                const isActive = currentEntryId === id;
                const preview = stripHtml(entry.content || "");

                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => selectEntry(entry)}
                    className={cn(
                      "w-full text-left px-5 py-4 transition-colors group",
                      isActive
                        ? "bg-accent/5 border-l-2 border-l-accent"
                        : "hover:bg-muted/30 border-l-2 border-l-transparent",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className={cn(
                        "font-semibold text-sm truncate flex-1 transition-colors",
                        isActive ? "text-accent" : "text-foreground group-hover:text-accent/80",
                      )}>
                        {entry.title || "Untitled"}
                      </p>
                      <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); selectEntry(entry); }}
                          className="p-1 rounded-md hover:bg-accent/10 text-accent transition-colors"
                        >
                          <Edit3 className="w-5 h-5" strokeWidth={1.5} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDelete(id!, e)}
                          className="p-1 rounded-md hover:bg-red-50 text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>

                    {entry.scriptureReference && (
                      <p className="text-xs text-accent/70 font-medium mb-1 flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {entry.scriptureReference}
                      </p>
                    )}

                    {preview && (
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {preview}
                      </p>
                    )}

                    <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wider font-medium mt-2">
                      {entry.createdAt
                        ? new Date(entry.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                        : "Draft"}
                    </p>
                  </button>
                );
              })
            )}
          </div>
          {totalPages > 1 && (
            <div className="border-t border-border/40 pb-2">
              <AppPagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </Card>

        {/* Habit tip */}
        <Card variant="accent" padding="sm">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-semibold text-accent block mb-1">📖 Spiritual Habit</span>
            Consistently recording your Sunday messages helps you retain 80% more of what you learned. Review your records weekly!
          </p>
        </Card>
      </div>

    </div>
  );
}
