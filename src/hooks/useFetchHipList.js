// src/hooks/useFetchHipList.js
import { useEffect } from 'react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import config from '@utils/config';
import { fetchAndCacheHipList } from '@/utils/fetchStarNames';

const QUERY_KEY = 'hipList';

/** 5 minutes */
const STALE_MS = 5 * 60_000;
/** 5 minutes */
const GC_MS = 5 * 60_000;

/**
 * Calls `fetchAndCacheHipList` to fetch and cache the HIP ident list.
 * - Skips fetching if already loaded (from localStorage or previous run)
 * - Updates `hipList`
 * Uses TanStack Query:
 * - Pauses while offline and resume/refetch when connectivity returns
 * - Automatic caching
 * - Prevents multiple identical requests
 * - Retries on error (delay with exponential backoff)
 * - Refetches on mount/focus/reconnect if stale
 * @param {HipItem[] | null} hipList
 * @param {(data: HipItem[]) => void} setHipList
 * @param {ReactSetState<ErrorObj>} setErrorMessage
 */
const useFetchHipList = (hipList, setHipList, setErrorMessage) => {
  const { error } = useQuery({
    queryKey: [QUERY_KEY],
    queryFn: () => fetchAndCacheHipList(setHipList),
    enabled: !!hipList,
    networkMode: 'online',
    staleTime: STALE_MS,
    gcTime: GC_MS,
    retry: (failureCount, error) => {
      if (axios.isCancel(error)) return false;
      return failureCount < config.MAX_RETRIES;
    },
    retryDelay: (attemptIndex) =>
      Math.min(config.RETRY_DELAY * 2 ** attemptIndex, config.RETRY_DELAY_MAX),
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  useEffect(() => {
    /* Show/Clear errors */
    const msg = error?.message ?? '';
    setErrorMessage((prev) => ({ ...prev, star: msg }));
  }, [error, setErrorMessage]);
};

export default useFetchHipList;
