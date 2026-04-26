// src/utils/fetchGeolocation.js
import axios from 'axios';
import apiClient from './apiClient';
import { isDevMode } from './devMode';

const GEO_TIMEOUT = 6_000;
const GEO_IP_TIMEOUT = 5_000;

const ipGeoServiceUrl = 'https://ipinfo.io/json';

const NO_DATA_ERR_MSG = 'No data returned from ipinfo.io';
const GEO_ERR_MSG = 'errors:gps_error'; // i18n key
const NO_GEO_MSG = 'errors:gps_not_supported'; // i18n key

/**
 * Fetches IP geolocation.
 * @param {AbortSignal} signal
 * @returns {Promise<CoordObj | null>} The data.
 * @throws {Error} If request failed.
 */
const fetchIpLocation = async (signal) => {
  if (signal?.aborted) return null;

  try {
    const response = await apiClient.get(ipGeoServiceUrl, {
      timeout: GEO_IP_TIMEOUT,
      signal,
    });
    const data = response.data;
    if (!data) {
      console.error(NO_DATA_ERR_MSG);
      throw new Error(GEO_ERR_MSG);
    }

    /* https://ipinfo.io/json
     * {
     *  "ip": "xxx.xxx.xxx.xxx",
     *  "city": "Vancouver",
     *  "region": "British Columbia",
     *  "country": "CA",
     *  "loc": "49.2497,-123.1193",
     *  "org": "...",
     *  "postal": "...",
     *  "timezone": "America/Vancouver",
     *  "readme": "https://ipinfo.io/missingauth"
     *}
     */
    isDevMode && console.debug('[IP]', data.ip);
    /** @type {string[]} */
    const [latitude, longitude] = data.loc.split(',');
    return {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
    };
  } catch (err) {
    if (axios.isCancel(err)) throw err;
    console.error(
      `Error fetching IP geolocation: ${Error.isError(err) ? err.message : err}`,
    );
    throw new Error(GEO_ERR_MSG, { cause: err });
  }
};

/**
 * Fetches geolocation coordinates using `navigator.geolocation`.
 * - Keeps only 4 fraction digits
 * @param {number} geoMaxAge
 * @param {AbortSignal} signal
 * @returns {Promise<{ coords: CoordObj | null, isIpGeo: boolean }>}
 * - `coords`: The address object, or `null` if aborted
 * - `isIpGeo` `true` if using IP geolocation. Defaults to `false`.
 * @throws {Error} If request failed.
 */
const fetchGeolocation = async (geoMaxAge, signal) => {
  let isIpGeo = false;
  if (signal?.aborted) return { coords: null, isIpGeo };

  if ('geolocation' in navigator) {
    isDevMode && console.debug('> Querying geolocation...');
    /** @type {GeolocationPosition | { coords: CoordObj } | null} */
    const position = await new Promise((resolve, reject) => {
      /* Get the latitude and longitude using navigator.geolocation */
      navigator.geolocation.getCurrentPosition(
        /* Success */
        (position) => resolve(position),

        /* If fails, fall back to IP geolocation */
        async (err) => {
          if (signal?.aborted) resolve(null);
          console.warn('getCurrentPosition failed:', err.message);
          isDevMode && console.debug('> Querying IP geolocation...');
          try {
            const ipLocation = await fetchIpLocation(signal);
            isIpGeo = true;
            resolve(
              ipLocation
                ? {
                    coords: {
                      latitude: ipLocation.latitude,
                      longitude: ipLocation.longitude,
                    },
                  }
                : null,
            );
          } catch (ipErr) {
            if (axios.isCancel(ipErr)) {
              isDevMode && console.debug('IP geolocation fetching cancelled.');
              resolve(null);
            }
            reject(ipErr);
          }
        },
        {
          enableHighAccuracy: false,
          timeout: GEO_TIMEOUT,
          maximumAge: geoMaxAge,
        },
      );
    });

    if (!position || signal?.aborted) return { coords: null, isIpGeo };

    const { latitude, longitude } = position.coords;
    /* Mock for testing Baidu (tz will still be the actual one) ----- */
    // const { latitude, longitude } = { latitude: 31.23, longitude: 121.474 }; // TODO: mock
    // const { latitude, longitude } = { latitude: 32.0553, longitude: 118.7795 }; // TODO: mock
    /* -------------------------------------------------------------- */
    return {
      coords: {
        latitude: parseFloat(latitude.toFixed(4)),
        longitude: parseFloat(longitude.toFixed(4)),
      },
      isIpGeo,
    };
  } else {
    /* Geolocation not supported by this browser */
    throw new Error(NO_GEO_MSG);
  }
};

export default fetchGeolocation;
