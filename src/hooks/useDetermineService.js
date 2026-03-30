// src/hooks/useDetermineService.js
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
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
 * @param {boolean} isDelayedOnline
 * @param {OfflineStateObj} offlineState
 * @param {GeoService | null} geoService
 * @param {(service: GeoService | null, noLocal?: boolean) => void} setGeoService
 */
const useDetermineService = (
  isDelayedOnline,
  offlineState,
  geoService,
  setGeoService,
) => {
  const isEnabled = (!geoService || forceInCn) && isDelayedOnline && !isTest;
  const { data: isAccessible, isPaused } = useQuery({
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

  /* If online -> offline, clear the saved service */
  useEffect(() => {
    if (offlineState.dialogOpen) {
      /* Clear from local storage */
      // localStorage.removeItem(STORAGE_KEYS.service);
      /* Clear all */
      setGeoService(null, true);
      getIsDevMode() && console.debug('Cleared:', STORAGE_KEYS.service);
    }
  }, [offlineState.dialogOpen, setGeoService]);

  useEffect(() => {
    if (isPaused) return;
    /* Set the geocoding service */
    const service =
      isAccessible !== false ? SERVICES.nominatim : SERVICES.baidu;
    /* Update state and ref */
    setGeoService(service, forceInCn);
    console.debug('🌎 [Geocoding service]', service);
  }, [isPaused, isAccessible, setGeoService]);
};

export default useDetermineService;
