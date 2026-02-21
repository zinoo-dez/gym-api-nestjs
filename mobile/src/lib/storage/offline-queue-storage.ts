import AsyncStorage from "@react-native-async-storage/async-storage";

import { OFFLINE_QUEUE_KEY } from "@/constants/env";

export interface OfflineQueueItem {
  id: string;
  method: "POST" | "PATCH" | "DELETE";
  path: string;
  body?: unknown;
  createdAt: string;
}

export async function getOfflineQueue(): Promise<OfflineQueueItem[]> {
  const rawQueue = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);

  if (!rawQueue) {
    return [];
  }

  try {
    return JSON.parse(rawQueue) as OfflineQueueItem[];
  } catch {
    await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
    return [];
  }
}

export async function setOfflineQueue(
  queue: OfflineQueueItem[],
): Promise<void> {
  await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
}
