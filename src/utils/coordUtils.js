// src/utils/coordUtils.js
import { LATITUDE } from './constants';
import { hmsToDecimal, decimalToHms } from './dateUtils';
import { pad } from './inputUtils';

/**
 * Converts signed DMS (Degrees, Minutes, Seconds) to decimal degrees.
 * @param {SignedDmsObj} dms - The signed DMS object.
 * @returns {number} The decimal degrees of the given DMS values.
 */
const dmsToDecimal = ({ sign, degrees, minutes, seconds }) => {
  const decimalDegrees = Math.abs(degrees) + minutes / 60 + seconds / 3600;
  if (decimalDegrees === 0) sign = 1;
  return sign * decimalDegrees;
};

/**
 * Converts decimal degrees to signed DMS (Degrees, Minutes, Seconds).
 * @param {number} decimalDegrees - Decimal degrees.
 * @param {number} [fractionDigits=0] - Defaults to 0.
 * @returns {SignedDmsObj} An object containing `sign`, absolute `degrees`, `minutes`, and decimal `seconds`.
 */
const decimalToDms = (decimalDegrees, fractionDigits = 0) => {
  const sign = decimalDegrees < 0 ? -1 : 1;
  const absDecimalDegrees = Math.abs(decimalDegrees);
  let absDegrees = Math.floor(absDecimalDegrees);
  const decimalMinutes = (absDecimalDegrees - absDegrees) * 60;
  let minutes = Math.floor(decimalMinutes);
  let seconds = (decimalMinutes - minutes) * 60;
  seconds = parseFloat(seconds.toFixed(fractionDigits));
  /* Handle carryover */
  if (seconds >= 60) {
    seconds -= 60;
    minutes += 1;
  }
  if (minutes === 60) {
    minutes = 0;
    absDegrees += 1;
  }
  if (absDegrees === 360) {
    absDegrees = 0;
  }
  return { sign, degrees: absDegrees, minutes, seconds };
};

/**
 * Formats signed DMS (Degrees, Minutes, Seconds) into a string.
 * @param {SignedDmsObj} dms - The signed DMS object.
 * @param {number} [fractionDigits=0] - Defaults to 0.
 * @returns {string} The formatted DMS string.
 */
const formatDms = ({ sign, degrees, minutes, seconds }, fractionDigits = 0) => {
  if (degrees === 0 && minutes === 0 && seconds === 0) sign = 1;
  const secondsStr = Number.isInteger(seconds)
    ? pad(seconds)
    : pad(seconds, fractionDigits);
  return `${sign < 0 ? '-' : '+'}${degrees}°${pad(minutes)}'${secondsStr}"`;
};

/**
 * Formats decimal degrees into a DMS string.
 * - Calls `decimalToDms` to convert the decimal degrees to a DMS object
 * - Calls `formatDms` to format the DMS object
 * @param {number} decimalDegrees - Decimal degrees.
 * @param {number} [fractionDigits=0] - Defaults to 0.
 * @returns {string} The formatted DMS string.
 * @see {@link decimalToDms}
 * @see {@link formatDms}
 */
const formatDecimalDegrees = (decimalDegrees, fractionDigits = 0) => {
  const dms = decimalToDms(decimalDegrees, fractionDigits);
  return formatDms(dms, fractionDigits);
};

/**
 * Converts signed DMS (Degrees, Minutes, Seconds) to signed HMS (Hours, Minutes, Seconds).
 * - Calls `dmsToDecimal` to convert the DMS object to decimal degrees. Then converts it to decimal hours
 * - Calls `decimalToHms` to convert the decimal hours to an HMS object
 * @param {SignedDmsObj} dms - The signed DMS object.
 * @param {number} [fractionDigits=0] - Defaults to 0.
 * @returns {SignedHmsObj} An object containing `sign`, absolute `hours`, `minutes`, and `seconds`.
 * @see {@link dmsToDecimal}
 * @see {@link decimalToHms}
 */
const dmsToHms = (dms, fractionDigits = 0) => {
  const decimalDegrees = dmsToDecimal(dms);
  const decimalHours = decimalDegrees / 15;
  return decimalToHms(decimalHours, fractionDigits);
};

/**
 * Converts signed HMS (Hours, Minutes, Seconds) to signed DMS (Degrees, Minutes, Seconds).
 * - Calls `hmsToDecimal` to convert the HMS object to decimal hours. Then converts to decimal degrees
 * - Calls `decimalToDms` to convert the decimal degrees to a DMS object
 * @param {SignedHmsObj} hms - The signed HMS object.
 * @param {number} [fractionDigits=0] - Defaults to 0.
 * @returns {SignedDmsObj} An object containing `sign`, absolute `degrees`, `minutes`, and `seconds`.
 * @see {@link hmsToDecimal}
 * @see {@link decimalToDms}
 */
const hmsToDms = (hms, fractionDigits = 0) => {
  const decimalHours = hmsToDecimal(hms);
  const decimalDegrees = decimalHours * 15;
  return decimalToDms(decimalDegrees, fractionDigits);
};

/**
 * Formats a geographic coordinate value into a string.
 * - Calls `decimalToDms` to convert the decimal degrees to a DMS object
 * @param {number} coordinate - A geographic coordinate value in decimal
 * @param {'lat' | 'lng'} type - `'lat'`: latitude, `'lng'`: longitude.
 * @returns {string} The formatted geographic coordinate string.
 * @see {@link decimalToDms}
 */
const formatCoordinate = (coordinate, type) => {
  const dms = decimalToDms(coordinate);
  const direction =
    type === LATITUDE
      ? coordinate < 0
        ? 'S'
        : 'N'
      : coordinate < 0
        ? 'W'
        : 'E';
  // return `${dms.degrees}°${pad(dms.minutes)}'${pad(dms.seconds, 3)}"${direction}`;
  return `${dms.degrees}°${pad(dms.minutes)}'${pad(dms.seconds)}"${direction}`;
};

export {
  dmsToDecimal,
  decimalToDms,
  formatDms,
  formatDecimalDegrees,
  dmsToHms,
  hmsToDms,
  formatCoordinate,
};
