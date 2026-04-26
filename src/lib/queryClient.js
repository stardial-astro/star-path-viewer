// src/lib/queryClient.js
import { QueryClient } from '@tanstack/react-query';

/** A singleton `queryClient` with `staleTime` defaults` to 10 seconds and no retry. */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10_000,
      retry: false,
    },
  },
});

export default queryClient;
