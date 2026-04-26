// src/utils/apiUtils.js
import axios from 'axios';
import config from './config';
import {
  DEFAULT_SERVICE,
  DEFAULT_SERVICE_CN,
  CN_MAIN_TIMEZONES,
  SERVER_ERR_MSG,
  SERVER_TIMEOUT_MSG,
  SERVER_DOWN_MSG,
  SERVER_NO_RES_MSG,
} from './constants';
import { isDevMode, forceInCn, forceCST } from './devMode';

const SERVER_PROBE_TIMEOUT = config.SERVER_TIMEOUT;
const SERVICE_PROBE_TIMEOUT_SHORT = 700;
const SERVICE_PROBE_TIMEOUT = 2_500;

// const globalUrl = 'https://www.google.com/favicon.ico';
const globalUrl = 'https://www.google.com/generate_204';
const globalName = 'Google';
const altGlobalUrl = 'https://www.v2ex.com/generate_204';
const altGlobalName = 'V2ex';

const nominatimSearchUrl = import.meta.env.VITE_NOMINATIM_SEARCH_URL;
const serverUrl = import.meta.env.VITE_SERVER_URL;
const eqxSolUrl = `${serverUrl}/equinox`;

const currentTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
/** `true` if the current system time is CST or force to be `true`. */
export const isCST = CN_MAIN_TIMEZONES.has(currentTz) || forceCST;

/** @type {GeoService} The fallback primary geocoding service when not set. */
export const fallbackGeoService =
  isCST || forceInCn ? DEFAULT_SERVICE_CN : DEFAULT_SERVICE;

/**
 * @param {string} title
 * @param {number} dt - Keeps 1 fraction digit.
 */
export const printDuration = (title, dt) => {
  console.debug(`⏳ (${title}) Request took ${dt.toFixed(1)}ms`);
};

/**
 * Parses and returns errors when `axios` request to the **server** failed.
 * @param {*} err
 */
export const parseApiError = (err) => {
  if (axios.isAxiosError(err)) {
    /* Timed out or unreachable */
    if (err.code === 'ECONNABORTED') return new Error(SERVER_TIMEOUT_MSG);
    /* Server responded with a status code outside 2xx */
    if (err.response) {
      const { status, data } = err.response;
      const errMsg = data?.error || err.message;
      console.error(`HTTP ${status}: ${errMsg ?? err.toJSON()}`);
      if (status === 503) return new Error(SERVER_DOWN_MSG);
      return new Error(errMsg || SERVER_ERR_MSG);
    }
    /* Request was made but no response received */
    if (err.request) {
      console.error(err.message ?? err.toJSON());
      return new Error(SERVER_NO_RES_MSG);
    }
  }
  /* Anything unexpected */
  console.error(
    `Request setup error: ${Error.isError(err) ? err.message : err}`,
  );
  return new Error(SERVER_ERR_MSG);
};

/**
 * Checks the server's accessibility by sending `HEAD` request using `axios`.
 * @returns {Promise<null>}
 * @throws {Error} If request failed.
 */
export const checkServerAccessibility = async () => {
  const timeout = SERVER_PROBE_TIMEOUT;
  try {
    isDevMode && console.debug('> Checking if server is up...');
    const params = { tz: 'Etc/GMT', year: '-1000', flag: 've' };
    const startTime = performance.now();
    await axios.head(eqxSolUrl, { params, timeout });
    if (isDevMode) {
      printDuration('server-probe', performance.now() - startTime);
      console.debug('✅ Server is up.\nURL:', serverUrl);
    }
  } catch (err) {
    if (axios.isCancel(err)) {
      isDevMode && console.debug('Server probe cancelled.');
      return null;
    }
    if (axios.isAxiosError(err)) {
      /* Timed out or unreachable */
      if (err.code === 'ECONNABORTED')
        throw new Error(SERVER_TIMEOUT_MSG, { cause: err });
      /* Server responded with a status code outside 2xx */
      if (err.response) {
        const { status } = err.response;
        if (status === 405) {
          isDevMode &&
            console.debug('⚠️ HEAD not allowed, but server is alive.');
          return null;
        }
        console.error(`HTTP ${status}: ${err.message ?? err.toJSON()}`);
        if (status === 503) throw new Error(SERVER_DOWN_MSG, { cause: err });
        throw new Error(err.message || SERVER_ERR_MSG, { cause: err });
      }
      /* Request was made but no response received */
      if (err.request) {
        console.error(err.message ?? err.toJSON());
        throw new Error(SERVER_NO_RES_MSG, { cause: err });
      }
    }
    /* Anything unexpected */
    console.error(
      `Request setup error: ${Error.isError(err) ? err.message : err}`,
    );
    throw new Error(SERVER_ERR_MSG, { cause: err });
  }
  return null;
};

