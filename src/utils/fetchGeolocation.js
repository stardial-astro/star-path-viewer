// src/utils/fetchGeolocation.js
import axios from 'axios';
import apiClient from './apiClient';
import reverseGeocode from './reverseGeocode';
import { getIsDevMode } from './devMode';
import { SERVICES, STORAGE_KEYS } from './constants';

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
    getIsDevMode() && console.debug('[IP]', data.ip);
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
 * Fetches geolocation using `navigator.geolocation`.
 * - Updates `geoService` and/or `reverseGeoServiceCn` if any of them is actually in use
 * @param {GeoService | null} service - The reverse geocoding service.
 * @param {GeoService} serviceCn - The CN reverse geocoding service.
 * @param {number} geoMaxAge
 * @param {(service: GeoService | null, noLocal?: boolean) => void} setGeoService
 * @param {ReactSetState<GeoService>} setReverseGeoServiceCn
 * @param {AbortSignal} signal
 * @returns {Promise<AddressItem | null>} The address object, or `null` if aborted.
 * @throws {Error} If request failed.
 */
const fetchGeolocation = async (
  service,
  serviceCn,
  geoMaxAge,
  setGeoService,
  setReverseGeoServiceCn,
  signal,
) => {
  if (signal?.aborted) return null;

  const isDevMode = getIsDevMode();

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

    if (!position || signal?.aborted) return null;

    // const { latitude, longitude } = position.coords;
    /* Mock for testing Baidu (tz will still be the actual one) ----- */
    // const { latitude, longitude } = { latitude: 31.23, longitude: 121.474 }; // TEST
    const { latitude, longitude } = { latitude: 32.055257, longitude: 118.779539 }; // TEST
    /* -------------------------------------------------------------- */

    /* Get the address from the latitude and longitude */
    const { res, serviceInUse } = await reverseGeocode(
      { latitude, longitude },
      service,
      serviceCn,
      signal,
    );
    if (!res) return null;
    isDevMode && console.debug('[Resolved location]', res);

    /* If successful, update the service but don't store */
    if (serviceInUse === SERVICES.nominatim) {
      if (service !== serviceInUse) {
        setGeoService(serviceInUse, true);
        isDevMode && console.debug('🧽 Cleared:', STORAGE_KEYS.service);
        console.debug(`🌎 [Geocoding service] ${serviceInUse} (temporary)`);
      }
    } else {
      /* CN */
      if (service !== SERVICES.baidu) {
        setGeoService(SERVICES.baidu, true);
        isDevMode && console.debug('🧽 Cleared:', STORAGE_KEYS.service);
        console.debug(`🌎 [Geocoding service] ${SERVICES.baidu} (temporary)`);
      }
      if (serviceCn !== serviceInUse) {
        setReverseGeoServiceCn(serviceInUse);
        console.debug('🌎 [GPS service]', serviceInUse);
      }
    }

    return res;
  } else {
    /* Geolocation not supported by this browser */
    throw new Error(NO_GEO_MSG);
  }
};

export default fetchGeolocation;
