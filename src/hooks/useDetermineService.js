// src/hooks/useDetermineService.js
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import * as actionTypes from '@context/locationInputActionTypes';
import {
  SERVICES,
  DEFAULT_SERVICE,
  DEFAULT_SERVICE_CN,
  DEFAULT_REVERSE_SERVICE_CN,
  STORAGE_KEYS,
} from '@utils/constants';
import { isCST, checkGeoServiceAccessibility } from '@utils/apiUtils';
import {
  isDevMode,
  forceInCn,
  forceBaidu,
  forceQq,
  forceTianditu,
} from '@utils/devMode';

const QUERY_KEY = 'geoServiceStatus';

const STALE_MS = 0;
/** 5 seconds */
const GC_MS = 5_000;

const isTest = import.meta.env.VITEST;

/** @type {GeoService | null} */
const serviceOverride = forceQq
  ? SERVICES.qq
  : forceBaidu
    ? SERVICES.baidu
    : null;

/** @type {GeoService | null} */
const reverseServiceOverride = forceTianditu
  ? SERVICES.tianditu
  : serviceOverride;

/**
 * Calls `checkGeoServiceAccessibility` and determines the available geocoding service.
 * - Skips determination if `geoService` is already set (from `localStorage` or previous run)
 *   unless forcing in CN
 * - Updates `geoService` on status change if checked
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
 * @param {ReactDispatch} dispatch
 * @param {(service: GeoService | null, noLocal?: boolean) => void} setGeoService
 * @param {ReactSetState<GeoService>} setReverseGeoServiceCn
 */
const useDetermineService = (
  isDelayedOnline,
  offlineState,
  geoService,
  dispatch,
  setGeoService,
  setReverseGeoServiceCn,
) => {
  const isEnabled = (!geoService || forceInCn) && isDelayedOnline && !isTest;
  const {
    data: isAccessible,
    isPaused,
    isFetching,
  } = useQuery({
    queryKey: [QUERY_KEY, isDelayedOnline],
    queryFn: checkGeoServiceAccessibility,
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
      isDevMode && console.debug('🧽 Cleared:', STORAGE_KEYS.service);
      /* Clear all */
      // setGeoService(null, true);
      // isDevMode && console.debug('🧽 Cleared: geoService');
    }
  }, [offlineState.dialogOpen, setGeoService]);

  useEffect(() => {
    if (isPaused || isAccessible === null) return;
    /* Determine the primary geocoding service (fall back to DEFAULT_SERVICE) */
    const service = isAccessible
      ? DEFAULT_SERVICE
      : serviceOverride || DEFAULT_SERVICE_CN;
    /* Update the primary service */
    /**
     * Do not store in local and clear existing value if in one of these cases:
     * - System time is not CST but Nominatim is inaccessible,
     *   e.g., using a CN IP outside CN or in CN but system time isn't set to CST
     * - System time is CST but Google is still accessible,
     *   e.g., using a non-CN IP in CN or outside CN but system time is set to CST
     * - Forcing in CN
     */
    const noLocal = isAccessible === isCST || forceInCn;
    setGeoService(service, noLocal);
    isDevMode && noLocal && console.debug('🧽 Cleared:', STORAGE_KEYS.service);
    console.debug(
      `🌎 [Geocoding service] ${service}${noLocal ? ' (temporary)' : ''}`,
    );
    /* If using CN service, update the reverse geocoding service as well */
    if (service !== DEFAULT_SERVICE) {
      const reverseService =
        reverseServiceOverride || DEFAULT_REVERSE_SERVICE_CN;
      setReverseGeoServiceCn(reverseService);
      console.debug('🌎 [GPS service]', reverseService);
    }
  }, [isPaused, isAccessible, setGeoService, setReverseGeoServiceCn]);
};

export default useDetermineService;
