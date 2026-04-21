// src/utils/reverseGeocode.js
import axios from 'axios';
// import fetchJsonp from 'fetch-jsonp';
import { SERVICES, CN_TIMEZONES, LOC_UNKNOWN_ID } from './constants';
import apiClient from './apiClient';
import { getIsDevMode } from './devMode';

const NOMINATIM_TIMEOUT = 5_000;
const BAIDU_TIMEOUT = 6_000;
const TIANDITU_TIMEOUT = 6_000;

const NO_DATA_ERR_MSG = 'No data returned from ';

const nominatimReverseUrl = import.meta.env.VITE_NOMINATIM_REVERSE_URL;

/**
 * @param {CoordObj} coords
 * @param {AbortSignal} signal
 * @returns {Promise<AddressItem>} The address object.
 * @throws {Error} If location is not found.
 */
const reverseWithNominatim = async (coords, signal) => {
  const isDevMode = getIsDevMode();
  const response = await apiClient.get(nominatimReverseUrl, {
    params: {
      lat: coords.latitude,
      lon: coords.longitude,
      format: 'json',
      addressdetails: 1,
      zoom: 10, // City level
      email: import.meta.env.VITE_EMAIL,
    },
    timeout: NOMINATIM_TIMEOUT,
    signal,
  });
  const duration = response.config.metadata?.duration;
  if (isDevMode && duration) {
    console.debug(`⏳ (Nominatim-reverse) Request took ${duration}ms`);
  }
  /** @type {NominatimSchema} */
  const data = response.data;
  if (!data)
    throw new Error(NO_DATA_ERR_MSG + 'Nominatim reverse geocoding API');
  isDevMode && console.debug('[lat,lng]', coords, '\n[Address]', data);
  const display_name = data.display_name;
  const id =
    data.osm_id?.toString() || `${coords.latitude},${coords.longitude}`;
  return {
    lat: coords.latitude.toString(),
    lng: coords.longitude.toString(),
    display_name: display_name || LOC_UNKNOWN_ID,
    id: display_name ? id : LOC_UNKNOWN_ID,
    addresstype: '',
  };
};

/**
 * @param {CoordObj} coords
 * @param {AbortSignal} signal - (unused)
 * @returns {Promise<AddressItem>} The address object.
 * @throws {Error} If location is not found.
 */
const reverseWithBaidu = async (coords, signal) => {
  const isDevMode = getIsDevMode();
  const response = await apiClient.get('/api/baidu-reverse', {
    params: {
      location: `${coords.latitude},${coords.longitude}`,
      output: 'json',
      coordtype: 'wgs84ll',
      region_data_source: 2,
    },
    timeout: BAIDU_TIMEOUT,
    signal,
  });
  const duration = response.config.metadata?.duration;
  if (duration && isDevMode) {
    console.debug(`⏳ (Baidu-reverse) Request took ${duration}ms`);
  }
  const res = response.data;
  isDevMode && console.debug('[lat,lng]', coords, '\n[Address]', res);
  isDevMode && console.debug('[Headers]', response.headers);
  if (res?.status !== 0) {
    throw new Error(res?.message || `Status: ${res?.status}`);
  }
  /** @type {BaiduReverseSchema} */
  const data = res.result;
  if (!data) throw new Error(NO_DATA_ERR_MSG + 'Baidu reverse geocoding API');
  const display_name = data?.formatted_address;
  const id =
    data?.addressComponent?.adcode || `${coords.latitude},${coords.longitude}`;
  return {
    lat: coords.latitude.toString(),
    lng: coords.longitude.toString(),
    display_name: display_name || LOC_UNKNOWN_ID,
    id: display_name ? id : LOC_UNKNOWN_ID,
    addresstype: '',
  };
};

// /**
//  * @param {CoordObj} coords
//  * @param {AbortSignal} signal - (unused)
//  * @returns {Promise<AddressItem>} The address object.
//  * @throws {Error} If location is not found.
//  */
// /* eslint-disable-next-line no-unused-vars */
// const reverseWithBaiduJsonp = async (coords, signal) => {
//   const url =
//     `${baiduReverseUrl}?` +
//     `ak=${import.meta.env.VITE_BAIDU_API_KEY}&` +
//     `location=${coords.latitude},${coords.longitude}&` +
//     'output=json&' +
//     'coordtype=wgs84ll' +
//     'region_data_source=2';
//   const response = await fetchJsonp(url, {
//     jsonpCallback: 'callback',
//     timeout: BAIDU_TIMEOUT,
//   });
//   const res = await response.json();
//   /** @type {BaiduReverseSchema} */
//   const data = res?.result;
//   if (!data) throw new Error(NO_DATA_ERR_MSG + 'Baidu reverse geocoding API');
//   getIsDevMode() && console.debug('[lat,lng]', coords, '\n[Address]', data);
//   const display_name = data?.formatted_address;
//   const id =
//     data?.addressComponent?.adcode || `${coords.latitude},${coords.longitude}`;
//   return {
//     lat: coords.latitude.toString(),
//     lng: coords.longitude.toString(),
//     display_name: display_name || LOC_UNKNOWN_ID,
//     id: display_name ? id : LOC_UNKNOWN_ID,
//     addresstype: '',
//   };
// };

/**
 * @param {CoordObj} coords
 * @param {AbortSignal} signal
 * @returns {Promise<AddressItem>} The address object.
 * @throws {Error} If location is not found.
 */
