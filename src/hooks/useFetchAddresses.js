// src/hooks/useFetchAddresses.js
import { useEffect } from 'react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import * as actionTypes from '@context/locationInputActionTypes';
import config from '@utils/config';
import { SERVICES, LOCATION_NOT_FOUND_MSG } from '@utils/constants';
import fetchAddresses from '@/utils/fetchAddresses';

const QUERY_KEY = 'address';

/** 10 minutes */
const STALE_MS = 10 * 60_000;
/** 10 minutes */
const GC_MS = 10 * 60_000;

/**
 * Calls `fetchAddresses` to fetch address suggestions.
 * - Skips searching if force skipping, GPS is loading, or the input is cleared
 * - Updates `suggestions` on status change
 * Uses TanStack Query:
 * - Pauses while offline and resume/refetch when connectivity returns
 * - Automatic caching
 * - Prevents multiple identical requests
 * - Retries on error (delay with exponential backoff)
 * - Syncs `suggestionsLoading`
 * @param {string} searchTerm
 * @param {GeoService | null} geoService
 * @param {number} refreshCount
 * @param {boolean} skipFetch
 * @param {boolean} gpsLoading
 * @param {ReactDispatch} dispatch
 * @param {ReactSetState<ErrorObj>} setErrorMessage
 */
const useFetchAddresses = (
  searchTerm,
  geoService,
  refreshCount,
  skipFetch,
  gpsLoading,
  dispatch,
  setErrorMessage,
) => {
  const { data, error, isFetching } = useQuery({
    queryKey: [QUERY_KEY, searchTerm.toLowerCase(), geoService, refreshCount],
    queryFn: () =>
      fetchAddresses(
        searchTerm.toLowerCase(),
        geoService || SERVICES.nominatim,
      ),
    enabled: !!geoService && !skipFetch && !gpsLoading && !!searchTerm,
    networkMode: 'online',
    staleTime: STALE_MS,
    gcTime: GC_MS,
    retry: (failureCount, error) => {
      if (axios.isCancel(error)) return false;
      return failureCount < config.MAX_RETRIES;
    },
    retryDelay: (attemptIndex) =>
      Math.min(config.RETRY_DELAY * 2 ** attemptIndex, config.RETRY_DELAY_MAX),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    /* Sync loading state */
    dispatch({
      type: isFetching
        ? actionTypes.SET_SUGGESTIONS_LOADING_ON
        : actionTypes.SET_SUGGESTIONS_LOADING_OFF,
    });
  }, [isFetching, dispatch]);

  useEffect(() => {
    if (error) {
      /* Show errors, set invalid, and clear suggestions */
      if (error.message === LOCATION_NOT_FOUND_MSG) {
        dispatch({
          type: actionTypes.SET_ADDRESS_ERROR,
          payload: error.message,
        });
      } else {
        setErrorMessage((prev) => ({ ...prev, location: error.message }));
      }
      dispatch({ type: actionTypes.SET_LOCATION_VALID, payload: false });
      dispatch({ type: actionTypes.CLEAR_SUGGESTIONS });
    } else if (data) {
      /* Update state */
      dispatch({ type: actionTypes.SET_SUGGESTIONS, payload: data });
    }
  }, [data, error, dispatch, setErrorMessage]);
};

export default useFetchAddresses;
