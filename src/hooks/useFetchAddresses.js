// src/hooks/useFetchAddresses.js
import { useEffect, useEffectEvent } from 'react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import * as actionTypes from '@context/locationInputActionTypes';
import config from '@utils/config';
import {
  SERVICES,
  STORAGE_KEYS,
  LOCATION_NOT_FOUND_MSG,
} from '@utils/constants';
import fetchAddresses from '@/utils/fetchAddresses';
import { getIsDevMode } from '@utils/devMode';

const QUERY_KEY = 'address';

/** 10 minutes */
const STALE_MS = 10 * 60_000;
/** 10 minutes */
const GC_MS = 10 * 60_000;
const MAX_RETRIES = 1;

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
 * - Retries on error
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
   * Sets or switches `geoService` but does not store in local.
   * - Skips if `isSwitch` is `false` and `geoService` is already set
   * - Falls back to `'Nominatim'` if `isSwitch` is `true` and `geoService` is not set
   * @param {boolean} [isSwitch=true]
   */
  const updateService = useEffectEvent((isSwitch = true) => {
    if (!isSwitch && geoService) return;
    const service =
      !geoService || geoService !== SERVICES.nominatim
        ? SERVICES.nominatim
        : SERVICES.baidu;
    setGeoService(service, true);
    getIsDevMode() && console.debug('🧽 Cleared:', STORAGE_KEYS.service);
    console.debug('🌎 [Geocoding service]', service);
  });

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
    retry: (failureCount, error) => {
      if (axios.isCancel(error) || error.message === LOCATION_NOT_FOUND_MSG) {
        return false;
      }
      return failureCount < MAX_RETRIES;
    },
    // retry: false,
    retryDelay: config.RETRY_DELAY,
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
        /* If other errors occur, switch the service but don't store (fall back to Nominatim) */
        updateService(true);
        setErrorMessage((prev) => ({ ...prev, location: error.message }));
      }
      dispatch({ type: actionTypes.SET_LOCATION_VALID, payload: false });
      dispatch({ type: actionTypes.CLEAR_SUGGESTIONS });
    } else if (data) {
      /* If was using the fallback service (Nominatim), set it but don't store */
      updateService(false);
      /* Update state */
      dispatch({ type: actionTypes.SET_SUGGESTIONS, payload: data });
    }
  }, [data, error, dispatch, setGeoService, setErrorMessage]);
};

export default useFetchAddresses;
