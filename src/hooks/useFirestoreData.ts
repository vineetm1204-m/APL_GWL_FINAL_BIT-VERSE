/**
 * useFirestoreData Hook
 * -----------------------
 * Generic hook for fetching data from Firestore with Zustand integration.
 */

import { useEffect, useState, useCallback, useRef } from 'react';

interface UseFirestoreDataOptions<T> {
  fetchFn: () => Promise<T>;
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
  enabled?: boolean;
}

interface UseFirestoreDataReturn<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useFirestoreData<T>({
  fetchFn,
  onSuccess,
  onError,
  enabled = true,
}: UseFirestoreDataOptions<T>): UseFirestoreDataReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    if (!enabled) return;
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchFn();
      if (mountedRef.current) {
        setData(result);
        onSuccess?.(result);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'An error occurred';
      if (mountedRef.current) {
        setError(message);
        onError?.(message);
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [fetchFn, onSuccess, onError, enabled]);

  useEffect(() => {
    mountedRef.current = true;
    fetchData();
    return () => {
      mountedRef.current = false;
    };
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}
