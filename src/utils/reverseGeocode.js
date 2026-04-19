// src/utils/reverseGeocode.js
import axios from 'axios';
import fetchJsonp from 'fetch-jsonp';
import { SERVICES, LOC_UNKNOWN_ID, LOC_UNKNOWN } from './constants';
import { getIsDevMode } from './devMode';

const NOMINATIM_TIMEOUT = 5_000;
const BAIDU_TIMEOUT = 5_000;

const NO_DATA_ERR_MSG = 'No data returned from ';

const nominatimReverseUrl = import.meta.env.VITE_NOMINATIM_REVERSE_URL;
const baiduReverseUrl = import.meta.env.VITE_BAIDU_REVERSE_URL;
const tiandituReverseUrl = import.meta.env.VITE_TIANDITU_REVERSE_URL;

/** The reverse geocoding service if in CN. Defaults to `'Baidu'` */
const reverseCn = import.meta.env.VITE_REVERSE_SERVICE_CN || SERVICES.baidu;

/**
 * @param {CoordObj} coords
 * @param {AbortSignal} signal
 * @returns {Promise<AddressItem>} The address object.
 * @throws {Error} If location is not found.
 */
const reverseGeocodeWithNominatim = async (coords, signal) => {
  const response = await axios.get(nominatimReverseUrl, {
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
  /** @type {NominatimSchema} */
  const data = response.data;
  if (!data) throw new Error(NO_DATA_ERR_MSG + nominatimReverseUrl);
  getIsDevMode() && console.debug('[lat,lng]', coords, '\n[Address]', data);
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
/* eslint-disable-next-line no-unused-vars */
const reverseGeocodeWithBaidu = async (coords, signal) => {
  const url =
    `${baiduReverseUrl}?` +
    `ak=${import.meta.env.VITE_BAIDU_API_KEY}&` +
    `location=${coords.latitude},${coords.longitude}&` +
    'output=json&' +
    'coordtype=wgs84ll' +
    'region_data_source=2';
  const response = await fetchJsonp(url, {
    jsonpCallback: 'callback',
    timeout: BAIDU_TIMEOUT,
  });
  const res = await response.json();
  /** @type {BaiduReverseSchema} */
  const data = res?.result;
  if (!data) throw new Error(NO_DATA_ERR_MSG + baiduReverseUrl);
  getIsDevMode() && console.debug('[lat,lng]', coords, '\n[Address]', data);
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

/**
 * @param {CoordObj} coords
 * @param {AbortSignal} signal
 * @returns {Promise<AddressItem>} The address object.
 * @throws {Error} If location is not found.
 */
const reverseGeocodeWithTianditu = async (coords, signal) => {
  const postStr = JSON.stringify({
    lon: coords.longitude,
    lat: coords.latitude,
    ver: 1,
  });
  const response = await axios.get(tiandituReverseUrl, {
    params: {
      postStr,
      type: 'geocode',
      tk: import.meta.env.VITE_TIANDITU_API_KEY,
    },
    timeout: NOMINATIM_TIMEOUT,
    signal,
  });
  /** @type {TiandituReverseSchema} */
  const data = response.data?.result;
  if (!data) throw new Error(NO_DATA_ERR_MSG + tiandituReverseUrl);
  getIsDevMode() && console.debug('[lat,lng]', coords, '\n[Address]', data);
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

  const reverseCnFallback =
    reverseCn === SERVICES.baidu ? SERVICES.tianditu : SERVICES.baidu;
  const reverseCnFunc =
    reverseCn === SERVICES.baidu
      ? reverseGeocodeWithBaidu
      : reverseGeocodeWithTianditu;
  const reverseCnFallbackFunc =
    reverseCnFallback === SERVICES.baidu
      ? reverseGeocodeWithBaidu
      : reverseGeocodeWithTianditu;

  /** @type {AddressItem} */
  let res;
  /* If in CN, try the defined service first */
  if (service === SERVICES.baidu) {
    try {
      res = await reverseCnFunc(coords, signal);
      if (res.display_name && res.display_name !== LOC_UNKNOWN) {
        return res;
      } else {
        getIsDevMode() &&
          console.debug(
            `${reverseCn} reverse geocoding failed. Fallback to ${reverseCnFallback}...`,
          );
      }
    } catch (err) {
      if (Error.isError(err)) {
        if (
          axios.isCancel(err) ||
          err.message === 'cancelled' ||
          err.name === 'AbortError'
        ) {
          getIsDevMode() && console.debug('Reverse geocoding cancelled.');
          return null;
        }
        getIsDevMode() &&
          console.debug(
            `${reverseCn} reverse geocoding unavailable. Fallback to ${reverseCnFallback}...`,
          );
      }
    }
  }
  /* Use Nominatim or the fallback when in CN */
  try {
    if (service === SERVICES.baidu) {
      /* If in CN and failed just now, this is the fallback service */
      res = await reverseCnFallbackFunc(coords, signal);
    } else {
      /* If not in CN */
      res = await reverseGeocodeWithNominatim(coords, signal);
    }
    return res;
  } catch (err) {
    if (Error.isError(err)) {
      if (
        axios.isCancel(err) ||
        err.message === 'cancelled' ||
        err.name === 'AbortError'
      ) {
        getIsDevMode() && console.debug('Reverse geocoding cancelled.');
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
