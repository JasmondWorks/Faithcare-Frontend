import { useState } from "react";
import { ChevronDown, ChevronUp, Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "../../components/ui/card";
import type { VerseCollectionItem } from "@/api/memorization/types";

interface CollectionCardProps {
  collection: VerseCollectionItem;
  onEnqueue: (id: string) => Promise<{ added: number; total: number }>;
}

const THEME_COLORS: Record<string, string> = {
  anxiety: "bg-blue-100 text-blue-700 border-blue-200",
  identity: "bg-purple-100 text-purple-700 border-purple-200",
  faith: "bg-amber-100 text-amber-700 border-amber-200",
  strength: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

export function CollectionCard({ collection, onEnqueue }: CollectionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ added: number; total: number } | null>(null);

  const handleEnqueue = async () => {
    setLoading(true);
    try {
      const res = await onEnqueue(collection.id);
      setResult(res);
    } finally {
      setLoading(false);
    }
  };

  const themeColor = THEME_COLORS[collection.theme.toLowerCase()] ?? "bg-neutral-100 text-neutral-600 border-neutral-200";

  return (
    <Card padding="default" className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-foreground text-sm">{collection.title}</h3>
            <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider", themeColor)}>
              {collection.theme}
            </span>
            {!collection.isGlobal && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20 uppercase tracking-wider">
                Your Church
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{collection.description}</p>
        </div>
        <span className="text-[11px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full shrink-0">
          {collection.verseIds.length} verse{collection.verseIds.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Expandable verse list */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
      >
        {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        {expanded ? "Hide verses" : "Preview verses"}
      </button>

      {expanded && (
        <div className="space-y-2 border-t border-border/50 pt-3">
          {collection.verseIds.map((verse) => (
            <div key={verse.id} className="flex items-start gap-2.5">
              <span className="text-[10px] font-bold text-accent bg-accent/10 px-1.5 py-0.5 rounded-full shrink-0 mt-0.5">
                {verse.reference}
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 font-['Georgia',serif]">
                {verse.text.length > 60 ? verse.text.slice(0, 60) + "…" : verse.text}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Enqueue button */}
      <button
        type="button"
        onClick={handleEnqueue}
        disabled={loading || (result !== null && result.added === 0)}
        className={cn(
          "w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all",
          result !== null && result.added === 0
            ? "bg-muted text-muted-foreground cursor-default"
            : result !== null
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-accent text-white hover:bg-accent/90 active:scale-[.98]",
          loading && "opacity-70 cursor-not-allowed",
        )}
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
        ) : result !== null && result.added === 0 ? (
          <><Check className="w-4 h-4" /> Already in your queue</>
        ) : result !== null ? (
          <><Check className="w-4 h-4" /> Added {result.added} of {result.total} verses</>
        ) : (
          <><Plus className="w-4 h-4" /> Add All to Queue</>
        )}
      </button>
    </Card>
  );
}
