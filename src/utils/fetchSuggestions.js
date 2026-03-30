// src/utils/fetchSuggestions.js
import axios from 'axios';
import fetchJsonp from 'fetch-jsonp';
import { SERVICES, SERVICE_ERR_MSG, LOCATION_NOT_FOUND_MSG } from './constants';
import { getIsDevMode } from './devMode';

const NOMINATIM_TIMEOUT = 5_000;
const BAIDU_TIMEOUT = 5_000;

const nominatimSearchUrl = import.meta.env.VITE_NOMINATIM_SEARCH_URL;
const baiduSearchUrl = import.meta.env.VITE_BAIDU_SEARCH_URL;

const isDevMode = getIsDevMode();

/**
 * @param {string} str
 * @param {number} limit
 */
const getTailSegments = (str, limit = 3) => {
  if (!str) return '';
  return str.split(/;\s*/).filter(Boolean).slice(-limit).join('|');
};

/**
 * @param {string} query
 * @returns {Promise<AddressItem[]>} An array of address objects.
 * @throws {Error} If location is not found.
 */
const fetchSuggestionsWithNominatim = async (query) => {
  const response = await axios.get(nominatimSearchUrl, {
    params: {
      q: query,
      format: 'json',
      addressdetails: 1,
      email: import.meta.env.VITE_EMAIL,
    },
    timeout: NOMINATIM_TIMEOUT,
  });
  /** @type {NominatimSchema[]} */
  const data = response.data;
  isDevMode && console.debug('[Query]', query, '\n[Locations]', data);
  if (Array.isArray(data) && data.length > 0) {
    /* item.lat and item.lon are strings */
    return data.map((item) => ({
      lat: item.lat,
      lng: item.lon,
      display_name: item.display_name,
      id: item.osm_id?.toString() || `${item.lat},${item.lon}`,
      addresstype: getTailSegments(item.addresstype),
    }));
  } else {
    throw new Error(LOCATION_NOT_FOUND_MSG);
  }
};

/**
 * @param {string} query
 * @returns {Promise<AddressItem[]>} An array of address objects.
 * @throws {Error} If location is not found.
 */
const fetchSuggestionsWithBaidu = async (query) => {
  const url =
    `${baiduSearchUrl}?` +
    `ak=${import.meta.env.VITE_BAIDU_API_KEY}&` +
    `query=${query}&` +
    'region=全国&' +
    'output=json&' +
    'ret_coordtype=gcj02ll';
  const response = await fetchJsonp(url, {
    jsonpCallback: 'callback',
    timeout: BAIDU_TIMEOUT,
  });
  const res = await response.json();
  isDevMode && console.debug('[Query]', query, '\n[Locations]', res);
  /** @type {BaiduSearchSchema[]} */
  const data = res?.result;
  if (Array.isArray(data) && data.length > 0) {
    return data.map((item) => ({
      lat: item.location.lat.toString(),
      lng: item.location.lng.toString(),
      display_name: [item.address, item.name].filter(Boolean).join(' '),
      id: item.uid || `${item.location.lat},${item.location.lng}`,
      addresstype: getTailSegments(item.tag),
    }));
  } else {
    throw new Error(LOCATION_NOT_FOUND_MSG);
  }
};

/**
 * Fetched address suggestions.
 * @param {string} query - Case insensitive.
 * @param {GeoService} service - The geocoding service.
 * @returns {Promise<AddressItem[] | null>} An array of address objects, or `null` if aborted.
 * @throws {Error} If request failed or location is not found.
 */
const fetchSuggestions = async (query, service) => {
  isDevMode && console.debug('> Fetching address suggestions...');
  /** @type {AddressItem[]} */
  let res;
  try {
    if (service === SERVICES.baidu) {
      res = await fetchSuggestionsWithBaidu(query);
    } else {
      res = await fetchSuggestionsWithNominatim(query);
    }
    return res;
  } catch (err) {
    if (axios.isCancel(err)) {
      isDevMode && console.debug('Location fetching cancelled. Query:', query);
      return null;
    }
    if (Error.isError(err) && err.message === LOCATION_NOT_FOUND_MSG) throw err;
    console.error(
      'Error fetching locations:',
      Error.isError(err) ? err.message : err,
    );
    throw new Error(SERVICE_ERR_MSG, { cause: err });
  }
};

export default fetchSuggestions;
