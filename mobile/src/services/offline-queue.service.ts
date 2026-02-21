import {
  getOfflineQueue,
  setOfflineQueue,
  type OfflineQueueItem,
} from "@/lib/storage/offline-queue-storage";

function createQueueId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const offlineQueueService = {
  async getPendingActions(): Promise<OfflineQueueItem[]> {
    return getOfflineQueue();
  },

  async enqueue(
    payload: Omit<OfflineQueueItem, "id" | "createdAt">,
  ): Promise<OfflineQueueItem> {
    const queue = await getOfflineQueue();
    const item: OfflineQueueItem = {
      id: createQueueId(),
      createdAt: new Date().toISOString(),
      ...payload,
    };

    queue.push(item);
    await setOfflineQueue(queue);

    return item;
  },

  async remove(id: string): Promise<void> {
    const queue = await getOfflineQueue();
    const nextQueue = queue.filter((item) => item.id !== id);
    await setOfflineQueue(nextQueue);
  },

  async flush(
    executor: (item: OfflineQueueItem) => Promise<void>,
  ): Promise<void> {
    const queue = await getOfflineQueue();

    for (const item of queue) {
      await executor(item);
      await this.remove(item.id);
    }
  },
};
