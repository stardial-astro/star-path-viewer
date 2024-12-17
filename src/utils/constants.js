// src/utils/constants.js
export const EPH_DATE_MIN = [-3000, 1, 29];  // 29 January 3001 BCE
export const EPH_DATE_MAX = [3000, 5, 6];    // 6 May 3000 CE

export const EPH_DATE_MIN_JULIAN = [-3000, 2, 23];  // 23 February 3001 BCE
export const EPH_DATE_MAX_JULIAN = [3000, 4, 15];   // 15 April 3000 CE

export const HIP_MIN = 1;
export const HIP_MAX = 118322;

export const MONTHS = [
  { abbr: '', name: '' },
  { abbr: 'Jan', name: 'January' },
  { abbr: 'Feb', name: 'February' },
  { abbr: 'Mar', name: 'March' },
  { abbr: 'Apr', name: 'April' },
  { abbr: 'May', name: 'May' },
  { abbr: 'Jun', name: 'June' },
  { abbr: 'Jul', name: 'July' },
  { abbr: 'Aug', name: 'August' },
  { abbr: 'Sep', name: 'September' },
  { abbr: 'Oct', name: 'October' },
  { abbr: 'Nov', name: 'November' },
  { abbr: 'Dec', name: 'December' },
];

export const STARS = {
  Mercury: 'mercury',
  Venus: 'venus',
  Mars: 'mars',
  Jupiter: 'jupiter',
  Saturn: 'saturn',
  Uranus: 'uranus',
  Neptune: 'neptune',
  // Pluto: 'pluto',
};

export const PT_DETAIL = {
  D1: { name: "Nautical Dawn", detail: "The star's position when the sun is 12 degrees below the horizon before sunrise. At this time, stars brighter than magnitude 4 are visible to the naked eye in most parts of the sky." },
  D2: { name: "Civil Dawn", detail: "The star's position when the sun is 6 degrees below the horizon before sunrise. At this time, stars brighter than magnitude 1 are visible to the naked eye in most parts of the sky." },
  D3: { name: "Sunrise", detail: "The star's position at sunrise. At this time, only the brightest stars or planets, such as Venus and Jupiter, may be visible to the naked eye." },
  N1: { name: "Sunset", detail: "The star's position at sunset. At this time, only the brightest stars or planets, such as Venus and Jupiter, may be visible to the naked eye." },
  N2: { name: "Civil Dusk", detail: "The star's position when the sun is 6 degrees below the horizon after sunset. At this time, stars brighter than magnitude 1 are visible to the naked eye in most parts of the sky." },
  N3: { name: "Nautical Dusk", detail: "The star's position when the sun is 12 degrees below the horizon after sunset. At this time, stars brighter than magnitude 4 are visible to the naked eye in most parts of the sky." },
  R: { name: 'Rising Point', detail: 'The point where the star appears to rise above the horizon.' },
  T: { name: 'Meridian Transit', detail: 'The point where the star transits the meridian.' },
  S: { name: 'Setting Point', detail: 'The point where the star appears to dip below the horizon.' },
  NCP: { name: 'North Celestial Pole', detail: '' },
  SCP: { name: 'South Celestial Pole', detail: '' },
  Z: { name: 'Zenith', detail: '' },
};

export const LINE_DETAIL = {
  solid: "The star's path in the nighttime sky.",
  darkDashed: "The star's path during nautical twilight.",
  lightDashed: "The star's path during civil twilight.",
  dotted: "The star's path in the daytime sky.",
}

export const EQX_SOL_NAMES = {
  ve: 'Vernal Equinox',
  ss: 'Summer Solstice',
  ae: 'Autumnal Equinox',
  ws: 'Winter Solstice',
};

export const EQX_SOL_KEYS = {
  ve: 'vernal_time',
  ss: 'summer_time',
  ae: 'autumnal_time',
  ws: 'winter_time',
};

export const TYPE_ADDR = 'address';
export const TYPE_COORD = 'coordinates';

export const GREGORIAN = '';
export const JULIAN = 'j';

export const TYPE_NAME = 'name';
export const TYPE_HIP = 'hip';
export const TYPE_RADEC = 'radec';

export const FORMAT_DD = 'decimal';
export const FORMAT_DMS = 'dms';

export const ADDR_UNKNOWN = 'unknown';
export const ADDR_NOT_FOUND = 'not-found';

export const HIP_OUT_OF_RANGE = 'out-of-range';
export const HIP_NOT_FOUND = 'not-found';
