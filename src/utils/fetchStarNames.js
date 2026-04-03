// src/utils/fetchStarNames.js
import axios from 'axios';
import {
  HIP_MIN,
  HIP_MAX,
  HIP_OUT_OF_RANGE_MSG,
  HIP_NOT_FOUND_MSG,
} from './constants';
import { getIsDevMode } from './devMode';

const HIP_TIMEOUT = 5_000;

const NO_DATA_ERR_MSG = 'Unable to fetch HIP list: no data returned.';
const HIP_LIST_ERR_MSG =
  'HIP list not loaded. Please reload the page and try again.';
const HIP_LIST_INVALID_MSG =
  'HIP list unavailable. Please reload the page and try again.';

/** At most this number of items to show. */
const limit = 30;
const starNamesUrl = import.meta.env.VITE_STAR_NAMES_URL;

/**
 * Normalizes Pinyin.
 * - Squashes spaces
 * - Converts to lowercase
 * - Uses '/' as the separator
 * - Enables typing 'v' or 'yu' for 'ü'
 * - Unicode normalization (form: NFC)
 * @param {string} str
 * */
const normalizePinyin = (str) => {
  return (
    str
      /* Squash spaces */
      .replace(/\s+/g, ' ')
      /* Case-insensitive */
      .toLowerCase()
      /* For consistency, use '/' as the separator */
      .replace(/\s*[,;|]\s*/g, '/')
      /* Enable typing 'v' or 'yu' for 'ü' */
      .replace(/([ln])(v|yu)/g, '$1ü')
      /* Unicode normalization */
      .normalize('NFC')
  );
};

/**
 * @param {HipItem} item
 * @param {string} query
 */
const itemContainsQuery = (item, query) => {
  /* If the query is a number and matches a HIP, collect it */
  if (query === item.hip.toString()) return true;

  const normalizedQuery = normalizePinyin(query);

  /* Concatenate values of all fields into a string
     For consistency, use '/' as the separator
     (enables querying 'field1,field2,...' or field1/field2/...') */
  let concatenatedFields = Object.values(item)
    .join('/')
    /* Case-insensitive */
    .toLowerCase()
    /* For consistency, remove '.' in 'mu._Xxx', 'nu._Xxx' and 'pi._Xxx' */
    .replace(/\./g, '');
  /* For consistency, append alternatives */
  concatenatedFields +=
    ' | ' + concatenatedFields.replace(/chi_/g, 'xi_').replace(/ü/g, 'u');

  return (
    /* Is a substring, collect it
     * Otherwise, try looking for 'x Xxx' instead of 'x_Xxx'
     */
    concatenatedFields.includes(normalizedQuery) ||
    concatenatedFields.replace(/_/g, ' ').includes(normalizedQuery)
  );
};

// /**
//  * @param {HipItem<string>} a
//  * @param {HipItem<string>} b
//  * @param {string} match
//  */
// const compareHip = (a, b, match) => {
//   /* If match is the HIP of a, put a before b */
//   if (a.hip === match) return -1;
//   /* If match is the HIP of b, put b before a */
//   if (b.hip === match) return 1;
//   /* Otherwise, sort by HIP */
//   return parseInt(a.hip) - parseInt(b.hip);
// };

/**
 * Fetches and caches the HIP list.
 * @param {(data: HipItem[]) => void} setHipList -Sets `hipList` and stores in `localStorage`.
 * @returns {Promise<HipItem[] | null>} The HIP list, or `null` if aborted.
 * @throws {Error} If request failed or result is invalid.
 */
