// src/utils/fetchDate.js
import axios from 'axios';
import config from './config';
import apiClient from './apiClient';
import { printDuration, parseApiError } from './apiUtils';
import { isDevMode } from './devMode';

const NO_DATA_ERR_MSG = 'errors:no_season_data_returned'; // i18n key
const DATE_ERR_MSG = 'errors:season_error'; // i18n key

const eqxSolUrl = `${import.meta.env.VITE_SERVER_URL}/equinox`;

/**
 * Fetches the equinox/solstice date in the given year at the location
 * and returns the updated date.
 * @param {string} year - Year. 0 is 1 BCE.
 * @param {Flag} flag
 * @param {string} lat - Latitude (-90 <= `lat` <=90).
 * @param {string} lng - Longitude (-180 <= `lng` <=180).
 * @param {string} tz - The time zone ID.
 * @returns {Promise<DateObj | null>} The updated date object, or `null` if aborted.
 * @throws {Error} If request failed.
 */
const fetchDate = async (year, flag, lat, lng, tz) => {
  isDevMode && console.debug('> Fetching equinox/solstice date...');
  try {
    /* Fetch the equinox/solstice date */
    const response = await apiClient.get(eqxSolUrl, {
      params: { lat, lng, tz, year, flag },
      timeout: config.SERVER_TIMEOUT,
    });
    const duration = response.config.metadata?.duration;
    duration && isDevMode && printDuration('server-date', duration);
    /** @type {EqxSolSchema} */
    const data = response.data;
    if (!data) throw new Error(NO_DATA_ERR_MSG);
    isDevMode && console.debug(`[Query (${flag})]`, year, lat, lng, tz);
    isDevMode && console.debug('[Date & time]', data.results);

    /** @type {number[]} */
    const [_year, _month, _day, _hours, _minutes, _seconds] = data.results;

    /* Verify date and tz values */
    if (year !== _year.toString()) {
      console.error(`Queried year ${year} but received:`, _year);
      throw new Error(DATE_ERR_MSG);
    }
    if (_month <= 0 || _day <= 0) {
      console.error(
        `Returned equinox/solstice invalid date: (${_year}, ${_month}, ${_day})`,
      );
      throw new Error(DATE_ERR_MSG);
    }
    if (data.tz !== tz && tz) {
      console.warn(`Returned tz '${data.tz}' does't match '${tz}' in params`);
    }

    /* Update the month and day */
    const newDate = { year, month: _month.toString(), day: _day.toString() };

    return newDate;
  } catch (err) {
    /* If the request was cancelled/aborted, stop retrying */
    if (axios.isCancel(err)) {
      isDevMode &&
        console.debug(`Equinox/Solstice(${flag}) date fetching cancelled.`);
      return null;
    }
    throw parseApiError(err);
  }
};

export default fetchDate;
