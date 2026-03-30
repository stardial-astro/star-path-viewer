// src/utils/dateUtils.js
import { MONTHS } from './constants';
import { pad } from './inputUtils';

/**
 * Converts signed HMS (Hours, Minutes, Seconds) to decimal hours.
 * @param {SignedHmsObj} hms - The signed HMS object.
 * @returns {number} The decimal hours of the given HMS values.
 */
const hmsToDecimal = ({ sign, hours, minutes, seconds }) => {
  const absDecimalHours = Math.abs(hours) + minutes / 60 + seconds / 3600;
  if (absDecimalHours === 0) sign = 1;
  return sign * absDecimalHours;
};

/**
 * Converts decimal hours to signed HMS (Hours, Minutes, Seconds).
 * @param {number} decimalHours - Decimal hours.
 * @param {number} [fractionDigits=0] - Defaults to 0.
 * @returns {SignedHmsObj} An object containing `sign`, absolute `hours`, `minutes`, and decimal `seconds`.
 */
const decimalToHms = (decimalHours, fractionDigits = 0) => {
  const sign = decimalHours < 0 ? -1 : 1;
  const absDecimalHours = Math.abs(decimalHours);
  let absHours = Math.floor(absDecimalHours);
  const decimalMinutes = (absDecimalHours - absHours) * 60;
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
    absHours += 1;
  }
  return { sign, hours: absHours, minutes, seconds };
};

/**
 * Formats signed HMS (Hours, Minutes, Seconds) into a string.
 * @param {SignedHmsObj} hms - The signed HMS object.
 * @param {number} [fractionDigits=0] - Defaults to 0.
 * @returns {string} The formatted HMS string.
 */
const formatHms = ({ sign, hours, minutes, seconds }, fractionDigits = 0) => {
  if (hours === 0 && minutes === 0 && seconds === 0) sign = 1;
  const secondsStr = Number.isInteger(seconds)
    ? pad(seconds)
    : pad(seconds, fractionDigits);
  return `${sign < 0 ? '-' : '+'}${hours}h${pad(minutes)}m${secondsStr}s`;
};

/**
 * Formats decimal hours into an HMS string.
 * - Calls `decimalToHms` to convert the decimal hours to an HMS object
 * - Calls `formatHms` to format the HMS object
 * @param {number} decimalHours - Decimal hours.
 * @param {number} [fractionDigits=0] - Defaults to 0.
 * @returns {string} The formatted HMS string.
 * @see {@link decimalToHms}
 * @see {@link formatHms}
 */
const formatDecimalHours = (decimalHours, fractionDigits = 0) => {
  const hms = decimalToHms(decimalHours, fractionDigits);
  return formatHms(hms, fractionDigits);
};

/**
 * Formats the datetime into strings in the format `'January 1, 2000 CE'` and `'12:00:00'`.
 * - No carryover, keep `second = 60`
 * @param {object} params
 * @param {DatetimeObj} params.datetime - Defaults: `month=1, day=1, hour=12, minute=0, second=0`.
 * @param {boolean} [params.monthFirst=true] - Whether to use month-day-year instead of day-month-year format. Defaults to `true`.
 * @param {boolean} [params.abbr=false] - Whether to use abbreviation instead of full name for month. Defaults to `false`.
 * @returns {DatetimeStrObj} An object containing formatted strings: `{date, time, year}`
 */
const formatDatetime = ({
  datetime: { year, month = 1, day = 1, hour = 12, minute = 0, second = 0 },
  monthFirst = true,
  abbr = false,
}) => {
  const yearStr = year > 0 ? `${year} CE` : `${-year + 1} BCE`;
  const monthStr = MONTHS[month][abbr ? 'abbr' : 'name'];
  const dateStr = monthFirst
    ? `${monthStr} ${day}, ${yearStr}`
    : `${day} ${monthStr} ${yearStr}`;
  // const secondStr = Number.isInteger(second) ? pad(second) : pad(second, 3);
  /* No carryover, keep second = 60 */
  const timeStr = `${pad(hour)}:${pad(minute)}:${pad(second)}`;
  return { date: dateStr, time: timeStr, year: yearStr };
};

/**
 * Formats the datetime into ISO 8601 format strings '+2000-01-01' and '12:00:00'.
 * - No carryover, keep `second = 60`
 * @param {DatetimeObj} datetime - Defaults: `month=1, day=1, hour=12, minute=0, second=0`.
 * @returns {DatetimeStrObj} An object containing two formatted strings: `{date, time}`
 */