const reverseWithTianditu = async (coords, signal) => {
  const isDevMode = getIsDevMode();
  const postStr = JSON.stringify({
    lon: coords.longitude,
    lat: coords.latitude,
    ver: 1,
  });
  const response = await apiClient.get('/api/tianditu-reverse', {
    params: {
      postStr,
      type: 'geocode',
    },
    timeout: TIANDITU_TIMEOUT,
    signal,
  });
  const duration = response.config.metadata?.duration;
  if (isDevMode && duration) {
    console.debug(`⏳ (Tianditu-reverse) Request took ${duration}ms`);
  }
  const res = response.data;
  isDevMode && console.debug('[lat,lng]', coords, '\n[Address]', res);
  isDevMode && console.debug('[Headers]', response.headers);
  if (res?.status !== '0') {
    throw new Error(res?.msg || `Status: ${res?.status}`);
  }
  /** @type {TiandituReverseSchema} */
  const data = res.result;
  if (!data)
    throw new Error(NO_DATA_ERR_MSG + 'Tianditu reverse geocoding API');
  const display_name = data.formatted_address;
  const id =
    data.addressComponent?.town_code ||
    `${coords.latitude},${coords.longitude}`;
  return {
    lat: coords.latitude.toString(),
    lng: coords.longitude.toString(),
    display_name: display_name || LOC_UNKNOWN_ID,
    id: display_name ? id : LOC_UNKNOWN_ID,
    addresstype: '',
  };
};

/**
 * Fetches reverse geocoding data.
 * - If `service` is `null`, falls back to `'Nominatim'`, or `serviceCn` if in CN
 * @param {CoordObj} coords
 * @param {GeoService | null} service - The reverse geocoding service (`'Nominatim'` | `'Baidu'`).
 * @param {GeoService} serviceCn - The CN reverse geocoding service (`'Tianditu'` | `'Baidu'`).
 * @param {AbortSignal} signal
 * @returns {Promise<{ res: AddressItem | null, serviceInUse: GeoService }>}
 *   The address object or `null` if aborted, and the reverse geocoding service in use.
 */
const reverseGeocode = async (coords, service, serviceCn, signal) => {
  /* The serviceInUse returned when aborted is a dummy that will not be used */
  if (signal?.aborted) return { res: null, serviceInUse: service || serviceCn };

  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const isInCn = CN_TIMEZONES.has(tz);
  let serviceInUse = isInCn
    ? serviceCn
    : service === SERVICES.baidu
      ? serviceCn
      : service || SERVICES.nominatim;

  const isDevMode = getIsDevMode();
  let reverseFn = reverseWithNominatim;
  let reverseFallbackFn = reverseWithBaidu;
  /** @type {GeoService} */
  let serviceFallback = SERVICES.baidu;
  if (serviceInUse === SERVICES.tianditu) {
    reverseFn = reverseWithTianditu;
  } else if (serviceInUse === SERVICES.baidu) {
    reverseFn = reverseWithBaidu;
    reverseFallbackFn = reverseWithTianditu;
    serviceFallback = SERVICES.tianditu;
  }

  /** @type {AddressItem} */
  let res;
  /* If possibly in CN, try the defined CN service first ------------ */
  if (serviceInUse !== SERVICES.nominatim) {
    /* If not in CN and not mocking coordinates, warn and skip */
    if (!isInCn && (coords.longitude < 73 || coords.longitude > 136)) {
      /* Try Nominatim below */
      isDevMode &&
        console.debug(
          `⚠️ You are not in China. Reverse geocoding for this location is unavailable.` +
            '\nSwitching to Nominatim...',
        );
      serviceInUse = SERVICES.nominatim;
      reverseFn = reverseWithNominatim;
    } else {
      /* Try the specified CN service */
      try {
        res = await reverseFn(coords, signal);
        if (res.id !== LOC_UNKNOWN_ID) {
          return { res, serviceInUse };
        } else {
          /* Try Nominatim below (this should not happen) */
          isDevMode &&
            console.debug(
              `🤔 Hmm... ${serviceInUse} reverse geocoding for this location is unavailable.` +
                '\nSwitching to Nominatim...',
            );
          serviceInUse = SERVICES.nominatim;
          reverseFn = reverseWithNominatim;
        }
      } catch (err) {
        if (Error.isError(err)) {
          if (
            axios.isCancel(err) ||
            err.message === 'cancelled' ||
            err.name === 'AbortError'
          ) {
            isDevMode && console.debug('Reverse geocoding cancelled.');
            return { res: null, serviceInUse };
          }
          console.error(err.message);
        }
        /* Try the fallback service below */
        isDevMode &&
          console.debug(
            `🔴 ${serviceInUse} reverse geocoding failed.\nSwitching to ${serviceFallback}...`,
          );
        serviceInUse = serviceFallback;
        reverseFn = reverseFallbackFn;
      }
    }
  }
  /* Fetch with Nominatim or the fallback CN service ---------------- */
  try {
    res = await reverseFn(coords, signal);
    return { res, serviceInUse };
  } catch (err) {
    if (Error.isError(err)) {
      if (
        axios.isCancel(err) ||
        err.message === 'cancelled' ||
        err.name === 'AbortError'
      ) {
        isDevMode && console.debug('Reverse geocoding cancelled.');
        return { res: null, serviceInUse };
      }
      console.error(err.message);
    }
    isDevMode && console.debug(`🔴 ${serviceInUse} reverse geocoding failed.`);
    res = {
      lat: coords.latitude.toString(),
      lng: coords.longitude.toString(),
      display_name: LOC_UNKNOWN_ID,
      id: LOC_UNKNOWN_ID,
      addresstype: '',
    };
    return { res, serviceInUse };
  }
};

export default reverseGeocode;
