// src/hooks/useDebouncedFetchNameSuggestions.js
import { useEffect } from 'react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import * as actionTypes from '@context/starInputActionTypes';
import config from '@utils/config';
import { HIP_OUT_OF_RANGE_MSG, HIP_NOT_FOUND_MSG } from '@utils/constants';
import { fetchNameSuggestions } from '@utils/fetchNameSuggestions';

const QUERY_KEY = 'starName';

/** 5 minutes */
const STALE_MS = 5 * 60_000;
/** 5 minutes */
const GC_MS = 5 * 60_000;

/**
 * Calls `fetchNameSuggestions` to fetch star name suggestions.
 * - Skips searching if force skipping or the input is cleared
 * - Updates `hipList` when fetching
 * - Updates star `suggestions` on status change
 * Uses TanStack Query:
 * - Pauses while offline and resume/refetch when connectivity returns
 * - Automatic caching
 * - Prevents multiple identical requests
 * - Retries on error
 * @param {string} searchTerm
 * @param {number} refreshCount
 * @param {boolean} skipFetch
 * @param {HipItem[] | null} hipList
 * @param {(data: HipItem[]) => void} setHipList
 * @param {ReactDispatch} dispatch
 * @param {ReactSetState<ErrorObj>} setErrorMessage
 */
const useDebouncedFetchNameSuggestions = (
  searchTerm,
  refreshCount,
  skipFetch,
  hipList,
  setHipList,
  dispatch,
  setErrorMessage,
) => {
  const { data, error } = useQuery({
    queryKey: [QUERY_KEY, searchTerm, hipList, refreshCount],
    queryFn: () => fetchNameSuggestions(searchTerm, hipList, setHipList),
    enabled: !skipFetch && !!searchTerm,
    networkMode: 'online',
    staleTime: STALE_MS,
    gcTime: GC_MS,
    retry: (failureCount, error) => {
      if (axios.isCancel(error)) return false;
      return failureCount < config.MAX_RETRIES;
    },
    retryDelay: config.RETRY_DELAY,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    if (error) {
      /* Show errors, set invalid, and clear suggestions */
      if (
        error.message === HIP_OUT_OF_RANGE_MSG ||
        error.message === HIP_NOT_FOUND_MSG
      ) {
        dispatch({
          type: actionTypes.SET_STAR_HIP_ERROR,
          payload: error.message,
        });
      } else {
        setErrorMessage((prev) => ({ ...prev, star: error.message }));
      }
      dispatch({ type: actionTypes.SET_STAR_VALID, payload: false });
      dispatch({ type: actionTypes.CLEAR_SUGGESTIONS });
    } else if (data) {
      /* Update state */
      dispatch({ type: actionTypes.SET_SUGGESTIONS, payload: data });
    }
  }, [data, error, dispatch, setErrorMessage]);
};

export default useDebouncedFetchNameSuggestions;