const formatDatetimeIso = ({
  year,
  month = 1,
  day = 1,
  hour = 12,
  minute = 0,
  second = 0,
}) => {
  const yearStr =
    year >= 0
      ? '+' + year.toString().padStart(4, '0')
      : '-' + (-year).toString().padStart(4, '0');
  const dateStr = [yearStr, pad(month), pad(day)].join('-');
  // const secondStr = Number.isInteger(second) ? pad(second) : second.toFixed(3).padStart(6, '0');
  /* No carryover, keep second = 60 */
  const timeStr = `${pad(hour)}:${pad(minute)}:${pad(second)}`;
  return { date: dateStr, time: timeStr };
};

/**
 * Formats a datetime array into a string.
 * - Calls `formatDatetimeIso` or `formatDatetime` to format the date and time. Then joins them
 * - Truncates input numbers to integers except for `second`
 * @param {object} params - An object containing a datetime array and some switches.
 * @param {number[]} params.datetimeArr - An array `[year, month, day, hour, minute, second]`.
 * @param {boolean} [params.iso=true] - Whether to use ISO format or not. Defaults to `true`.
 * @param {string} [params.delim=' '] - The delimiter between date and time in ISO format. Defaults to `' '`.
 * @param {boolean} [params.monthFirst=true] - Whether to use month-day-year instead of day-month-year format. Defaults to `true`.
 * @param {boolean} [params.abbr=false] - Whether to use abbreviation or full name for month. Defaults to `false`.
 * @returns {string} The formatted date and time string.
 * @see {@link formatDatetimeIso}
 * @see {@link formatDatetime}
 */
const datetimeToStr = ({
  datetimeArr,
  iso = true,
  delim = ' ',
  monthFirst = true,
  abbr = false,
}) => {
  if (!Array.isArray(datetimeArr) || datetimeArr.length < 6) return '';

  /* Keep only the int part except for the seconds */
  const [year, month, day, hour, minute, second] = datetimeArr.map(
    (value, index) => (index === 5 ? value : Math.trunc(value)),
  );

  const datetimeStrList = iso
    ? formatDatetimeIso({ year, month, day, hour, minute, second })
    : formatDatetime({
        datetime: { year, month, day, hour, minute, second },
        monthFirst,
        abbr,
      });
  const datetimeStr = iso
    ? `${datetimeStrList.date}${delim}${datetimeStrList.time}`
    : `${datetimeStrList.date}, ${datetimeStrList.time}`;
  return datetimeStr;
};

/**
 * Formats a date array into a string.
 * - Calls `formatDatetimeIso` or `formatDatetime` to format the date
 * - Truncates input numbers to integers
 * @param {object} params - An object containing a date array and some switches.
 * @param {number[]} params.dateArr - An array `[year, month, day]`.
 * @param {boolean} [params.iso=true] - Whether to use ISO format. Defaults to `true`.
 * @param {boolean} [params.monthFirst=true] - Whether to use month-day-year instead of day-month-year format. Defaults to `true`.
 * @param {boolean} [params.abbr=false] - Whether to use abbreviation instead of full name for month. Defaults to `false`.
 * @returns {string} The formatted date string.
 * @see {@link formatDatetimeIso}
 * @see {@link formatDatetime}
 */
const dateToStr = ({
  dateArr,
  iso = true,
  monthFirst = true,
  abbr = false,
}) => {
  if (!Array.isArray(dateArr) || dateArr.length < 3) return '';

  /* Keep only the int part */
  const [year, month, day] = dateArr.map((value) => Math.trunc(value));

  const dateStr = iso
    ? formatDatetimeIso({ year, month, day }).date
    : formatDatetime({ datetime: { year, month, day }, monthFirst, abbr }).date;
  return dateStr;
};

/**
 * Formats a decimal UT1 offset in hours into a string.
 * - Calls `decimalToHms` to convert the decimal hours to an HMS object
 * @param {number} offset_in_hours - Decimal UT1 offset in hours.
 * @returns {string} The formatted UT1 offset string.
 * @see {@link decimalToHms}
 */
const formatTimezone = (offset_in_hours) => {
  const hms = decimalToHms(offset_in_hours);
  return `${offset_in_hours < 0 ? '-' : '+'}${pad(hms.hours)}:${pad(hms.minutes)}`;
};

export {
  hmsToDecimal,
  decimalToHms,
  formatHms,
  formatDecimalHours,
  formatDatetime,
  formatDatetimeIso,
  datetimeToStr,
  dateToStr,
  formatTimezone,
};
