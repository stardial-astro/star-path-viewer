// src/utils/reverseGeocode.js
import axios from 'axios';
import fetchJsonp from 'fetch-jsonp';
import { SERVICES, LOC_UNKNOWN_ID } from './constants';
import apiClient from './apiClient';
import { isInCn } from './apiUtils';
import { isDevMode, forceInCn } from './devMode';

const NO_FALLBACK = false;

const NOMINATIM_TIMEOUT = 5_000;
const BAIDU_TIMEOUT = 6_000;
const QQ_TIMEOUT = 6_000;
const TIANDITU_TIMEOUT = 6_000;

const NO_DATA_ERR_MSG = 'No data returned from ';

const nominatimReverseUrl = import.meta.env.VITE_NOMINATIM_REVERSE_URL;

// const baiduReverseUrl = '/api/baidu-reverse';
const baiduReverseUrl = import.meta.env.VITE_BAIDU_REVERSE_URL;
const baiduApiKey = import.meta.env.VITE_BAIDU_API_KEY;

const qqReverseUrl = '/api/qq-reverse';
// const qqReverseUrl = import.meta.env.VITE_QQ_REVERSE_URL;
// const qqApiKey = import.meta.env.VITE_QQ_API_KEY;

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
  isDevMode &&
    duration &&
    console.debug(`⏳ (Nominatim-reverse) Request took ${duration}ms`);
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
 * @param {AbortSignal} signal - Unused if via JSONP.
 * @returns {Promise<AddressItem>} The address object.
 * @throws {Error} If location is not found.
 */
/* eslint-disable-next-line no-unused-vars */
const reverseWithBaidu = async (coords, signal) => {
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
  // const response = await apiClient.get(baiduReverseUrl, {
  //   params: {
  //     location: `${coords.latitude},${coords.longitude}`,
  //     output: 'json',
  //     coordtype: 'wgs84ll',
  //     region_data_source: 2,
  //   },
  //   timeout: BAIDU_TIMEOUT,
  //   signal,
  // });
  // const duration = response.config.metadata?.duration;
  /* ---------------------------------------------------------------- */
  isDevMode &&
    duration &&
    console.debug(`⏳ (Baidu-reverse) Request took ${duration}ms`);
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
  const response = await apiClient.get(qqReverseUrl, {
    params: {
      location: `${coords.latitude},${coords.longitude}`,
      radius: 1000,
    },
    timeout: QQ_TIMEOUT,
    signal,
  });
  const duration = response.config.metadata?.duration;
  /* ---------------------------------------------------------------- */
  isDevMode &&
    duration &&
    console.debug(`⏳ (QQ-reverse) Request took ${duration}ms`);
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
  const duration = response.config.metadata?.duration;
  isDevMode &&
    duration &&
    console.debug(`⏳ (Tianditu-reverse) Request took ${duration}ms`);
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
 * Fetches reverse geocoding data.
 * - If `service` is `null`, falls back to `'Nominatim'`, or `serviceCn` if in CN
 * @param {CoordObj} coords
 * @param {GeoService | null} service - The primary geocoding service.
 * @param {GeoService} serviceCn - The CN reverse geocoding service.
 * @param {AbortSignal} signal
 * @returns {Promise<{ res: AddressItem | null, serviceInUse: GeoService }>}
 *   The address object or `null` if aborted, and the reverse geocoding service in use.
 */
const reverseGeocode = async (coords, service, serviceCn, signal) => {
  /* The serviceInUse returned when aborted is a dummy that will not be used */
  if (signal?.aborted) return { res: null, serviceInUse: service || serviceCn };

  const resUnknown = {
    lat: coords.latitude.toString(),
    lng: coords.longitude.toString(),
    display_name: LOC_UNKNOWN_ID,
    id: LOC_UNKNOWN_ID,
    addresstype: '',
  };

  let serviceInUse =
    isInCn || forceInCn || service !== SERVICES.nominatim
      ? serviceCn
      : service || SERVICES.nominatim;

  let reverseFn = reverseWithNominatim;
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
  /* If possibly in CN, try the defined CN service first ------------ */
  if (serviceInUse !== SERVICES.nominatim) {
    if (!isInCn && !forceInCn) {
      /* If not in CN and not force in CN (for testing), try Nominatim below */
      isDevMode &&
        console.debug(
          `⚠️ You are not in China. Reverse geocoding for this location might be unavailable.` +
            '\nSwitching to Nominatim...',
        );
      serviceInUse = SERVICES.nominatim;
      reverseFn = reverseWithNominatim;
    } else {
      /* Try the specified CN service */
      try {
        isDevMode && console.debug(`> Querying address using ${serviceInUse}...`);
        res = await reverseFn(coords, signal);
        if (res.id !== LOC_UNKNOWN_ID) return { res, serviceInUse };
        /* If returns an empty address, return or use a fallback */
        isDevMode &&
          console.debug(
            `🤔 Hmm... ${serviceInUse} reverse geocoding for this location is unavailable.`,
          );
        if (NO_FALLBACK) return { res, serviceInUse };
        /* Try Nominatim below */
        isDevMode && console.debug('Switching to Nominatim...');
        serviceInUse = SERVICES.nominatim;
        reverseFn = reverseWithNominatim;
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
        if (forceInCn) {
          /* If force in CN (for testing), you might need a proxy */
          isDevMode &&
            console.debug(
              `🔴 ${serviceInUse} reverse geocoding failed.\nDid you forgot to use a proxy?`,
            );
          return { res: resUnknown, serviceInUse };
        }
        if (NO_FALLBACK) {
          isDevMode &&
            console.debug(`🔴 ${serviceInUse} reverse geocoding failed.`);
          return { res: resUnknown, serviceInUse };
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
