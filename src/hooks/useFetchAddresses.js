// src/hooks/useFetchAddresses.js
import { useEffect, useCallback } from 'react';
// import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import * as actionTypes from '@context/locationInputActionTypes';
// import config from '@utils/config';
import {
  SERVICES,
  DEFAULT_SERVICE_CN,
  STORAGE_KEYS,
  LOCATION_NOT_FOUND_MSG,
  // SERVICE_ERR_MSG,
} from '@utils/constants';
import fetchAddresses from '@/utils/fetchAddresses';
import { isInCn } from '@utils/apiUtils';
import { isDevMode } from '@utils/devMode';

const QUERY_KEY = 'address';

/** 10 minutes */
const STALE_MS = 10 * 60_000;
/** 10 minutes */
const GC_MS = 10 * 60_000;
// const MAX_RETRIES = 1;

/**
 * Calls `fetchAddresses` to fetch address suggestions.
 * - Skips searching if force skipping, GPS is loading, or the input is too short
 * - If `geoService` is `null`, falls back to `'Nominatim'`
 * - If `geoService` is `null`, sets to `'Nominatim'` if successful, otherwise to `'Baidu'`
 * - If error occurs, switch to the other service
 * - Updates `suggestions` on status change
 * Uses TanStack Query:
 * - Pauses while offline and resume/refetch when connectivity returns
 * - Automatic caching
 * - Prevents multiple identical requests
//  * - Retries on error
 * - No retries on error
 * - Syncs `suggestionsLoading`
 * @param {string} searchTerm
 * @param {GeoService | null} geoService
 * @param {number} refreshCount
 * @param {boolean} skipFetch
 * @param {boolean} gpsLoading
 * @param {ReactDispatch} dispatch
 * @param {(service: GeoService | null, noLocal?: boolean) => void} setGeoService
 * @param {ReactSetState<ErrorObj>} setErrorMessage
 */
const useFetchAddresses = (
  searchTerm,
  geoService,
  refreshCount,
  skipFetch,
  gpsLoading,
  dispatch,
  setGeoService,
  setErrorMessage,
) => {
  const isEnabled = !skipFetch && !gpsLoading && searchTerm.trim().length > 1;

  /**
   * Updates `geoService` but does not store in local.
   * - If not enabled, skips
   * - If `geoService` is already set to `DEFAULT_SERVICE_CN` in any case, skips to avoid loops
   * - If `success` is `true` and `geoService` is already set, skips
   * - If `success` is `true` and `geoService` is not set, falls back to `'Nominatim'` or `DEFAULT_SERVICE_CN`
   * - if `success` is `false` and `geoService` is not set, indicating either `'Nominatim'`
   *   or any CN service other than `DEFAULT_SERVICE_CN` fails, switches to `DEFAULT_SERVICE_CN`
   * @param {boolean} [success=true]
   */
  const updateService = useCallback(
    (success = true) => {
      if (geoService === DEFAULT_SERVICE_CN || (success && geoService)) {
        return;
      }
      isDevMode &&
        console.debug(`> Updating service... (current: ${geoService || 'null'})`);
      const service =
        success && !isInCn ? SERVICES.nominatim : DEFAULT_SERVICE_CN;
      setGeoService(service, true);
      isDevMode && console.debug('🧽 Cleared:', STORAGE_KEYS.service);
      console.debug(`🌎 [Geocoding service] ${service} (temporary)`);
    },
    [geoService, setGeoService],
  );

  const { data, error, isFetching } = useQuery({
    queryKey: [
      QUERY_KEY,
      searchTerm.trim().toLowerCase(),
      geoService,
      refreshCount,
    ],
    queryFn: () => fetchAddresses(searchTerm.trim().toLowerCase(), geoService),
    enabled: isEnabled,
    networkMode: 'online',
    staleTime: STALE_MS,
    gcTime: GC_MS,
    // retry: (failureCount, error) => {
    //   if (
    //     axios.isCancel(error) ||
    //     error.message === LOCATION_NOT_FOUND_MSG ||
    //     error.message === SERVICE_ERR_MSG
    //   ) {
    //     return false;
    //   }
    //   return failureCount < MAX_RETRIES;
    // },
    retry: false,
    // retryDelay: config.RETRY_DELAY,
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
    /* Skip if not enabled, avoiding refetch after selection */
    if (!isEnabled) return;
    if (error) {
      /* Show errors, set invalid, and clear suggestions */
      if (error.message === LOCATION_NOT_FOUND_MSG) {
        dispatch({
          type: actionTypes.SET_ADDRESS_ERROR,
          payload: error.message,
        });
      } else {
        /* If other errors occur, switch the service but don't store (fall back to Nominatim) */
        updateService(false);
        setErrorMessage((prev) => ({ ...prev, location: error.message }));
      }
      dispatch({ type: actionTypes.SET_LOCATION_VALID, payload: false });
      dispatch({ type: actionTypes.CLEAR_SUGGESTIONS });
    } else if (data) {
      /* If was using the fallback service (Nominatim), set it but don't store */
      updateService(true);
      /* Update state */
      dispatch({ type: actionTypes.SET_SUGGESTIONS, payload: data });
    }
  }, [
    isEnabled,
    data,
    error,
    updateService,
    dispatch,
    setGeoService,
    setErrorMessage,
  ]);
};

export default useFetchAddresses;
