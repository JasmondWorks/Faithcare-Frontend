import type { QueryClient } from "@tanstack/react-query";

const CACHE_KEY = "faithcare-query-cache";
const MAX_AGE_MS = 1000 * 60 * 60 * 24; // 24 hours
const MAX_ENTRIES = 80;
const SAVE_DEBOUNCE_MS = 500;

type PersistedEntry = {
  queryKey: unknown[];
  data: unknown;
  dataUpdatedAt: number;
};

type PersistedCache = {
  savedAt: number;
  entries: PersistedEntry[];
};

let saveTimer: ReturnType<typeof setTimeout> | null = null;

function serializeKey(queryKey: unknown[]): string {
  return JSON.stringify(queryKey);
}

export function hydrateQueryCache(queryClient: QueryClient) {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return;

    const parsed = JSON.parse(raw) as PersistedCache;
    if (Date.now() - parsed.savedAt > MAX_AGE_MS) {
      localStorage.removeItem(CACHE_KEY);
      return;
    }

    for (const entry of parsed.entries) {
      queryClient.setQueryData(entry.queryKey, entry.data, {
        updatedAt: entry.dataUpdatedAt,
      });
    }
  } catch {
    localStorage.removeItem(CACHE_KEY);
  }
}

function saveQueryCache(queryClient: QueryClient) {
  const entries = queryClient
    .getQueryCache()
    .getAll()
    .filter((query) => query.state.status === "success" && query.state.data !== undefined)
    .sort((a, b) => b.state.dataUpdatedAt - a.state.dataUpdatedAt)
    .slice(0, MAX_ENTRIES)
    .map((query) => ({
      queryKey: query.queryKey as unknown[],
      data: query.state.data,
      dataUpdatedAt: query.state.dataUpdatedAt,
    }));

  const payload: PersistedCache = {
    savedAt: Date.now(),
    entries,
  };

  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch {
    // Storage full — drop oldest half and retry once.
    const trimmed: PersistedCache = {
      savedAt: Date.now(),
      entries: entries.slice(0, Math.floor(MAX_ENTRIES / 2)),
    };
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(trimmed));
    } catch {
      // Ignore if still too large.
    }
  }
}

export function setupQueryCachePersistence(queryClient: QueryClient) {
  hydrateQueryCache(queryClient);

  queryClient.getQueryCache().subscribe((event) => {
    if (event.type !== "updated") return;
    if (event.query.state.status !== "success") return;

    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => saveQueryCache(queryClient), SAVE_DEBOUNCE_MS);
  });
}

export function clearPersistedQueryCache() {
  localStorage.removeItem(CACHE_KEY);
}

export function getPersistedQueryKeys(): string[] {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PersistedCache;
    return parsed.entries.map((e) => serializeKey(e.queryKey));
  } catch {
    return [];
  }
}
