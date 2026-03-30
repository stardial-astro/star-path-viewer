// src/utils/fetchCurrentLocation.js
import queryClient from '@/queryClient';
import * as actionTypes from '@context/locationInputActionTypes';
import config from './config';
import { LOC_INPUT_TYPES, LOC_UNKNOWN, LOC_UNKNOWN_ID } from './constants';
import fetchGeolocation from './fetchGeolocation';
import { getIsDevMode } from './devMode';

const QUERY_KEY = 'gps';

const isDevMode = getIsDevMode();

/** dev: 5 minutes; prod: 30 minutes */
const STALE_MS = getIsDevMode() ? 5 * 60_000 : 30 * 60_000;
/** 30 minutes */
const GC_MS = 30 * 60_000;

/**
 * Calls `fetchGeolocation` to fetch geolocation and sets the coordinates and address.
 * - Skips fetching if offline or no service defined
 * - Updates `location`, `searchTerm`, and `lastSelectedTermRef` if successful
 * - If no valid address returned, toggles to coordinate mode
 * - Sets `tz` returned from the built-in method.
 * - Turns off `gpsLoading` on exit
 * Uses TanStack Query:
 * - Automatic caching
 * - Prevents multiple identical requests
 * - Retries on error (delay with exponential backoff)
 * @param {GeoService} service - The geocoding service.
 * @param {ReactRef<string>} lastSelectedTermRef
 * @param {ReactDispatch} dispatch
 * @returns {Promise<Error | null>} The error, or `null` if successful/aborted.
 */
const fetchCurrentLocation = async (service, lastSelectedTermRef, dispatch) => {
  const controller = new AbortController();
  dispatch({ type: actionTypes.SET_GPS_LOADING_ON });

  try {
    const res = await queryClient.fetchQuery({
      queryKey: [QUERY_KEY, service],
      queryFn: () => fetchGeolocation(service, STALE_MS, controller.signal),
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

    /* Update state and ref if not aborted and no errors */
    dispatch({
      type: actionTypes.SET_LOCATION,
      payload: {
        lat: res.lat,
        lng: res.lng,
        id: res.id,
      },
    });
    if (res.display_name !== LOC_UNKNOWN && res.id !== LOC_UNKNOWN_ID) {
      /* If the address is valid, update state and ref */
      lastSelectedTermRef.current = res.display_name;
      dispatch({
        type: actionTypes.SET_SEARCH_TERM,
        payload: res.display_name,
      });
      /* Also update tz */
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      dispatch({ type: actionTypes.SET_TZ, payload: tz });
      console.debug('📍 [Timezone ID]', tz);
    } else {
      /* If no valid address returned, toggle to coordinate mode */
      dispatch({
        type: actionTypes.SET_INPUT_TYPE,
        payload: LOC_INPUT_TYPES.coord,
      });
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

export default fetchCurrentLocation;
