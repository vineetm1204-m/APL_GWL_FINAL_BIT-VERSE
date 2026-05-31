/**
 * Application Providers
 * -----------------------
 * Wraps the app with all required context providers.
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthListener } from '../hooks/useAuth';

// ─── React Query Client ──────────────────────────────────────────────

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// ─── Auth Initializer ────────────────────────────────────────────────

function AuthInitializer({ children }: { children: React.ReactNode }) {
  useAuthListener();
  return <>{children}</>;
}

// ─── Root Provider ───────────────────────────────────────────────────

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer>{children}</AuthInitializer>
    </QueryClientProvider>
  );
}
