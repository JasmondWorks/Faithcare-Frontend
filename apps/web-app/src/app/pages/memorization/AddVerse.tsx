import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, BookOpen, Library, CheckCircle2, AlertCircle } from "lucide-react";
import { searchVerse, addVerse } from "@/api/memorization/memorization";
import { Card } from "../../components/ui/card";
import type { Translation, VerseSearchResult } from "@/api/memorization/types";
import { useLayout } from "../../contexts/LayoutContext";
import { BibleReferenceInput } from "../../components/ui/BibleReferenceInput";

const TRANSLATIONS: Translation[] = ["KJV", "ASV", "WEB"];

export default function AddVerse() {
  const { setHeader } = useLayout();
  const [tab, setTab] = useState<"search" | "collections">("search");
  const [reference, setReference] = useState("");
  const [translation, setTranslation] = useState<Translation>("KJV");
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState(false);
  const [result, setResult] = useState<VerseSearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setHeader("Add Verse", "Find and add a verse to memorize.");
  }, []);

  const handleSearch = async () => {
    if (!reference.trim()) return;
    setSearching(true);
    setResult(null);
    setError(null);
    setAdded(false);
    try {
      const res = await searchVerse(reference.trim(), translation);
      if (res.success && res.data) {
        setResult(res.data);
      } else {
        setError("Verse not found — try a different reference format (e.g. 'Phil 4:13' or 'Philippians 4:13')");
      }
    } finally {
      setSearching(false);
    }
  };

  const handleAdd = async () => {
    if (!result) return;
    setAdding(true);
    try {
      const res = await addVerse({ reference: result.reference, translation });
      if (res.success) setAdded(true);
      else setError("Failed to add verse — please try again.");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Tabs */}
      <div className="flex rounded-xl border border-border overflow-hidden">
        {(["search", "collections"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-all ${
              tab === t
                ? "bg-accent text-white"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {t === "search" ? <Search className="w-4 h-4" /> : <Library className="w-4 h-4" />}
            {t === "search" ? "Search Verse" : "By Collection"}
          </button>
        ))}
      </div>

      {tab === "collections" ? (
        <Card padding="default" className="text-center space-y-4 py-8">
          <Library className="w-10 h-10 mx-auto text-accent" />
          <div className="space-y-1">
            <p className="font-bold text-foreground">Browse Collections</p>
            <p className="text-sm text-muted-foreground">
              Explore curated verse packs and add them all at once.
            </p>
          </div>
          <Link
            to="/memorization/collections"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition-all"
          >
            <Library className="w-4 h-4" /> Go to Collections
          </Link>
        </Card>
      ) : (
        <div className="space-y-5">
          {/* Reference input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Verse Reference
            </label>
            <div className="flex gap-2">
              <BibleReferenceInput
                value={reference}
                onChange={(val) => { setReference(val); setResult(null); setError(null); setAdded(false); }}
                onSelect={(val) => { setReference(val); setTimeout(handleSearch, 0); }}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="e.g. Philippians 4:13"
                className="flex-1"
                wrapperClassName="w-full h-full px-4 py-3 rounded-xl border border-border bg-muted/20 focus-within:ring-2 focus-within:ring-accent focus-within:border-accent transition-all"
                inputClassName="text-sm w-full"
              />
              <select
                value={translation}
                onChange={(e) => setTranslation(e.target.value as Translation)}
                className="px-3 py-2 rounded-xl border border-border bg-muted/20 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer"
              >
                {TRANSLATIONS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSearch}
            disabled={!reference.trim() || searching}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {searching ? (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            {searching ? "Searching…" : "Look Up"}
          </button>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {/* Result card */}
          {result && (
            <Card padding="default" className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-bold text-foreground">{result.reference}</p>
                <span className="text-[10px] font-bold bg-accent/10 text-accent px-2 py-0.5 rounded-full border border-accent/20 uppercase tracking-wider">
                  {result.translation}
                </span>
              </div>
              <p className="text-sm font-['Georgia',serif] text-foreground/80 leading-relaxed italic">
                "{result.text}"
              </p>

              {added ? (
                <div className="flex items-center gap-2 py-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-700 text-sm font-semibold justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                  Added to your queue. Your first review is today.
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={adding}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {adding ? (
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <BookOpen className="w-4 h-4" />
                  )}
                  {adding ? "Adding…" : "Add to Queue"}
                </button>
              )}
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
