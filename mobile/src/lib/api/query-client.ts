import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueryClient } from "@tanstack/react-query";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";

import { QUERY_CACHE_KEY } from "@/constants/env";

export function createAppQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        staleTime: 60 * 1000,
        gcTime: 30 * 60 * 1000,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

export function createAppQueryPersister() {
  return createAsyncStoragePersister({
    storage: AsyncStorage,
    key: QUERY_CACHE_KEY,
  });
}
