// src/utils/fetchAddresses.js
import axios from 'axios';
import fetchJsonp from 'fetch-jsonp';
import { SERVICES, SERVICE_ERR_MSG, LOCATION_NOT_FOUND_MSG } from './constants';
import apiClient from './apiClient';
import { fallbackGeoService, printDuration } from './apiUtils';
import { isDevMode } from './devMode';

const NOMINATIM_TIMEOUT = 3_000;
const BAIDU_TIMEOUT = 6_000;
const QQ_TIMEOUT = 6_000;

const nominatimSearchUrl = import.meta.env.VITE_NOMINATIM_SEARCH_URL;

// const baiduSearchUrlInternal = '/api/baidu-search';
const baiduSearchUrl = import.meta.env.VITE_BAIDU_SEARCH_URL;
const baiduApiKey = import.meta.env.VITE_BAIDU_API_KEY;

const qqSearchUrlInternal = '/api/qq-search';
const qqDistrictUrlInternal = '/api/qq-district';
// const qqSearchUrl = import.meta.env.VITE_QQ_SEARCH_URL;
// const qqDistrictUrl = import.meta.env.VITE_QQ_DISTRICT_URL;
// const qqApiKey = import.meta.env.VITE_QQ_API_KEY;

/** At most this number of items to show. */
const limit = 20;
/** At most this number of items to show when searching district. */
const limitDistrict = 1;
/**
 * At most this number of items to show when searching district
 * and the number of suggestions is less than `limitSug`.
 */
const limitDistrictMax = 3;
/** At most this number of items to show if a district is found. */
const limitSug = 10;

/** @type {Record<number, string>} */
const districtLevels = {
  1: 'province_level',
  2: 'city_level',
  3: 'county_level',
  4: 'township_level',
};

let activeRequests = 0;

/**
 * Get the last `limit` number of segments and join them with `'|'`.
 * Ignores segments with length greater than 5.
 * @param {string} str
 * @param {string} [delim=';'] - Defaults to `';'`.
 * @param {number} [limit=3] - Defaults to 3.
 */
const getTailSegments = (str, delim = ';', limit = 3) => {
  if (!str) return '';
  const pattern = new RegExp(`${delim}\\s*`);
  return str.split(pattern).filter(Boolean).slice(-limit).join('|');
};

/**
 * @param {string} query
 * @returns {Promise<AddressItem[]>} An array of address objects.
 * @throws {Error} If location is not found.
 */
