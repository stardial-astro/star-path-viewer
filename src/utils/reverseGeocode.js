// src/utils/reverseGeocode.js
import axios from 'axios';
// import fetchJsonp from 'fetch-jsonp';
import { SERVICES, LOC_UNKNOWN_ID, LOC_UNKNOWN } from './constants';
import apiClient from './apiClient';
import { getIsDevMode } from './devMode';

const NOMINATIM_TIMEOUT = 5_000;
const BAIDU_TIMEOUT = 6_000;
const TIANDITU_TIMEOUT = 6_000;

const NO_DATA_ERR_MSG = 'No data returned from ';

const nominatimReverseUrl = import.meta.env.VITE_NOMINATIM_REVERSE_URL;

/** @type {GeoService} The reverse geocoding service for CN. Defaults to `'Baidu'`. */
const reverseCn =
  import.meta.env.VITE_REVERSE_SERVICE_CN === SERVICES.tianditu
    ? SERVICES.tianditu
    : SERVICES.baidu;

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
    display_name: display_name || LOC_UNKNOWN,
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
    display_name: display_name || LOC_UNKNOWN,
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
// const reverseWithBaidu = async (coords, signal) => {
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
//     display_name: display_name || LOC_UNKNOWN,
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
    display_name: display_name || LOC_UNKNOWN,
    id: display_name ? id : LOC_UNKNOWN_ID,
    addresstype: '',
  };
};

/**
 * Fetches reverse geocoding data.
 * @param {CoordObj} coords
 * @param {GeoService} service - The geocoding service.
 * @param {AbortSignal} signal
 * @returns {Promise<AddressItem | null>} The address object, or `null` if aborted.
 */
const reverseGeocode = async (coords, service, signal) => {
  if (signal?.aborted) return null;

  const isDevMode = getIsDevMode();
  const reverseCnFallback =
    reverseCn === SERVICES.baidu ? SERVICES.tianditu : SERVICES.baidu;
  const reverseCnFn =
    reverseCn === SERVICES.baidu ? reverseWithBaidu : reverseWithTianditu;
  const reverseCnFallbackFn =
    reverseCn === SERVICES.baidu ? reverseWithTianditu : reverseWithBaidu;

  /** @type {AddressItem} */
  let res;
  /* If in CN, try the defined service first */
  if (service === SERVICES.baidu) {
    try {
      res = await reverseCnFn(coords, signal);
      if (res.display_name && res.display_name !== LOC_UNKNOWN) {
        return res;
      } else {
        isDevMode &&
          console.debug(
            `⚠️ ${reverseCn} reverse geocoding failed. Fallback to ${reverseCnFallback}...`,
          );
      }
    } catch (err) {
      if (Error.isError(err)) {
        if (
          axios.isCancel(err) ||
          err.message === 'cancelled' ||
          err.name === 'AbortError'
        ) {
          isDevMode && console.debug('Reverse geocoding cancelled.');
          return null;
        }
        isDevMode &&
          console.debug(
            `🔴 ${reverseCn} reverse geocoding unavailable. Fallback to ${reverseCnFallback}...`,
          );
      }
    }
  }
  /* Use Nominatim or the fallback when in CN */
  try {
    if (service === SERVICES.baidu) {
      /* If in CN and failed just now, this is the fallback service */
      res = await reverseCnFallbackFn(coords, signal);
    } else {
      /* If not in CN */
      res = await reverseWithNominatim(coords, signal);
    }
    return res;
  } catch (err) {
    if (Error.isError(err)) {
      if (
        axios.isCancel(err) ||
        err.message === 'cancelled' ||
        err.name === 'AbortError'
      ) {
        isDevMode && console.debug('Reverse geocoding cancelled.');
        return null;
      }
      console.error('Reverse geocoding error:', err.message);
    }
    res = {
      lat: coords.latitude.toString(),
      lng: coords.longitude.toString(),
      display_name: LOC_UNKNOWN,
      id: LOC_UNKNOWN_ID,
      addresstype: '',
    };
    return res;
  }
};

export default reverseGeocode;
