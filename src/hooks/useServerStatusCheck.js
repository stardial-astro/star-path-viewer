// src/hooks/useServerStatusCheck.js
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { checkServerAccessibility } from '@utils/apiUtils';

const QUERY_KEY = 'serverStatus';

/** 6 hours */
const REFETCH_INTERVAL_MS = 6 * 60 * 60_000;
/** 1 hour */
const STALE_MS = 60 * 60_000;
/** 6 hours */
const GC_MS = 6 * 60 * 60_000;

const isTest = import.meta.env.VITEST;

/**
 * Calls `checkServerAccessibility` to probe server on mount and periodically.
 * - Updates `errorMessage.server` on status change
 * Uses TanStack Query:
 * - Pauses while offline and resume/refetch when connectivity returns
 * - Automatic caching
 * - Prevents multiple identical requests
 * - Re-probes periodically
 * - No retries on error
 * - Always refetches on mount/reconnect
 * @param {boolean} isDelayedOnline
 * @param {ReactSetState<ErrorObj>} setErrorMessage
 */
const useServerStatusCheck = (isDelayedOnline, setErrorMessage) => {
  const { error, isPaused } = useQuery({
    queryKey: [QUERY_KEY, isDelayedOnline],
    queryFn: checkServerAccessibility,
    enabled: isDelayedOnline && !isTest,
    networkMode: 'online',
    refetchInterval: (query) =>
      query.state.error ? false : REFETCH_INTERVAL_MS,
    staleTime: STALE_MS,
    gcTime: GC_MS,
    retry: false,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
    refetchOnReconnect: 'always',
  });

  useEffect(() => {
    if (isPaused) return;
    /* Show/Clear errors */
    const msg = error?.message ?? '';
    setErrorMessage((prev) => ({ ...prev, server: msg }));
  }, [isPaused, error, setErrorMessage]);
};

export default useServerStatusCheck;
