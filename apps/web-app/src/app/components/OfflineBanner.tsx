import { WifiOff, CloudUpload } from "lucide-react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useOfflineSync } from "../providers/OfflineSyncProvider";

export function OfflineBanner() {
  const online = useOnlineStatus();
  const { pendingCount } = useOfflineSync();

  if (online && pendingCount === 0) return null;

  return (
    <div
      role="status"
      className="fixed bottom-4 left-1/2 z-[100] flex w-[calc(100vw-2rem)] max-w-sm -translate-x-1/2 items-center gap-2 rounded-2xl border border-border bg-background/95 px-4 py-2.5 text-sm shadow-lg backdrop-blur-sm sm:w-auto sm:max-w-none sm:rounded-full"
    >
      {!online ? (
        <>
          <WifiOff className="h-4 w-4 shrink-0 text-amber-600" />
          <span className="leading-snug">
            <span className="font-medium">You're offline</span>
            <span className="hidden sm:inline"> — cached data is available. Changes will sync when reconnected.</span>
            <span className="sm:hidden text-muted-foreground"> · cached data available</span>
          </span>
        </>
      ) : (
        <>
          <CloudUpload className="h-4 w-4 shrink-0 text-primary animate-pulse" />
          <span>
            Syncing {pendingCount} pending change{pendingCount !== 1 ? "s" : ""}…
          </span>
        </>
      )}
    </div>
  );
}
