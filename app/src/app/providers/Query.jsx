import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * TanStack Query — conventions de clés : ["ressource", ...filtres] (doc 04).
 * retry : 1 (les 5xx sont déjà rejoués par l'interceptor axios), staleTime 30s.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

export function QueryProvider({ children }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
