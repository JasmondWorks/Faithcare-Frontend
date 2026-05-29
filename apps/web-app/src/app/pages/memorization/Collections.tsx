import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Library } from "lucide-react";
import { getCollections, enqueueCollection } from "@/api/memorization/memorization";
import { CollectionCard } from "../../components/memorization/CollectionCard";
import { useLayout } from "../../contexts/LayoutContext";

const THEMES = [
  { label: "All", value: "" },
  { label: "Anxiety", value: "anxiety" },
  { label: "Identity", value: "identity" },
  { label: "Faith", value: "faith" },
  { label: "Strength", value: "strength" },
];

function CollectionsSkeleton() {
  return (
    <div className="grid md:grid-cols-2 gap-4 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-40 bg-muted rounded-xl" />
      ))}
    </div>
  );
}

export default function Collections() {
  const { setHeader } = useLayout();
  const [theme, setTheme] = useState("");

  useEffect(() => {
    setHeader("Collections", "Curated verse packs to memorize together.");
  }, []);

  const { data: res, isLoading } = useQuery({
    queryKey: ["mem-collections", theme],
    queryFn: () => getCollections(theme || undefined),
    staleTime: 5 * 60_000,
  });

  const collections = res?.data ?? [];

  const handleEnqueue = async (id: string) => {
    const result = await enqueueCollection(id);
    return result.data ?? { added: 0, total: 0 };
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Theme filter pills */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
        {THEMES.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setTheme(t.value)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${
              theme === t.value
                ? "bg-accent text-white border-accent shadow-sm shadow-accent/20"
                : "border-border text-muted-foreground hover:border-accent/40 hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <CollectionsSkeleton />
      ) : collections.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <Library className="w-10 h-10 mx-auto text-muted-foreground/30" />
          <p className="font-bold text-foreground">No collections found</p>
          <p className="text-sm text-muted-foreground">Try a different theme or check back later.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {collections.map((c) => (
            <CollectionCard key={c.id} collection={c} onEnqueue={handleEnqueue} />
          ))}
        </div>
      )}
    </div>
  );
}
