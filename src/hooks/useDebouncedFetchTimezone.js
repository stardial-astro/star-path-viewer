// src/hooks/useDebouncedFetchTimezone.js
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import * as actionTypes from '@context/locationInputActionTypes';
import config from '@utils/config';
import fetchTimezone from '@utils/fetchTimezone';
import { getIsDevMode } from '@utils/devMode';

const QUERY_KEY = 'timezone';

/** dev: 1 minute; prod: 10 minutes */
const STALE_MS = getIsDevMode() ? 60_000 : 10 * 60_000;
/** 10 minutes */
const GC_MS = 10 * 60_000;

/**
 * Calls `GeoTZ` to fetch the time zone ID.
 * - Skips fetching if force skipping or the input is cleared
 * - Updates `tz` on status change
 * - Warns if failed (`tz` will be determined by the server)
 * Uses TanStack Query:
 * - Pauses while offline and resume/refetch when connectivity returns
 * - Automatic caching
 * - Prevents multiple identical requests
 * - Retries on error
 * @param {string} lat - Latitude (-90 <= `lat` <=90).
 * @param {string} lng - Longitude (-180 <= `lng` <=180).
 * @param {boolean} skipTz
 * @param {ReactDispatch} dispatch
 * @throws {Error} If result is invalid.
 */
const useDebouncedFetchTimezone = (lat, lng, skipTz, dispatch) => {
  const isEnabled = !skipTz && !!lat && !!lng;
  const { data, error } = useQuery({
    queryKey: [QUERY_KEY, lat, lng],
    queryFn: () => fetchTimezone(lat, lng),
    enabled: isEnabled,
    networkMode: 'online',
    staleTime: STALE_MS,
    gcTime: GC_MS,
    retry: (failureCount, error) => {
      if (error.name === 'AbortError') return false;
      return failureCount < config.MAX_RETRIES;
    },
    retryDelay: config.RETRY_DELAY,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    if (isEnabled) {
      const tz = data && !error ? data : '';
      tz && console.debug('📍 [Timezone ID]', tz);
      /* Update state */
      dispatch({ type: actionTypes.SET_TZ, payload: tz });
    }
  }, [isEnabled, data, error, dispatch]);
};

export default useDebouncedFetchTimezone;
