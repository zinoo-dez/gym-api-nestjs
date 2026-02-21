import type { PropsWithChildren } from "react";

import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";

import {
  createAppQueryClient,
  createAppQueryPersister,
} from "@/lib/api/query-client";

const queryClient = createAppQueryClient();
const queryPersister = createAppQueryPersister();

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: queryPersister,
        maxAge: 24 * 60 * 60 * 1000,
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
