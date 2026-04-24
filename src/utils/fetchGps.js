// src/utils/fetchGps.js
import queryClient from '@/queryClient';
import * as actionTypes from '@context/locationInputActionTypes';
import config from './config';
import {
  SERVICES,
  DEFAULT_SERVICE_CN,
  STORAGE_KEYS,
  LOC_INPUT_TYPES,
  LOC_UNKNOWN_ID,
} from './constants';
import fetchGeolocation from './fetchGeolocation';
import reverseGeocode from './reverseGeocode';
import { isDevMode, forceInCn } from './devMode';

const QUERY_KEY = 'gps';

/** dev: 5 minutes; prod: 30 minutes */
const STALE_MS = isDevMode ? 5 * 60_000 : 30 * 60_000;
/** 30 minutes */
const GC_MS = 30 * 60_000;

/**
 * Calls `fetchGeolocation` to fetch geolocation and sets the coordinates and address.
 * - Skips fetching if no coordinates
 * - Updates `geoService` and/or `reverseGeoServiceCn` if any of them is actually in use
 * - Updates `location`, `searchTerm`, and `lastSelectedTermRef` if successful
 * - If no valid address returned, toggles to coordinate mode
 * - Sets `tz` returned from the built-in method if not force in CN
 * - Turns off `gpsLoading` on exit
 * Uses TanStack Query:
 * - Automatic caching
 * - Prevents multiple identical requests
 * - Retries on error (delay with exponential backoff)
 * @param {GeoService | null} service - The reverse geocoding service.
 * @param {GeoService} serviceCn - The CN reverse geocoding service.
 * @param {ReactRef<string>} lastSelectedTermRef
 * @param {(service: GeoService | null, noLocal?: boolean) => void} setGeoService
 * @param {ReactSetState<GeoService>} setReverseGeoServiceCn
 * @param {ReactDispatch} dispatch
 * @returns {Promise<Error | null>} The error, or `null` if successful/aborted.
 */
const fetchGps = async (
  service,
  serviceCn,
  lastSelectedTermRef,
  setGeoService,
  setReverseGeoServiceCn,
  dispatch,
) => {
  const controller = new AbortController();
  dispatch({ type: actionTypes.SET_GPS_LOADING_ON });

  try {
    /* Get coordinates ---------------------------------------------- */
    const coords = await fetchGeolocation(STALE_MS, controller.signal);
    if (!coords) return null;

    /* Get the address from the latitude and longitude -------------- */
    const { res, serviceInUse } = await queryClient.fetchQuery({
      queryKey: [QUERY_KEY, coords, service, serviceCn],
      queryFn: () =>
        reverseGeocode(coords, service, serviceCn, controller.signal),
      staleTime: STALE_MS,
      gcTime: GC_MS,
      retry: (failureCount, _error) => {
        if (controller.signal.aborted) return false;
        return failureCount < config.MAX_RETRIES - 1;
      },
      retryDelay: (attemptIndex) =>
        Math.min(
          config.RETRY_DELAY * 2 ** attemptIndex,
          config.RETRY_DELAY_MAX,
        ),
    });

    if (!res) return null;
    isDevMode && console.debug('[Resolved location]', res);
    isDevMode && console.debug('[Service in use]', serviceInUse);

    /* Update coordinates if not aborted and no errors */
    dispatch({
      type: actionTypes.SET_LOCATION,
      payload: {
        lat: res.lat,
        lng: res.lng,
        id: res.id,
      },
    });

    if (res.id !== LOC_UNKNOWN_ID) {
      /* If the address is valid, update search term and ref */
      lastSelectedTermRef.current = res.display_name.trim();
      dispatch({
        type: actionTypes.SET_SEARCH_TERM,
        payload: res.display_name,
      });
      /* Also update tz if not force in CN */
      if (!forceInCn) {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        dispatch({ type: actionTypes.SET_TZ, payload: tz });
        console.debug('📍 [Timezone ID]', tz);
      }
    } else {
      /* If no valid address returned, toggle to coordinate mode and return */
      dispatch({
        type: actionTypes.SET_INPUT_TYPE,
        payload: LOC_INPUT_TYPES.coord,
      });
      return null;
    }

    /* If successful, update the primary service but don't store */
    if (serviceInUse === SERVICES.nominatim) {
      if (service !== serviceInUse) {
        setGeoService(serviceInUse, true);
        isDevMode && console.debug('🧽 Cleared:', STORAGE_KEYS.service);
        console.debug(`🌎 [Geocoding service] ${serviceInUse} (temporary)`);
      }
    } else {
      /* If using any CN service */
      /* Set the primary service to the default CN service but don't store */
      if (service === SERVICES.nominatim) {
        setGeoService(DEFAULT_SERVICE_CN, true);
        isDevMode && console.debug('🧽 Cleared:', STORAGE_KEYS.service);
        console.debug(
          `🌎 [Geocoding service] ${DEFAULT_SERVICE_CN} (temporary)`,
        );
      }
      /* Update the reverse geocoding service */
      if (serviceCn !== serviceInUse) {
        setReverseGeoServiceCn(serviceInUse);
        console.debug('🌎 [GPS service]', serviceInUse);
      }
    }

    return null;
  } catch (err) {
    if (controller.signal.aborted) {
      isDevMode && console.debug('GPS query cancelled.');
      return null;
    }
    return Error.isError(err) ? err : new Error(`GPS query failed: ${err}`);
  } finally {
    dispatch({ type: actionTypes.SET_GPS_LOADING_OFF });
  }
};

export default fetchGps;