const searchWithNominatim = async (query) => {
  const response = await apiClient.get(nominatimSearchUrl, {
    params: {
      q: query,
      format: 'jsonv2',
      limit,
      addressdetails: 1,
      email: import.meta.env.VITE_EMAIL || 'stardial.astro@gmail.com',
    },
    timeout: NOMINATIM_TIMEOUT,
  });
  const duration = response.config.metadata?.duration;
  isDevMode && duration && printDuration('Nominatim-search', duration);
  /** @type {NominatimSchema[]} */
  const data = response.data;
  isDevMode && console.debug('[Query]', query, '\n[Results]', data);
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
const searchWithBaidu = async (query) => {
  /* [JSONP] -------------------------------------------------------- */
  const url =
    `${baiduSearchUrl}?` +
    `ak=${baiduApiKey}&query=${query}&` +
    `region=全国&output=json&ret_coordtype=gcj02ll`;
  isDevMode && console.debug(`[Baidu ak] ${baiduApiKey.slice(0, 3)}******`);
  const startTime = performance.now();
  const response = await fetchJsonp(url, {
    jsonpCallback: 'callback',
    timeout: BAIDU_TIMEOUT,
  });
  const duration = performance.now() - startTime;
  /* [Proxy] -------------------------------------------------------- */
  // const response = await apiClient.get(baiduSearchUrlInternal, {
  //   params: {
  //     query,
  //     ret_coordtype: 'gcj02ll',
  //   },
  //   timeout: BAIDU_TIMEOUT,
  // });
  // const duration = response.config.metadata?.duration;
  /* ---------------------------------------------------------------- */
  isDevMode && duration && printDuration('Baidu-search', duration);
  /** @type {BaiduSearchV3Schema} */
  const res = await response.json(); // [JSONP]
  // const res = response.data; // [Proxy]
  isDevMode && console.debug('[Query]', query, '\n[Results]', res);
  // isDevMode && console.debug('[Headers]', response.headers); // [Proxy]
  if (res?.status !== 0) {
    throw new Error(res?.message || `Status: ${res?.status || 'unknown'}`);
  }
  const data = res.results;
  if (Array.isArray(data) && data.length > 0) {
    return data.slice(0, limit).map((item) => ({
      lat: item.location.lat.toString(),
      lng: item.location.lng.toString(),
      display_name: item.name,
      id: item.uid || `${item.location.lat},${item.location.lng}`,
      addresstype: getTailSegments(item.classified_poi_tag || item.tag, ';'),
      address: item.address,
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
const searchSugWithQq = async (query) => {
  /* [JSONP] -------------------------------------------------------- */
  // const url =
  //   `${qqSearchUrl}?key=${qqApiKey}&keyword=${query}&policy=1&` +
  //   `address_format=long&output=jsonp&page_index=1&page_size=20`;
  // isDevMode && console.debug(`[QQ key] ${qqApiKey.slice(0, 3)}******`);
  // const startTime = performance.now();
  // const response = await fetchJsonp(url, {
  //   jsonpCallback: 'callback',
  //   timeout: QQ_TIMEOUT,
  // });
  // const duration = performance.now() - startTime;
  /* [Proxy] -------------------------------------------------------- */
  const response = await apiClient.get(qqSearchUrlInternal, {
    params: {
      keyword: query,
      policy: 1,
      address_format: 'long',
      page_index: 1,
      page_size: 20,
    },
    timeout: QQ_TIMEOUT,
  });
  const duration = response.config.metadata?.duration;
  /* ---------------------------------------------------------------- */
  isDevMode && duration && printDuration('QQ-search', duration);
  /** @type {QqSearchSchema} */
  // const res = await response.json(); // [JSONP]
  const res = response.data; // [Proxy]
  isDevMode && console.debug('[Query]', query, '\n[Results]', res);
  isDevMode && console.debug('[Headers]', response.headers); // [Proxy]
  if (res?.status !== 0) {
    throw new Error(res?.message || `Status: ${res?.status || 'unknown'}`);
  }
  const data = res.data;
  if (Array.isArray(data) && data.length > 0) {
    return data.slice(0, limit).map((item) => ({
      lat: item.location.lat.toString(),
      lng: item.location.lng.toString(),
      display_name: item.title,
      id: item.id || `${item.location.lat},${item.location.lng}`,
      addresstype: getTailSegments(item.category, ':'),
      address: item.address,
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
const searchDistrictWithQq = async (query) => {
  /* [JSONP] -------------------------------------------------------- */
  // const url = `${qqDistrictUrl}?key=${qqApiKey}&keyword=${query}&output=jsonp`;
  // const startTime = performance.now();
  // const response = await fetchJsonp(url, {
  //   jsonpCallback: 'callback',
  //   timeout: QQ_TIMEOUT,
  // });
  // const duration = performance.now() - startTime;
  /* [Proxy] -------------------------------------------------------- */
  const response = await apiClient.get(qqDistrictUrlInternal, {
    params: { keyword: query },
    timeout: QQ_TIMEOUT,
  });
  const duration = response.config.metadata?.duration;
  /* ---------------------------------------------------------------- */
  isDevMode && duration && printDuration('QQ-district', duration);
  /** @type {QqDistrictSchema} */
  // const res = await response.json(); // [JSONP]
  const res = response.data; // [Proxy]
  isDevMode && console.debug('[Query]', query, '\n[Results]', res);
  isDevMode && console.debug('[Headers]', response.headers); // [Proxy]
  if (res?.status !== 0) {
    throw new Error(res?.message || `Status: ${res?.status || 'unknown'}`);
  }
  const data = res.result;
  if (Array.isArray(data) && data.length > 0 && data[0].length > 0) {
    return data
      .flat()
      .slice(0, limitDistrictMax)
      .map((item) => {
        const parts = item.address.split(',');
        return {
          lat: item.location.lat.toString(),
          lng: item.location.lng.toString(),
          display_name: item.fullname,
          id: item.id || `${item.location.lat},${item.location.lng}`,
          addresstype: districtLevels[item.level] || 'region',
          /* Same style as Baidu */
          address: parts.length <= 1 ? '' : parts.join('-'),
        };
      });
  } else {
    throw new Error(LOCATION_NOT_FOUND_MSG);
  }
};

/**
 * @param {string} query
 * @returns {Promise<AddressItem[]>} An array of address objects.
 * @throws {Error} If location is not found.
 */
const searchWithQq = async (query) => {
  const [distData, sugData] = await Promise.all([
    searchDistrictWithQq(query).catch((err) => {
      isDevMode && console.debug('* QQ district:', err.message);
      return [];
    }),
    searchSugWithQq(query).catch((err) => {
      isDevMode && console.debug('* QQ suggestion:', err.message);
      return [];
    }),
  ]);
  if (distData.length === 0 && sugData.length === 0) {
    throw new Error(LOCATION_NOT_FOUND_MSG);
  }
  /* List less distData items if sugData contains many */
  const limitedDistData =
    sugData.length > limitSug ? distData.slice(0, limitDistrict) : distData;
  /* List less sugData items if distData is not empty */
  const limitedSugData =
    distData.length === 0 ? sugData : sugData.slice(0, limitSug);
  /* Merge and remove duplicates */
  const uniqueData = [...limitedDistData, ...limitedSugData].filter(
    (item, index, self) =>
      index ===
      self.findIndex(
        (t) =>
          t.id === item.id &&
          t.display_name === item.display_name &&
          t.addresstype === item.addresstype,
      ),
  );
  return uniqueData;
};

/**
 * Fetched address suggestions.
 * - If `service` is `null`, falls back to `fallbackGeoService`
 * @param {string} query - Case insensitive.
 * @param {GeoService | null} service - The geocoding service.
 * @returns {Promise<AddressItem[] | null>} An array of address objects, or `null` if aborted.
 * @throws {Error} If request failed or location is not found.
 */
const fetchAddresses = async (query, service) => {
  isDevMode && console.debug('> Fetching address suggestions...');

  /** The given service or `fallbackGeoService`. */
  const serviceInUse = service || fallbackGeoService;

  activeRequests++;
  /* prettier-ignore */
  isDevMode && console.debug(`[${serviceInUse}-search] concurrency: ${activeRequests}, query: ${query}`);

  /** @type {AddressItem[]} */
  let res;
  try {
    if (serviceInUse === SERVICES.qq) {
      res = await searchWithQq(query);
    } else if (serviceInUse === SERVICES.baidu) {
      res = await searchWithBaidu(query);
    } else {
      res = await searchWithNominatim(query);
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
  } finally {
    activeRequests--;
    /* prettier-ignore */
    isDevMode && console.debug(`[${serviceInUse}-search] concurrency: ${activeRequests}, finished`);
  }
};

export default fetchAddresses;
