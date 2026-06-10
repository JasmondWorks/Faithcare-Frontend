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
      className="fixed bottom-4 left-1/2 z-[100] flex -translate-x-1/2 items-center gap-2 rounded-full border border-border bg-background/95 px-4 py-2 text-sm shadow-lg backdrop-blur-sm"
    >
      {!online ? (
        <>
          <WifiOff className="h-4 w-4 shrink-0 text-amber-600" />
          <span>You're offline — cached data is available. Changes will sync when reconnected.</span>
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
