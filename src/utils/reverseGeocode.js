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

/**
 * @param {CoordObj} coords
 * @param {AbortSignal} signal
 * @returns {Promise<AddressItem | null>} The address object.
 * @throws {Error} If location is not found.
 */
const reverseGeocodeWithNominatim = async (coords, signal) => {
  const response = await axios.get(nominatimReverseUrl, {
    params: {
      lat: coords.latitude,
      lon: coords.longitude,
      format: 'json',
      addressdetails: 1,
      /** City level */
      zoom: 10,
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
    data?.osm_id?.toString() || `${coords.latitude},${coords.longitude}`;
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
 * @returns {Promise<AddressItem | null>} The address object.
 * @throws {Error} If location is not found.
 */
const reverseGeocodeWithBaidu = async (coords) => {
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
  if (!res) throw new Error(NO_DATA_ERR_MSG + baiduReverseUrl);
  getIsDevMode() && console.debug('[lat,lng]', coords, '\n[Address]', res);
  /** @type {BaiduReverseSchema} */
  const data = res.result;
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
 * Fetches reverse geocoding data.
 * @param {CoordObj} coords
 * @param {GeoService} service - The geocoding service.
 * @param {AbortSignal} signal
 * @returns {Promise<AddressItem | null>} The address object, or `null` if aborted.
 */
const reverseGeocode = async (coords, service, signal) => {
  if (signal?.aborted) return null;

  /** @type {AddressItem | null} */
  let res;
  try {
    if (service === SERVICES.baidu) {
      res = await reverseGeocodeWithBaidu(coords);
    } else {
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
