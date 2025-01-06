// src/utils/dateUtils.js
import { MONTHS } from './constants';

const pad = number => number.toString().padStart(2, '0');

/**
 * Converts HMS (Hours, Minutes, Seconds) to decimal hours.
 *
 * @param {Object} params - An object containing `sign`, absolute `hours`, `minutes`, and `seconds`.
 * @param {number} params.sign - The sign of the hours (-1 or 1).
 * @param {number} params.hours - The absolute hours component.
 * @param {number} params.minutes - The minutes component.
 * @param {number} params.seconds - The seconds component (integer or float).
 * @returns {number} The decimal hours of the given HMS values.
 */
const hmsToDecimal = ({ sign, hours, minutes, seconds }) => {
  const absDecimalHours = Math.abs(hours) + (minutes / 60) + (seconds / 3600);
  return sign * absDecimalHours;
};

/**
 * Converts decimal hours to HMS (Hours, Minutes, Seconds).
 *
 * @param {number} decimalHours - Decimal hours.
 * @returns {Object} An object containing `sign`, absolute `hours`, `minutes`, and rounded `seconds`.
 */
const decimalToHMS = (decimalHours) => {
  const sign = decimalHours < 0 ? -1 : 1;
  const absDecimalHours = Math.abs(decimalHours);
  let absHours = Math.floor(absDecimalHours);
  const decimalMinutes = (absDecimalHours - absHours) * 60;
  let minutes = Math.floor(decimalMinutes);
  let seconds = Math.round((decimalMinutes - minutes) * 60);  // int
  /* Handle carryover */
  if (seconds === 60) {
    seconds = 0;
    minutes += 1;
  }
  if (minutes === 60) {
    minutes = 0;
    absHours += 1;
  }
  return { sign, hours: absHours, minutes, seconds };
};

/**
 * Formats HMS (Hours, Minutes, Seconds) into a string.
 *
 * @param {Object} params - An object containing `sign`, absolute `hours`, `minutes`, and `seconds`.
 * @param {number} params.sign - The sign of the hours (-1 or 1).
 * @param {number} params.hours - The hours component.
 * @param {number} params.minutes - The minutes component.
 * @param {number} params.seconds - The seconds component (integer or float).
 * @returns {string} The formatted HMS string.
 */
const formatHMS = ({ sign, hours, minutes, seconds }) => {
  // return `${sign < 0 ? '-' : '+'}${hours}h${pad(minutes)}m${seconds.toFixed(2).padStart(5, '0')}s`;
  return `${sign < 0 ? '-' : '+'}${hours}h${pad(minutes)}m${pad(seconds)}s`;
};

/**
 * Formats decimal hours into an HMS string.
 * Calls `decimalToHMS` to convert the decimal hours to an HMS object.
 * Calls `formatHMS` to format the HMS object.
 *
 * @param {number} decimalHours - Decimal hours.
 * @returns {string} The formatted HMS string.
 *
 * @see decimalToHMS
 * @see formatHMS
 */
const formatDecimalHours = (decimalHours) => {
  const hms = decimalToHMS(decimalHours);
  return formatHMS(hms);
};

/**
 * Formats the datetime into strings in the format 'January 1, 2000 CE' and '12:00:00'.
 *
 * @param {Object} params - An object containing `year`, `month`, `day`, `hour`, `minute`, `second`, and some switches.
 * @param {number} params.year - Year. 0 is 1 BCE.
 * @param {number} [params.month=1] - Month. Starts from 1. Defaults to `1` (January).
 * @param {number} [params.day=1] - Day of the month. Defaults to `1`.
 * @param {number} [params.hour=12] - Hours in 24-hour format. Defaults to `12`.
 * @param {number} [params.minute=0] - Minutes. Defaults to `0`.
 * @param {number} [params.second=0] - Seconds (integer or float). Defaults to `0`.
 * @param {boolean} [params.monthFirst=true] - Whether to use month-day-year instead of day-month-year format. Defaults to `true`.
 * @param {boolean} [params.abbr=false] - Whether to use abbreviation instead of full name for month. Defaults to `false`.
 * @returns {Object} An object containing three formatted strings: full `date`, `time`, and the `year` only.
 */
const formatDateTime = ({ year, month = 1, day = 1, hour = 12, minute = 0, second = 0,
                          monthFirst = true, abbr = false }) => {
  const yearStr = year > 0 ? `${year} CE` : `${-year + 1} BCE`;
  const monthStr = MONTHS[month][abbr ? 'abbr' : 'name'];
  const dateStr = monthFirst
    ? `${monthStr} ${day}, ${yearStr}`
    : `${day} ${monthStr} ${yearStr}`;
  // const secondStr = Number.isInteger(second) ? pad(second) : second.toFixed(3).padStart(6, '0');
  const secondStr = second.toFixed().padStart(2, '0');
  const timeStr = `${pad(hour)}:${pad(minute)}:${secondStr}`;
  return { date: dateStr, time: timeStr, year: yearStr };
};