const fetchAndCacheHipList = async (setHipList) => {
  const isDevMode = getIsDevMode();
  isDevMode && console.debug('> Fetching HIP list...');

  try {
    const response = await axios.get(starNamesUrl, {
      timeout: HIP_TIMEOUT,
    });
    /** @type {HipItem[]} */
    const data = response.data;
    if (!data) throw new Error(NO_DATA_ERR_MSG);

    if (!Array.isArray(data) || data.length === 0) {
      console.error('HIP list fetching returned invalid data:', data);
      throw new Error(HIP_LIST_INVALID_MSG);
    }
    /* Update state and cache data */
    setHipList(data);
    isDevMode && console.debug('✅ HIP list loaded and cached.');
    isDevMode && console.debug('🗂️ [HIP list]', data.length, 'entries');
    return data;
  } catch (err) {
    /* If the request was cancelled/aborted, stop retrying */
    if (axios.isCancel(err)) {
      isDevMode && console.debug('HIP list fetching cancelled.');
      return null;
    }
    console.error(
      'Error fetching HIP list:',
      Error.isError(err) ? err.message : err,
    );
    throw new Error(HIP_LIST_ERR_MSG, { cause: err });
  }
};

/**
 * Fetches star name suggestions (`query` should be trimmed before calling).
 * Fetches the HIP list if not cached.
 * @param {string} query
 * @param {HipItem[] | null} hipList
 * @param {(data: HipItem[]) => void} setHipList - Sets `hipList` and stores in `localStorage`.
 * @returns {Promise<StarItem[] | null>} An array of data, or `null` if aborted.
 * @throws {Error} If HIP is out of range, not found, or failed to fetch valid data.
 */
const fetchStarNames = async (query, hipList, setHipList) => {
  const isDevMode = getIsDevMode();
  let data = hipList;
  /* Fetch and cache the HIP list */
  if (!data || (Array.isArray(data) && data.length === 0)) {
    isDevMode && console.debug('⚠️ HIP list not cached yet.');
    /* Update if not aborted and no errors */
    data = await fetchAndCacheHipList(setHipList);
  }
  if (!data) throw new Error(HIP_LIST_ERR_MSG);

  /* Parse the fetched/cached HIP list ------------------------------ */
  /* Find items with fields containing the query (case-insensitive)
     If the query is a number, it could be either a HIP or part of a name */
  /** @type {StarItem[]} */
  const matches = data
    .filter((item) => itemContainsQuery(item, query))
    .slice(0, limit)
    /* Prepare the return objects */
    .map((item) => ({
      hip: item.hip.toString(),
      /* For consistency, remove '.' in 'mu._Xxx', 'nu._Xxx' and 'pi._Xxx' */
      name: item.name.replace(/\./g, ''),
      name_zh: item.name_zh || '',
      name_zh_hk: item.name_zh_hk || '',
      pinyin: item.pinyin || '',
      /* Display the HIP */
      display_name: item.hip.toString(),
    }));
  // isDevMode && console.debug('[Query]', query, '\n[Stars]', matches);

  /* If matches HIP, put at the top, otherwise sort by HIP */
  // matches.sort((a, b) => compareHip(a, b, query));
  // isDevMode && console.debug('[Sorted stars]', matches);

  /* If the query is a number but not any HIP in the list,
     set it as a HIP without names and put this new item at the top */
  /** @type {StarItem[]} */
  const hipOnlyItems = [];
  if (/^\d+$/.test(query) && !matches.find((item) => item.hip === query)) {
    const hipInt = parseInt(query, 10);
    if (hipInt < HIP_MIN || hipInt > HIP_MAX) {
      throw new Error(HIP_OUT_OF_RANGE_MSG);
    }
    hipOnlyItems.push({
      hip: query,
      name: '',
      name_zh: '',
      name_zh_hk: '',
      pinyin: '',
      /* Display the HIP or a warning */
      display_name: query,
    });
  }

  /* Return all selected items */
  if (hipOnlyItems.length > 0 || matches.length > 0) {
    /* [...hipOnlyItems, ...matches] */
    const res = hipOnlyItems.concat(matches);
    return res;
  } else {
    throw new Error(HIP_NOT_FOUND_MSG);
  }
};

export { fetchAndCacheHipList, fetchStarNames };
