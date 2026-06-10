import { baseUrl } from "@/constants/api";
import { getInMemoryToken } from "@/api/helper";
import {
  getOfflineQueue,
  removeFromOfflineQueue,
  incrementRetryCount,
  type QueuedMutation,
} from "./offlineQueue";

const MAX_RETRIES = 5;
let isSyncing = false;

async function executeQueuedMutation(item: QueuedMutation): Promise<boolean> {
  const token = getInMemoryToken();
  const url = `${baseUrl}${item.path}`;

  const response = await fetch(url, {
    method: item.method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
    body: item.body ? JSON.stringify(item.body) : undefined,
  });

  return response.ok;
}

export type SyncResult = {
  synced: number;
  failed: number;
  remaining: number;
};

export async function flushOfflineQueue(): Promise<SyncResult> {
  if (isSyncing || !navigator.onLine) {
    return { synced: 0, failed: 0, remaining: getOfflineQueue().length };
  }

  isSyncing = true;
  let synced = 0;
  let failed = 0;

  try {
    const queue = getOfflineQueue();

    for (const item of queue) {
      if (item.retryCount >= MAX_RETRIES) {
        failed++;
        continue;
      }

      try {
        const ok = await executeQueuedMutation(item);
        if (ok) {
          removeFromOfflineQueue(item.id);
          synced++;
        } else {
          incrementRetryCount(item.id);
          failed++;
          break;
        }
      } catch {
        incrementRetryCount(item.id);
        failed++;
        break;
      }
    }
  } finally {
    isSyncing = false;
  }

  return {
    synced,
    failed,
    remaining: getOfflineQueue().length,
  };
}
