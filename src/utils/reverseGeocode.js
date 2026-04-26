// src/utils/reverseGeocode.js
import axios from 'axios';
import fetchJsonp from 'fetch-jsonp';
import { SERVICES, DEFAULT_SERVICE, LOC_UNKNOWN_ID } from './constants';
import apiClient from './apiClient';
import { isCST, fallbackGeoService, printDuration } from './apiUtils';
import { isDevMode, forceInCn } from './devMode';

const NO_FALLBACK = false;

const NOMINATIM_TIMEOUT = 5_000;
const BAIDU_TIMEOUT = 6_000;
const QQ_TIMEOUT = 6_000;
const TIANDITU_TIMEOUT = 6_000;

const NO_DATA_ERR_MSG = 'No data returned from ';

const nominatimReverseUrl = import.meta.env.VITE_NOMINATIM_REVERSE_URL;

// const baiduReverseUrlInternal = '/api/baidu-reverse';
const baiduReverseUrl = import.meta.env.VITE_BAIDU_REVERSE_URL;
const baiduApiKey = import.meta.env.VITE_BAIDU_API_KEY;

const qqReverseUrlInternal = '/api/qq-reverse';
// const qqReverseUrl = import.meta.env.VITE_QQ_REVERSE_URL;
// const qqApiKey = import.meta.env.VITE_QQ_API_KEY;

// const tiandituReverseUrlInternal = '/api/tianditu-reverse';
const tiandituReverseUrl = import.meta.env.VITE_TIANDITU_REVERSE_URL;
const tiandituApiKey = import.meta.env.VITE_TIANDITU_API_KEY;

/**
 * @param {CoordObj} coords
 * @param {AbortSignal} signal
 * @returns {Promise<AddressItem>} The address object.
 * @throws {Error} If location is not found.
 */
