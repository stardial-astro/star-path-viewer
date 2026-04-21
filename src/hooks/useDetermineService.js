// src/hooks/useDetermineService.js
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import * as actionTypes from '@context/locationInputActionTypes';
import { SERVICES, STORAGE_KEYS } from '@utils/constants';
import { checkNominatimAccessibility } from '@utils/apiUtils';
import { getIsDevMode } from '@utils/devMode';

const QUERY_KEY = 'geoServiceStatus';

const STALE_MS = 0;
/** 5 seconds */
const GC_MS = 5_000;

const hashes = window.location.hash.substring(1).split('&');
const forceInCn = hashes.includes('cn');

const isTest = import.meta.env.VITEST;

/**
 * Calls `checkNominatimAccessibility` to determine the available geocoding service.
 * - Skips determination if `geoService` is already set (from localStorage or previous run)
 *   unless force in CN
 * - Updates `geoService` on status change
 * - If online -> offline, clears the saved service from local storage
 * Uses TanStack Query:
 * - Pauses while offline and resume/refetch when connectivity returns
 * - Automatic caching
 * - Prevents multiple identical requests
 * - No retries on error
 * - Always refetches on mount/reconnect
 * - Syncs `serviceChecking`
 * @param {boolean} isDelayedOnline
 * @param {OfflineStateObj} offlineState
 * @param {GeoService | null} geoService
 * @param {GeoService} reverseGeoServiceCn
 * @param {ReactDispatch} dispatch
 * @param {(service: GeoService | null, noLocal?: boolean) => void} setGeoService
 */
const useDetermineService = (
  isDelayedOnline,
  offlineState,
  geoService,
  reverseGeoServiceCn,
  dispatch,
  setGeoService,
) => {
  const isEnabled = (!geoService || forceInCn) && isDelayedOnline && !isTest;
  const { data, isPaused, isFetching } = useQuery({
    queryKey: [QUERY_KEY, forceInCn, isDelayedOnline],
    queryFn: () => checkNominatimAccessibility(forceInCn),
    enabled: isEnabled,
    initialData: null,
    networkMode: 'online',
    staleTime: STALE_MS,
    gcTime: GC_MS,
    retry: false,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
    refetchOnReconnect: 'always',
  });

  useEffect(() => {
    /* Sync loading state */
    dispatch({
      type: isFetching
        ? actionTypes.SET_SERVICE_CHECKING_ON
        : actionTypes.SET_SERVICE_CHECKING_OFF,
    });
  }, [isFetching, dispatch]);

  /* If online -> offline, clear the saved service */
  useEffect(() => {
    if (offlineState.dialogOpen) {
      /* Clear the stored service from local storage */
      localStorage.removeItem(STORAGE_KEYS.service);
      getIsDevMode() && console.debug('🧽 Cleared:', STORAGE_KEYS.service);
      /* Clear all */
      // setGeoService(null, true);
      // getIsDevMode() && console.debug('🧽 Cleared: geoService');
    }
  }, [offlineState.dialogOpen, setGeoService]);

  useEffect(() => {
    if (isPaused) return;
    /* Determine the geocoding service (fall back to Nominatim) */
    const service =
      data?.isAccessible !== false ? SERVICES.nominatim : SERVICES.baidu;
    /* If not in CN but Nominatim is not accessible (e.g., via proxy)
     * do not save to local storage and clear existing value
     */
    const noLocal = data !== null && !data.isAccessible && !data.isInCn;
    /* Update state and ref */
    setGeoService(service, noLocal);
    getIsDevMode() &&
      noLocal &&
      console.debug('🧽 Cleared:', STORAGE_KEYS.service);
    data !== null &&
      console.debug(
        `🌎 [Geocoding service] ${service}${noLocal ? ' (temporary)' : ''}`,
      );
    service !== SERVICES.nominatim &&
      console.debug('🌎 [GPS service]', reverseGeoServiceCn);
  }, [isPaused, data, reverseGeoServiceCn, setGeoService]);
};

export default useDetermineService;
