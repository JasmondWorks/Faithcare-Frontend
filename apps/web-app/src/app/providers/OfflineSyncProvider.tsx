import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { setupQueryCachePersistence } from "@/lib/offlineQueryCache";
import { getOfflineQueueCount } from "@/lib/offlineQueue";
import { flushOfflineQueue } from "@/lib/syncOfflineQueue";

type OfflineSyncContextValue = {
  pendingCount: number;
  syncNow: () => Promise<void>;
};

const OfflineSyncContext = createContext<OfflineSyncContextValue | null>(null);

export function useOfflineSync() {
  const ctx = useContext(OfflineSyncContext);
  if (!ctx) {
    throw new Error("useOfflineSync must be used within OfflineSyncProvider");
  }
  return ctx;
}

export function OfflineSyncProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [pendingCount, setPendingCount] = useState(getOfflineQueueCount);

  const refreshPendingCount = useCallback(() => {
    setPendingCount(getOfflineQueueCount());
  }, []);

  const syncNow = useCallback(async () => {
    if (!navigator.onLine) return;

    const result = await flushOfflineQueue();
    refreshPendingCount();

    if (result.synced > 0) {
      toast.success(
        `Synced ${result.synced} offline change${result.synced > 1 ? "s" : ""}.`,
        { duration: 2500 },
      );
      await queryClient.invalidateQueries();
    }
  }, [queryClient, refreshPendingCount]);

  useEffect(() => {
    setupQueryCachePersistence(queryClient);
  }, [queryClient]);

  useEffect(() => {
    const handleQueueChange = () => refreshPendingCount();
    window.addEventListener("offline-queue-changed", handleQueueChange);
    return () => window.removeEventListener("offline-queue-changed", handleQueueChange);
  }, [refreshPendingCount]);

  useEffect(() => {
    const handleOnline = () => void syncNow();
    const handleVisible = () => {
      if (document.visibilityState === "visible" && navigator.onLine) {
        void syncNow();
      }
    };

    void syncNow();

    window.addEventListener("online", handleOnline);
    document.addEventListener("visibilitychange", handleVisible);

    return () => {
      window.removeEventListener("online", handleOnline);
      document.removeEventListener("visibilitychange", handleVisible);
    };
  }, [syncNow]);

  return (
    <OfflineSyncContext.Provider value={{ pendingCount, syncNow }}>
      {children}
    </OfflineSyncContext.Provider>
  );
}