const reverseWithNominatim = async (coords, signal) => {
  const response = await apiClient.get(nominatimReverseUrl, {
    params: {
      lat: coords.latitude,
      lon: coords.longitude,
      format: 'json',
      addressdetails: 1,
      zoom: 10, // City level
      email: import.meta.env.VITE_EMAIL || 'stardial.astro@gmail.com',
    },
    timeout: NOMINATIM_TIMEOUT,
    signal,
  });
  const duration = response.config.metadata?.duration;
  isDevMode && duration && printDuration('Nominatim-reverse', duration);
  /** @type {NominatimSchema} */
  const data = response.data;
  if (!data)
    throw new Error(NO_DATA_ERR_MSG + 'Nominatim reverse geocoding API');
  isDevMode && console.debug('[lat,lng]', coords, '\n[Results]', data);
  const display_name = data.display_name.trim();
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
 * @returns {Promise<AddressItem>} The address object.
 * @throws {Error} If location is not found.
 */
const reverseWithBaidu = async (coords) => {
  /* [JSONP] -------------------------------------------------------- */
  const url =
    `${baiduReverseUrl}?` +
    `ak=${baiduApiKey}&location=${coords.latitude},${coords.longitude}&` +
    'output=json&coordtype=wgs84ll&region_data_source=2';
  isDevMode && console.debug(`[Baidu ak] ${baiduApiKey.slice(0, 3)}******`);
  const startTime = performance.now();
  const response = await fetchJsonp(url, {
    jsonpCallback: 'callback',
    timeout: BAIDU_TIMEOUT,
  });
  const duration = performance.now() - startTime;
  /* [Proxy] -------------------------------------------------------- */
  // const response = await apiClient.get(baiduReverseUrlInternal, {
  //   params: {
  //     location: `${coords.latitude},${coords.longitude}`,
  //     coordtype: 'wgs84ll',
  //     region_data_source: 2,
  //   },
  //   timeout: BAIDU_TIMEOUT,
  //   signal,
  // });
  // const duration = response.config.metadata?.duration;
  /* ---------------------------------------------------------------- */
  isDevMode && duration && printDuration('Baidu-reverse', duration);
  /** @type {BaiduReverseSchema} */
  const res = await response.json(); // [JSONP]
  // const res = response.data; // [Proxy]
  isDevMode && console.debug('[lat,lng]', coords, '\n[Results]', res);
  // isDevMode && console.debug('[Headers]', response.headers); // [Proxy]
  if (res?.status !== 0) {
    throw new Error(res?.message || `Status: ${res?.status || 'unknown'}`);
  }
  const data = res.result;
  if (!data) throw new Error(NO_DATA_ERR_MSG + 'Baidu reverse geocoding API');
  const display_name = data.formatted_address.trim();
  const id = `${coords.latitude},${coords.longitude}`;
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
 * @param {AbortSignal} signal - Unused if via JSONP.
 * @returns {Promise<AddressItem>} The address object.
 * @throws {Error} If location is not found.
 */
const reverseWithQq = async (coords, signal) => {
  /* [JSONP] -------------------------------------------------------- */
  // const url =
  //   `${qqReverseUrl}?` +
  //   `key=${qqApiKey}&location=${coords.latitude},${coords.longitude}&radius=1000&output=jsonp`;
  // isDevMode && console.debug(`[QQ key] ${qqApiKey.slice(0, 3)}******`);
  // const startTime = performance.now();
  // const response = await fetchJsonp(url, {
  //   jsonpCallback: 'callback',
  //   timeout: QQ_TIMEOUT,
  // });
  // const duration = performance.now() - startTime;
  /* [Proxy] -------------------------------------------------------- */
  const response = await apiClient.get(qqReverseUrlInternal, {
    params: {
      location: `${coords.latitude},${coords.longitude}`,
      radius: 1000,
    },
    timeout: QQ_TIMEOUT,
    signal,
  });
  const duration = response.config.metadata?.duration;
  /* ---------------------------------------------------------------- */
  isDevMode && duration && printDuration('QQ-reverse', duration);
  /** @type {QqReverseSchema} */
  // const res = await response.json(); // [JSONP]
  const res = response.data; // [Proxy]
  isDevMode && console.debug('[lat,lng]', coords, '\n[Results]', res);
  isDevMode && console.debug('[Headers]', response.headers); // [Proxy]
  if (res?.status !== 0) {
    throw new Error(res?.message || `Status: ${res?.status || 'unknown'}`);
  }
  const data = res.result;
  if (!data) throw new Error(NO_DATA_ERR_MSG + 'QQ reverse geocoding API');
  const display_name =
    data.address.trim() || data.formatted_addresses?.recommend.trim() || '';
  const id = `${coords.latitude},${coords.longitude}`;
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
 * @param {AbortSignal} signal
 * @returns {Promise<AddressItem>} The address object.
 * @throws {Error} If location is not found.
 */
const reverseWithTianditu = async (coords, signal) => {
  const postStr = JSON.stringify({
    lon: coords.longitude,
    lat: coords.latitude,
    ver: 1,
  });
  /* [axios] -------------------------------------------------------- */
  isDevMode &&
    console.debug(`[Tianditu tk] ${tiandituApiKey.slice(0, 3)}******`);
  const response = await apiClient.get(tiandituReverseUrl, {
    params: {
      postStr,
      type: 'geocode',
      tk: tiandituApiKey,
    },
    timeout: TIANDITU_TIMEOUT,
    signal,
  });
  /* [Proxy] -------------------------------------------------------- */
  // const response = await apiClient.get(tiandituReverseUrlInternal, {
  //   params: {
  //     postStr,
  //   },
  //   timeout: TIANDITU_TIMEOUT,
  //   signal,
  // });
  /* ---------------------------------------------------------------- */
  const duration = response.config.metadata?.duration;
  isDevMode && duration && printDuration('Tianditu-reverse', duration);
  /** @type {TiandituReverseSchema} */
  const res = response.data;
  isDevMode && console.debug('[lat,lng]', coords, '\n[Results]', res);
  isDevMode && console.debug('[Headers]', response.headers);
  if (res?.status !== '0') {
    throw new Error(res?.msg || `Status: ${res?.status || 'unknown'}`);
  }
  const data = res.result;
  if (!data)
    throw new Error(NO_DATA_ERR_MSG + 'Tianditu reverse geocoding API');
  const display_name = data.formatted_address.trim();
  const id = `${coords.latitude},${coords.longitude}`;
  return {
    lat: coords.latitude.toString(),
    lng: coords.longitude.toString(),
    display_name: display_name || LOC_UNKNOWN_ID,
    id: display_name ? id : LOC_UNKNOWN_ID,
    addresstype: '',
  };
};

/**
 * Fetches address by reverse geocoding.
 * - If `service` is `null`, falls back to `DEFAULT_SERVICE`, or `serviceCn`
 * - Try a fallback only when using a CN service
 * @param {CoordObj} coords
 * @param {GeoService | null} service - The primary geocoding service.
 * @param {GeoService} serviceCn - The CN reverse geocoding service.
 * @param {AbortSignal} signal
 * @returns {Promise<{ res: AddressItem | null, serviceInUse: GeoService }>}
 *   The address object or `null` if aborted, and the reverse geocoding service in use.
 */
const reverseGeocode = async (coords, service, serviceCn, signal) => {
  /* The serviceInUse returned when aborted is a dummy that we don't care */
  if (signal?.aborted) return { res: null, serviceInUse: service || serviceCn };

  const resUnknown = {
    lat: coords.latitude.toString(),
    lng: coords.longitude.toString(),
    display_name: LOC_UNKNOWN_ID,
    id: LOC_UNKNOWN_ID,
    addresstype: '',
  };

  /* The region should be align with the primary geocoding service */
  let serviceInUse =
    (service || fallbackGeoService) !== DEFAULT_SERVICE
      ? serviceCn
      : service || DEFAULT_SERVICE;

  const reverseDefaultFn = reverseWithNominatim;
  let reverseFn = reverseDefaultFn;
  let reverseFallbackFn = reverseWithQq;
  /** @type {GeoService} */
  let serviceFallback = SERVICES.qq;
  if (serviceInUse === SERVICES.tianditu) {
    reverseFn = reverseWithTianditu;
  } else if (serviceInUse === SERVICES.qq) {
    reverseFn = reverseWithQq;
    reverseFallbackFn = reverseWithTianditu;
    serviceFallback = SERVICES.tianditu;
  } else if (serviceInUse === SERVICES.baidu) {
    reverseFn = reverseWithBaidu;
  }

  /** @type {AddressItem} */
  let res;
  /* If possibly in CN, try the specified CN service first ---------- */
  if (serviceInUse !== DEFAULT_SERVICE) {
    if (!isCST && !forceInCn) {
      /* If time is not CST and not forcing in CN, try DEFAULT_SERVICE below */
      console.debug(
        `🤔 System time is not CST. If your are outside CN, reverse geocoding for this location might be unavailable.` +
          `\nSwitching to ${DEFAULT_SERVICE}...`,
      );
      serviceInUse = DEFAULT_SERVICE;
      reverseFn = reverseDefaultFn;
    } else {
      /* Try the specified CN service */
      try {
        isDevMode &&
          console.debug(`> Querying address using ${serviceInUse}...`);
        res = await reverseFn(coords, signal);
        if (res.id !== LOC_UNKNOWN_ID) return { res, serviceInUse };
        /* If returns an empty address, return or use a fallback */
        console.debug(
          `🤔 Hmm... ${serviceInUse} reverse geocoding for this location is unavailable.`,
        );
        if (NO_FALLBACK) return { res, serviceInUse };
        /* Try DEFAULT_SERVICE below */
        isDevMode && console.debug(`Switching to ${DEFAULT_SERVICE}...`);
        serviceInUse = DEFAULT_SERVICE;
        reverseFn = reverseDefaultFn;
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
        isDevMode &&
          console.debug(`🔴 ${serviceInUse} reverse geocoding failed.`);
        /* If forcing in CN (for testing), you might need a proxy */
        forceInCn && console.debug('🤔 Did you forgot using a proxy?');
        if (NO_FALLBACK) return { res: resUnknown, serviceInUse };
        /* Try the fallback service below */
        isDevMode && console.debug(`Switching to ${serviceFallback}...`);
        serviceInUse = serviceFallback;
        reverseFn = reverseFallbackFn;
      }
    }
  }
  /* Fetch with DEFAULT_SERVICE or the fallback CN service ---------- */
  try {
    isDevMode && console.debug(`> Querying address using ${serviceInUse}...`);
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
    return { res: resUnknown, serviceInUse };
  }
};

export default reverseGeocode;
