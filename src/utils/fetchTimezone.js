// src/utils/fetchTimezone.js
import { getIsDevMode } from './devMode';

/**
 * Calls `window.GeoTZ.find` to find the time zone IDs at the given GPS coordinates.
 * - Warns if failed (`tz` will be determined by the server)
 * @param {string} lat - Latitude (-90 <= `lat` <= 90).
 * @param {string} lng - Longitue (-180 <= `lng` <= 180).
 * @returns {Promise<string | null>} The selected primary TZID, or `null` if aborted.
 * @throws {Error} If tz is not found or invalid.
 */
const fetchTimezone = async (lat, lng) => {
  const isDevMode = getIsDevMode();
  try {
    /* Fetch the time zone IDs */
    const res = await window.GeoTZ.find(parseFloat(lat), parseFloat(lng));
    if (!Array.isArray(res) || res.length === 0 || !res[0]) {
      throw new Error(`GeoTZ returns invalid time zone ID: ${res}`);
    }
    isDevMode && console.debug('[lat,lng]', lat, lng);
    isDevMode && res.length > 1 && console.debug('[Timezone IDs]', res);
    /** @type {string} */
    let tz = res[0];

    /* A temporary correction */
    if (res[0] === 'Asia/Urumqi' && res.includes('Asia/Shanghai')) {
      /* Select one as the primary tz */
      tz = 'Asia/Shanghai';
      getIsDevMode() &&
        console.debug(`Reset primary tz from ${res[0]} to ${tz}`);
    }

    return tz;
  } catch (err) {
    /* If the request was cancelled/aborted, stop retrying */
    if (Error.isError(err) && err.name === 'AbortError') {
      getIsDevMode() && console.debug('Time zone ID fetching cancelled.');
      return null;
    }
    console.warn(
      `Unable to fetch the time zone ID at (${lat}, ${lng}):`,
      Error.isError(err) ? err.message : err,
    );
    console.debug('The time zone ID will be determined by the server.');
    throw err;
  }
};

export default fetchTimezone;
