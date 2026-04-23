// src/utils/apiUtils.js
import axios from 'axios';
import config from './config';
import {
  CN_TIMEZONES,
  SERVER_ERR_MSG,
  SERVER_TIMEOUT_MSG,
  SERVER_DOWN_MSG,
  SERVER_NO_RES_MSG,
} from './constants';
import apiClient from '@utils/apiClient';
import { isDevMode, forceInCn } from './devMode';

const SERVER_PROBE_TIMEOUT = config.SERVER_TIMEOUT;
const SERVICE_PROBE_TIMEOUT = 3_000;

const nominatimSearchUrl = import.meta.env.VITE_NOMINATIM_SEARCH_URL;
const serverUrl = import.meta.env.VITE_SERVER_URL;
const eqxSolUrl = `${serverUrl}/equinox`;

const currentTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
export const isInCn = CN_TIMEZONES.has(currentTz);

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
 * Checks the server's accessibility by sending HTTP HEAD request.
 * @returns {Promise<null>}
 * @throws {Error} If request failed.
 */
export const checkServerAccessibility = async () => {
  try {
    isDevMode && console.debug('> Checking if server is up...');
    const params = { tz: 'Etc/GMT', year: '-1000', flag: 've' };
    const response = await apiClient.head(eqxSolUrl, {
      params,
      timeout: SERVER_PROBE_TIMEOUT,
    });
    const duration = response.config.metadata?.duration;
    if (isDevMode && duration) {
      console.debug(`⏳ (server-probe) Request took ${duration}ms`);
    }
    isDevMode && console.debug('✅ Server is up.\nURL:', serverUrl);
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
 * Checks Nominatim accessibility by sending HTTP HEAD request.
 * - If already in CN or `forceInCn` is `true`, skips prob and set `isAccessible` to `false`
 * @returns {Promise<boolean>} `true` if accessible and not force in CN.
 */
export const checkNominatimAccessibility = async () => {
  if (isInCn) {
    isDevMode && console.debug(`🇨🇳 You are currently in China (${currentTz})`);
    return false;
  }
  if (forceInCn) {
    isDevMode &&
      console.debug(`🇨🇳 Suppose you are in China (actual: ${currentTz})`);
    return false;
  }
  try {
    isDevMode && console.debug('> Checking if Nominatim is accessible...');
    const params = { q: '', format: 'json', email: import.meta.env.VITE_EMAIL };
    const response = await apiClient.head(nominatimSearchUrl, {
      params,
      timeout: SERVICE_PROBE_TIMEOUT,
    });
    const duration = response.config.metadata?.duration;
    if (isDevMode && duration) {
      console.debug(`⏳ (Nominatim-probe) Request took ${duration}ms`);
    }
    isDevMode && console.debug('✅ Nominatim is accessible.');
    return true;
  } catch (err) {
    if (axios.isCancel(err)) {
      isDevMode && console.debug('Nominatim probe cancelled.');
      return true;
    }
    if (axios.isAxiosError(err) && err.response) {
      const { status } = err.response;
      if (status === 405) {
        isDevMode &&
          console.debug('⚠️ HEAD not allowed, but Nominatim is reachable.');
        return true;
      }
      console.warn(`HTTP ${status}: ${err.message ?? err.toJSON()}`);
      isDevMode &&
        console.debug('⚠️ Using Nominatim but the connection is bad.');
      return true;
    }
    isDevMode &&
      console.debug(
        `🔴 Nominatim unaccessible: ${Error.isError(err) ? err.message : err}`,
      );
    return false;
  }
};
