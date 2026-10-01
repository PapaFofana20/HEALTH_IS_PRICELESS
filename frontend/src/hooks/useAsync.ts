import { useCallback, useEffect, useState } from 'react';
import type { DependencyList } from 'react';

export interface AsyncState<T> {
  data: T | undefined;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
  setData: (updater: (previous: T | undefined) => T | undefined) => void;
}

/**
 * Minimal data-fetching hook (loading / error / data / refetch).
 * Works with any promise-based service: mock API today, REST or Supabase tomorrow.
 */
export function useAsync<T>(fetcher: () => Promise<T>, deps: DependencyList = []): AsyncState<T> {
  const [data, setDataState] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    fetcher()
      .then((result) => {
        if (!active) return;
        setDataState(result);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(err instanceof Error ? err : new Error(String(err)));
        setLoading(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce]);

  const refetch = useCallback(() => setNonce((n) => n + 1), []);
  const setData = useCallback(
    (updater: (previous: T | undefined) => T | undefined) => setDataState((previous) => updater(previous)),
    [],
  );

  return { data, loading, error, refetch, setData };
}
