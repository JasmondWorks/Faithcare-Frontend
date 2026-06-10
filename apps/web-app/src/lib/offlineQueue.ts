export type HttpMethod = "POST" | "PATCH" | "PUT" | "DELETE";

export type QueuedMutation = {
  id: string;
  method: HttpMethod;
  path: string;
  body?: object;
  createdAt: string;
  retryCount: number;
};

const QUEUE_KEY = "faithcare-offline-queue";

function readQueue(): QueuedMutation[] {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) ?? "[]") as QueuedMutation[];
  } catch {
    return [];
  }
}

function writeQueue(queue: QueuedMutation[]) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export async function enqueueMutation(
  item: Pick<QueuedMutation, "method" | "path" | "body">,
): Promise<QueuedMutation> {
  const entry: QueuedMutation = {
    ...item,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    retryCount: 0,
  };
  const queue = readQueue();
  queue.push(entry);
  writeQueue(queue);
  window.dispatchEvent(new CustomEvent("offline-queue-changed"));
  return entry;
}

export function getOfflineQueue(): QueuedMutation[] {
  return readQueue();
}

export function getOfflineQueueCount(): number {
  return readQueue().length;
}

export function removeFromOfflineQueue(id: string) {
  writeQueue(readQueue().filter((item) => item.id !== id));
  window.dispatchEvent(new CustomEvent("offline-queue-changed"));
}

export function incrementRetryCount(id: string) {
  const queue = readQueue().map((item) =>
    item.id === id ? { ...item, retryCount: item.retryCount + 1 } : item,
  );
  writeQueue(queue);
}

export function clearOfflineQueue() {
  localStorage.removeItem(QUEUE_KEY);
  window.dispatchEvent(new CustomEvent("offline-queue-changed"));
}
