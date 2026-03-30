// src/utils/constants.js
export const SERVICES = {
  nominatim: 'Nominatim',
  baidu: 'Baidu',
  // amap: 'Amap',
} as const;

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

/** @type {{id, number, abbr: string, name: string}[]} */
export const MONTHS = [
  { id: 0, abbr: '', name: '' },
  { id: 1, abbr: 'Jan', name: 'January' },
  { id: 2, abbr: 'Feb', name: 'February' },
  { id: 3, abbr: 'Mar', name: 'March' },
  { id: 4, abbr: 'Apr', name: 'April' },
  { id: 5, abbr: 'May', name: 'May' },
  { id: 6, abbr: 'Jun', name: 'June' },
  { id: 7, abbr: 'Jul', name: 'July' },
  { id: 8, abbr: 'Aug', name: 'August' },
  { id: 9, abbr: 'Sep', name: 'September' },
  { id: 10, abbr: 'Oct', name: 'October' },
  { id: 11, abbr: 'Nov', name: 'November' },
  { id: 12, abbr: 'Dec', name: 'December' },
] as const;

/** @type {Record<string, string>} */
export const EQX_SOL_NAMES = {
  ve: 'Vernal Equinox',
  ss: 'Summer Solstice',
  ae: 'Autumnal Equinox',
  ws: 'Winter Solstice',
} as const;

export const PLANETS = [
  'Mercury',
  'Venus',
  'Mars',
  'Jupiter',
  'Saturn',
  'Uranus',
  'Neptune',
  // 'Pluto',
];

/** @type {Record<string, { name: string, detail: string }>} */
export const PT_DETAIL = {
  D1: {
    name: 'Nautical Dawn',
    detail:
      "The star's position when the sun is 12 degrees below the horizon before sunrise. " +
      'At this time, stars brighter than magnitude 4 are visible to the naked eye in most parts of the sky.',
  },
  D2: {
    name: 'Civil Dawn',
    detail:
      "The star's position when the sun is 6 degrees below the horizon before sunrise. " +
      'At this time, stars brighter than magnitude 1 are visible to the naked eye in most parts of the sky.',
  },
  D3: {
    name: 'Sunrise',
    detail:
      "The star's position at sunrise. At this time, only the brightest stars or planets, " +
      'such as Venus and Jupiter, may be visible to the naked eye.',
  },
  N1: {
    name: 'Sunset',
    detail:
      "The star's position at sunset. At this time, only the brightest stars or planets, " +
      'such as Venus and Jupiter, may be visible to the naked eye.',
  },
  N2: {
    name: 'Civil Dusk',
    detail:
      "The star's position when the sun is 6 degrees below the horizon after sunset. " +
      'At this time, stars brighter than magnitude 1 are visible to the naked eye in most parts of the sky.',
  },
  N3: {
    name: 'Nautical Dusk',
    detail:
      "The star's position when the sun is 12 degrees below the horizon after sunset. " +
      'At this time, stars brighter than magnitude 4 are visible to the naked eye in most parts of the sky.',
  },
  R: {
    name: 'Rising Point',
    detail: 'The point where the star appears to rise above the horizon.',
  },
  T: {
    name: 'Meridian Transit',
    detail: 'The point where the star transits the meridian.',
  },
  S: {
    name: 'Setting Point',
    detail: 'The point where the star appears to dip below the horizon.',
  },
  NCP: { name: 'North Celestial Pole', detail: '' },
  SCP: { name: 'South Celestial Pole', detail: '' },
  Z: { name: 'Zenith', detail: '' },
} as const;

/** @type {Record<string, string>} */
export const LINE_DETAIL = {
  solid: "The star's path in the nighttime sky.",
  darkDashed: "The star's path during nautical twilight.",
  lightDashed: "The star's path during civil twilight.",
  dotted: "The star's path in the daytime sky.",
} as const;

export const LATITUDE = 'lat';
export const LONGITUDE = 'lng';

export const INFO_KEYS = new Set([
  'lat',
  'lng',
  'tz', // `tz_id` in the server
  'offset', // UT1 offset in hours
  'flag',
  'cal',
  'name',
  'hip',
  'ra',
  'dec',
]);

/** Reverse geocoding fails or returns nothing (will toggle to coordinate mode) */
export const LOC_UNKNOWN_ID = 'unknown-id';
/** Reverse geocoding fails or returns nothing (will toggle to coordinate mode) */
export const LOC_UNKNOWN = 'unknown';

export const WARNING_PREFIX = 'WARNING:';

export const UNKNOWN_ERR_MSG = 'An unknown error occurred. Check the console.';

const SERVER_ERR_TAIL =
  'We apologize for the inconvenience and our team is working to resolve this ' +
  'as quickly as possible. Please check back later.';
export const SERVER_ERR_PREFIX = 'SERVER ERROR:';
export const SERVER_ERR_MSG =
  SERVER_ERR_PREFIX +
  'Server error. Please try again or check back in a few minutes.';
export const SERVER_TIMEOUT_MSG =
  SERVER_ERR_PREFIX +
  'We are currently experiencing issues connecting to the server. ' +
  SERVER_ERR_TAIL;
export const SERVER_DOWN_MSG =
  SERVER_ERR_PREFIX +
  'It looks like the server is temporarily down or overloaded. ' +
  SERVER_ERR_TAIL;
export const SERVER_NO_RES_MSG =
  SERVER_ERR_PREFIX +
  'It looks like the server is not accessible due to a network error. ' +
  SERVER_ERR_TAIL;

export const SERVICE_ERR_MSG =
  'Service not available. Please enter the coordinates manually. ⤴';

export const REVERSE_GEO_ERR_MSG =
  'We are having trouble fetching your current address. ' +
  'You can still use the coordinates of your current position. ↓';

export const LOCATION_NOT_FOUND_MSG = 'Location not found.';

export const EPH_RANGE_ERR_PREFIX = 'Out of the ephemeris date range: ';

export const HIP_INVALID_PREFIX = 'Invalid Hipparcos Catalogue number: ';
export const HIP_OUT_OF_RANGE_MSG =
  'The Hipparcos Catalogue number must be in the range ' +
  `[${HIP_MIN}, ${HIP_MAX}].`;
export const HIP_NOT_FOUND_MSG = 'No match found.';