/**
 * Probes Nominatim by sending `HEAD` request using `axios`.
 * @param {number} [timeout]
 * @throws {Error} If request failed.
 */
export const probeNominatim = async (timeout = SERVICE_PROBE_TIMEOUT) => {
  isDevMode && console.debug('> Checking if Nominatim is accessible...');
  const startTime = performance.now();
  const params = {
    q: '',
    format: 'json',
    email: import.meta.env.VITE_EMAIL,
  };
  await axios.head(nominatimSearchUrl, { params, timeout });
  if (isDevMode) {
    printDuration('Nominatim-probe', performance.now() - startTime);
    console.debug('✅ Nominatim is accessible.');
  }
};

/**
 * Probes this endpoint by sending `HEAD` request in `'no-cors'` mode using `fetch`.
 * @param {string} name
 * @param {string} url
 * @param {number} [timeout]
 * @returns {Promise<boolean>} `true` if accessible; otherwise `false` (Network error / CORS / Timeout).
 */
const testEndpoint = async (
  name,
  url,
  timeout = SERVICE_PROBE_TIMEOUT_SHORT,
) => {
  isDevMode && console.debug(`> Checking if ${name} is accessible...`);
  const startTime = performance.now();
  try {
    /* fetch results in an opaque response (response.type is 'opaque')
     * that response.ok will be false and response.status will always be 0
     */
    await fetch(url, {
      method: 'HEAD',
      mode: 'no-cors', // to avoid CORS errors
      cache: 'no-cache', // ensures a fresh request is made
      signal: AbortSignal.timeout(timeout),
    });
    if (isDevMode) {
      printDuration(`${name}-probe`, performance.now() - startTime);
      console.debug(`✅ ${name} is accessible.`);
    }
    return true;
  } catch (err) {
    /* Network error / CORS / Timeout */
    if (isDevMode) {
      const reason = Error.isError(err)
        ? err.name === 'AbortError' || err.name === 'TimeoutError'
          ? 'timeout'
          : 'rejected'
        : String(err);
      printDuration(`${name}-probe`, performance.now() - startTime);
      console.debug(`❌ ${name} is inaccessible: ${reason}`);
    }
    return false;
  }
};

/**
 * @returns {Promise<boolean>} The result when any of the provided tests are resolved or rejected.
 */
const checkGlobal = async () =>
  Promise.race([
    testEndpoint(globalName, globalUrl),
    testEndpoint(altGlobalName, altGlobalUrl),
  ]);

/**
 * Checks the accessibility of the primary geocoding service `DEFAULT_SERVICE`.
 * - If `forceInCn`, returns `false` immediately
 * - If `isCST`, checks global domains with a shorter time limit
 * @returns {Promise<boolean>} `true` if accessible and not `forceInCn`.
 */
export const checkGeoServiceAccessibility = async () => {
  const service = DEFAULT_SERVICE;
  if (forceInCn) {
    isDevMode &&
      console.debug(`🇨🇳 Pretend to be in CN (system tz: ${currentTz})`);
    return false;
  }
  try {
    if (!isCST) {
      await probeNominatim();
    } else {
      /* Possibly in CN, return the result */
      const isGlobal = await checkGlobal();
      if (isGlobal) {
        isDevMode &&
          console.debug(`✈️ You are outside CN but system tz is ${currentTz}`);
        return true;
      } else {
        isDevMode &&
          console.debug(`🇨🇳 You are in CN (system tz: ${currentTz})`);
        return false;
      }
    }
    return true;
  } catch (err) {
    /* When requesting by axios */
    if (axios.isCancel(err)) {
      isDevMode && console.debug(`${service} probe cancelled.`);
      return true;
    }
    if (axios.isAxiosError(err) && err.response) {
      const { status } = err.response;
      if (status === 405) {
        isDevMode &&
          console.debug(`⚠️ HEAD not allowed, but ${service} is reachable.`);
        return true;
      }
      console.warn(`HTTP ${status}: ${err.message ?? err.toJSON()}`);
      isDevMode &&
        console.debug(`⚠️ Using ${service} but the connection is bad.`);
      return true;
    }
    isDevMode &&
      console.debug(
        `🔴 ${service} inaccessible: ${Error.isError(err) ? err.message : err}`,
      );
    return false;
  }
};