/**
 * Formats the datetime into ISO 8601 format strings '+2000-01-01' and '12:00:00'.
 *
 * @param {Object} params - An object containing `year`, `month`, `day`, `hour`, `minute`, and `second`.
 * @param {number} params.year - Year. 0 is 1 BCE.
 * @param {number} [params.month=1] - Month. Starts from 1. Defaults to `1` (January).
 * @param {number} [params.day=1] - Day of the month. Defaults to `1`.
 * @param {number} [params.hour=12] - Hours in 24-hour format. Defaults to `12`.
 * @param {number} [params.minute=0] - Minutes. Defaults to `0`.
 * @param {number} [params.second=0] - Seconds (integer or float). Defaults to `0`.
 * @returns {Object} An object containing two formatted strings: `date` and `time`.
 */
const formatDateTimeISO = ({ year, month = 1, day = 1, hour = 12, minute = 0, second = 0 }) => {
  const yearStr = year >= 0 ? '+' + year.toString().padStart(4, '0') : '-' + (-year).toString().padStart(4, '0');
  const dateStr = [yearStr, pad(month), pad(day)].join('-');
  // const secondStr = Number.isInteger(second) ? pad(second) : second.toFixed(3).padStart(6, '0');
  const secondStr = second.toFixed().padStart(2, '0');
  const timeStr = `${pad(hour)}:${pad(minute)}:${secondStr}`;
  return { date: dateStr, time: timeStr };
};

/**
 * Formats a datetime array into a string.
 * Calls `formatDateTimeISO` or `formatDateTime` to format the date and time. Then joins them.
 *
 * @param {Object} params - An object containing a datetime array and some switches.
 * @param {number[]} params.dateTime - An array [year, month, day, hour, minute, second].
 * @param {boolean} [params.iso=true] - Whether to use ISO format or not. Defaults to `true`.
 * @param {string} [params.delim=' '] - Delimiter between date and time in ISO format. Defaults to `' '`.
 * @param {boolean} [params.monthFirst=true] - Whether to use month-day-year instead of day-month-year format. Defaults to `true`.
 * @param {boolean} [params.abbr=false] - Whether to use abbreviation or full name for month. Defaults to `false`.
 * @returns {string} The formatted date and time string.
 *
 * @see formatDateTimeISO
 * @see formatDateTime
 */
const dateTimeToStr = ({ dateTime, iso = true, delim = ' ', monthFirst = true, abbr = false }) => {
  if (!Array.isArray(dateTime) || dateTime.length < 6) return '';

  const [year, month, day, hour, minute, second] = dateTime.map((value, index) => {
    if (index === 5) return parseFloat(value);  // Parse the second as float
    return parseInt(value);  // Parse other values as int
  });

  const dateTimeStrList = iso
    ? formatDateTimeISO({ year, month, day, hour, minute, second })
    : formatDateTime({ year, month, day, hour, minute, second, monthFirst, abbr });
  const dateTimeStr = iso
    ? `${dateTimeStrList.date}${delim}${dateTimeStrList.time}`
    : `${dateTimeStrList.date}, ${dateTimeStrList.time}`;
  return dateTimeStr;
};

/**
 * Formats a date array into a string.
 * Calls `formatDateTimeISO` or `formatDateTime` to format the date.
 *
 * @param {Object} params - An object containing a date array and some switches.
 * @param {number[]} params.date - An array [year, month, day].
 * @param {boolean} [params.iso=true] - Whether to use ISO format. Defaults to `true`.
 * @param {boolean} [params.monthFirst=true] - Whether to use month-day-year instead of day-month-year format. Defaults to `true`.
 * @param {boolean} [params.abbr=false] - Whether to use abbreviation instead of full name for month. Defaults to `false`.
 * @returns {string} The formatted date string.
 *
 * @see formatDateTimeISO
 * @see formatDateTime
 */
const dateToStr = ({ date, iso = true, monthFirst = true, abbr = false }) => {
  if (!Array.isArray(date) || date.length < 3) return '';

  const [year, month, day] = date.map((value) => parseInt(value));

  const dateStr = iso
    ? formatDateTimeISO({ year, month, day }).date
    : formatDateTime({ year, month, day, monthFirst, abbr }).date;
  return dateStr;
};

/**
 * Formats a decimal UT1 offset in hours into a string.
 * Calls `decimalToHMS` to convert the decimal hours to an HMS object.
 *
 * @param {number} offset_in_hours - Decimal UT1 offset in hours.
 * @returns {string} The formatted UT1 offset string.
 *
 * @see decimalToHMS
 */
const formatTimezone = (offset_in_hours) => {
  const hms = decimalToHMS(offset_in_hours);
  return `${offset_in_hours < 0 ? '-' : '+'}${pad(hms.hours)}:${pad(hms.minutes)}`;
};

export {
  hmsToDecimal,
  decimalToHMS,
  formatHMS,
  formatDecimalHours,
  formatDateTime,
  formatDateTimeISO,
  dateTimeToStr,
  dateToStr,
  formatTimezone,
};
