import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24,
      staleTime: 1000 * 60 * 5,
      networkMode: "offlineFirst",
      retry: (failureCount) => {
        if (!navigator.onLine) return false;
        return failureCount < 2;
      },
    },
    mutations: {
      networkMode: "offlineFirst",
    },
  },
});
