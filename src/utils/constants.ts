// src/utils/constants.js
/**
 * Traditional Chinese language codes that will be mapped to `'zh-Hant'`
 * for traditional Chinese formatting.
 */
export const CC_HANT_CODES = ['zh-HK', 'zh-Hant'];

export const SERVICES = {
  nominatim: 'Nominatim',
  baidu: 'Baidu',
  tianditu: 'Tianditu', // 天地图
  qq: 'QQ', // 腾讯
  // amap: 'Amap',  // 高德
} as const;

const serviceCnFromEnv = import.meta.env.VITE_SERVICE_CN;
/**
 * @type {GeoService} Default primary geocoding service in CN.
 * Sets to `'QQ'` or reads from `VITE_SERVICE_CN`.
 */
export const DEFAULT_SERVICE_CN =
  Object.values(SERVICES).includes(serviceCnFromEnv) &&
  serviceCnFromEnv !== SERVICES.tianditu &&
  serviceCnFromEnv !== SERVICES.nominatim
    ? serviceCnFromEnv
    : SERVICES.qq;

const reverseServiceCnFromEnv = import.meta.env.VITE_REVERSE_SERVICE_CN;
/**
 * @type {GeoService} Default reverse geocoding service in CN.
 * Sets to `'Tianditu'` or reads from `VITE_REVERSE_SERVICE_CN`.
 */
export const DEFAULT_REVERSE_SERVICE_CN =
  Object.values(SERVICES).includes(reverseServiceCnFromEnv) &&
  reverseServiceCnFromEnv !== SERVICES.nominatim
    ? reverseServiceCnFromEnv
    : SERVICES.tianditu;

export const CN_TIMEZONES = new Set([
  'Asia/Shanghai',
  'Asia/Urumqi',
  'Asia/Chongqing',
  'Asia/Harbin',
  'Asia/Kashgar',
]);

/** Ephemeris date range in Gregorian calendar: `[-3000, 1, 29]` -- `[3000, 5, 6]` */
export const EPH_RANGE = {
  /** `[year, month, day]` = 29 January 3001 BCE */
  min: [-3000, 1, 29],
  /** `[year, month, day]` = 6 May 3000 CE */
  max: [3000, 5, 6],
};

/** Ephemeris date range in Julian calendar: `[-3000, 2, 23]` -- `[3000, 4, 15]` */
export const EPH_RANGE_JULIAN = {
  /** `[year, month, day]` = 23 February 3001 BCE */
  min: [-3000, 2, 23],
  /** `[year, month, day]` = 15 April 3000 CE */
  max: [3000, 4, 15],
};

export const HIP_MIN = 1;
export const HIP_MAX = 118322;

export const STORAGE_KEYS = {
  service: 'star-path-viewer:geocoding-service',
  hip: 'star-path-viewer:hip-list',
} as const;

export const CALS = {
  gregorian: '',
  julian: 'j',
} as const;

export const LOC_INPUT_TYPES = {
  addr: 'address',
  coord: 'coordinates',
} as const;

export const STAR_INPUT_TYPES = {
  name: 'name',
  hip: 'hip',
  radec: 'radec',
} as const;

export const RADEC_TYPES = {
  dd: 'decimal',
  dms: 'dms',
} as const;

// /** @type {{id, number, abbr: string, name: string}[]} */
// export const MONTHS = [
//   { id: 0, abbr: '', name: '' },
//   { id: 1, abbr: 'Jan', name: 'January' },
//   { id: 2, abbr: 'Feb', name: 'February' },
//   { id: 3, abbr: 'Mar', name: 'March' },
//   { id: 4, abbr: 'Apr', name: 'April' },
//   { id: 5, abbr: 'May', name: 'May' },
//   { id: 6, abbr: 'Jun', name: 'June' },
//   { id: 7, abbr: 'Jul', name: 'July' },
//   { id: 8, abbr: 'Aug', name: 'August' },
//   { id: 9, abbr: 'Sep', name: 'September' },
//   { id: 10, abbr: 'Oct', name: 'October' },
//   { id: 11, abbr: 'Nov', name: 'November' },
//   { id: 12, abbr: 'Dec', name: 'December' },
// ] as const;

/** @type {Record<string, string>} */
export const EQX_SOL_NAMES = {
  ve: 'vernal_equinox',
  ss: 'summer_solstice',
  ae: 'autumnal_equinox',
  ws: 'winter_solstice',
} as const; // i18n keys

export const PLANETS = [
  'mercury',
  'venus',
  'mars',
  'jupiter',
  'saturn',
  'uranus',
  'neptune',
]; // i18n keys

export const POINT_LABELS = [
  'D1',
  'D2',
  'D3',
  'N1',
  'N2',
  'N3',
  'R',
  'T',
  'S',
  'NCP',
  'SCP',
  'Z',
] as const;

export const LINE_STYLES = [
  'solid',
  'darkDashed',
  'lightDashed',
  'dotted',
] as const;

export const LATITUDE = 'lat';
export const LONGITUDE = 'lng';

export const INFO_KEYS = new Set([
  'lat',
  'lng',
  'tz', // `tz_id` in the server
  'tzname', // `tz_name` in the server
  'offset', // Standard Time offset in decimal hours
  'flag',
  'cal',
  'name',
  'hip',
  'ra',
  'dec',
  'date_cc',
]);

/**
 * Will be set as the `display_name` and `id` if reverse geocoding fails
 * or returns empty address (then will toggle to coordinate mode).
 */
export const LOC_UNKNOWN_ID = 'unknown-address';

export const WARNING_PREFIX_SERVER = 'WARNING:';
export const WARNING_PREFIX = 'errors:warn_'; // i18n key starts with

export const UNKNOWN_ERR_MSG = 'errors:unknown_error'; // i18n key

export const SERVER_ERR_PREFIX = 'errors:server_'; // i18n key starts with
export const SERVER_ERR_MSG = 'errors:server_error'; // i18n key
export const SERVER_TIMEOUT_MSG = 'errors:server_timeout'; // i18n key
export const SERVER_DOWN_MSG = 'errors:server_503'; // i18n key
export const SERVER_NO_RES_MSG = 'errors:server_no_response'; // i18n key

export const SERVICE_ERR_MSG = 'errors:service_unavailable'; // i18n key

export const LOCATION_NOT_FOUND_MSG = 'errors:location_not_found'; // i18n key

export const EPH_RANGE_ERR_PREFIX = 'Out of the ephemeris date range: '; // only used in validateDateSync
export const EPH_RANGE_ERR_MSG_G = 'errors:out_of_ephemeris_range'; // i18n key

export const HIP_INVALID_PREFIX = 'Invalid Hipparcos Catalogue number: '; // only used in validateStarHipSync
export const HIP_OUT_OF_RANGE_MSG = 'errors:hip_out_of_range'; // i18n key
export const HIP_NOT_FOUND_MSG = 'errors:hip_not_found'; // i18n key

export const INTERNAL_ERR_LIST = [
  { hint: 'never rises', msg: 'errors:warn_star_never_rises' },
  { hint: 'no ra/dec', msg: 'errors:warn_no_radec' },
  { hint: 'entry not found', msg: 'errors:warn_entry_hot_in_hip' },
]; // msg: i18n key
