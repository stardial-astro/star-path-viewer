// src/utils/dateUtils.js
import { pad } from './inputUtils';
import { CC_HANT_CODES } from './constants';

/**
 * AD -> CE, BC -> BCE
 * @param {string} era
 */
const mapEra = (era) => {
  if (era === 'AD') return 'CE';
  if (era === 'BC') return 'BCE';
  return era;
};

// /**
//  * Converts from UNIX timestamp (since January 1, 1970 at 00:00:00 UTC) to
//  * Julian Day (since from January 1, 4713 BCE at 12:00:00 UTC).
//  * @param {Date} date
//  */
// const getJulianDay = (date) => {
//   const jd = date.getTime() / 86400000 + 2440587.5;
//   return isNaN(jd) ? null : jd;
// };

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
 * - Force in UTC throughout because only the formatting without the time zone is needed
 * @param {object} params
 * @param {DatetimeObj} params.datetime - Defaults: `month=1, day=1, hour=12, minute=0, second=0`.
 * @param {boolean} [params.abbr=false] - Whether to use abbreviation instead of full name for month. Defaults to `false`.
 * @param {LangCode | string} [params.langCode='en'] - The i18n language code. Defaults to `'en'`.
 * @returns {DatetimeStrObj} An object containing formatted strings: `{date, time, year}`
 */
const formatDatetime = ({
  datetime: { year, month = 1, day = 1, hour = 12, minute = 0, second = 0 },
  abbr = false,
  langCode = 'en',
}) => {
  const yearStr = year > 0 ? `${year} CE` : `${-year + 1} BCE`;
  // const monthStr = MONTHS[month][abbr ? 'abbr' : 'name'];
  // const dateStr = monthFirst
  //   ? `${monthStr} ${day}, ${yearStr}`
  //   : `${day} ${monthStr} ${yearStr}`;
  /* Map all traditional Chinese language codes to 'zh-Hant' */
  const locale = CC_HANT_CODES.includes(langCode) ? 'zh-Hant' : langCode;
  /* Construct a Date object */
  const date = new Date(
    Date.UTC(
      year,
      month - 1,
      day,
      hour,
      minute,
      Math.floor(second),
      Math.floor((second % 1) * 1000),
    ),
  );
  /* Ensure the full year */
  date.setUTCFullYear(year, month - 1, day);
  const dateFormat = new Intl.DateTimeFormat(locale, {
    timeZone: 'UTC',
    year: 'numeric',
    month: abbr ? 'short' : 'long',
    day: 'numeric',
    era: 'short',
  });
  /* AD -> CE, BC -> BCE */
  const parts = dateFormat
    .formatToParts(date)
    .map((p) => (p.type === 'era' ? { ...p, value: mapEra(p.value) } : p));
  const dateStr = parts.map((p) => p.value).join('');
  // const secondStr = Number.isInteger(second) ? pad(second) : pad(second, 3);
  /* No carryover, keep second = 60 */
  const timeStr = `${pad(hour)}:${pad(minute)}:${pad(second)}`;
  return { date: dateStr, time: timeStr, year: yearStr };
};

/**
 * Formats the datetime into ISO 8601 format strings `'±YYYY-MM-DD'` and `'hh:mm:ss'`.
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
      ? '+' + year.toFixed().padStart(4, '0')
      : '-' + (-year).toFixed().padStart(4, '0');
  const dateStr = [yearStr, pad(month), pad(day)].join('-');
  // const secondStr = Number.isInteger(second) ? pad(second) : pad(second, 3);
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
 * @param {boolean} [params.abbr=false] - Whether to use abbreviation or full name for month. Defaults to `false`.
 * @param {LangCode | string} [params.langCode='en'] - The i18n language code. Defaults to `'en'`.
 * @returns {string} The formatted date and time string.
 * @see {@link formatDatetimeIso}
 * @see {@link formatDatetime}
 */
const datetimeToStr = ({
  datetimeArr,
  iso = true,
  delim = ' ',
  abbr = false,
  langCode = 'en',
}) => {
  if (!Array.isArray(datetimeArr) || datetimeArr.length < 6) return '';

  /* Keep only the int part except for the seconds */
  const [year, month, day, hour, minute, second] = datetimeArr.map(
    (value, index) => (index === 5 ? value : Math.trunc(value)),
  );

  const datetimeObj = iso
    ? formatDatetimeIso({ year, month, day, hour, minute, second })
    : formatDatetime({
        datetime: { year, month, day, hour, minute, second },
        abbr,
        langCode,
      });
  const datetimeStr = iso
    ? `${datetimeObj.date}${delim}${datetimeObj.time}`
    : `${datetimeObj.date}, ${datetimeObj.time}`;
  return datetimeStr;
};

/**
 * Formats a date array into a string.
 * - Calls `formatDatetimeIso` or `formatDatetime` to format the date
 * - Truncates input numbers to integers
 * @param {object} params - An object containing a date array and some switches.
 * @param {number[]} params.dateArr - An array `[year, month, day]`.
 * @param {boolean} [params.iso=true] - Whether to use ISO format. Defaults to `true`.
 * @param {boolean} [params.abbr=false] - Whether to use abbreviation instead of full name for month. Defaults to `false`.
 * @param {LangCode | string} [params.langCode='en'] - The i18n language code. Defaults to `'en'`.
 * @returns {string} The formatted date string.
 * @see {@link formatDatetimeIso}
 * @see {@link formatDatetime}
 */
const dateToStr = ({ dateArr, iso = true, abbr = false, langCode = 'en' }) => {
  if (!Array.isArray(dateArr) || dateArr.length < 3) return '';

  /* Keep only the int part */
  const [year, month, day] = dateArr.map((value) => Math.trunc(value));

  const dateStr = iso
    ? formatDatetimeIso({ year, month, day }).date
    : formatDatetime({ datetime: { year, month, day }, abbr, langCode }).date;
  return dateStr;
};

/**
 * Formats a Standard Time offset in decimal hours into an ISO 8601 format string '±hh:mm'.
 * - Calls `decimalToHms` to convert the decimal hours to an HMS object
 * @param {number} offset_in_hours - The Standard Time offset in decimal hours.
 * @param {boolean} [suffixZ=false] - Whether to replace `'+00:00'` with `'Z'`. Defaults to `false`.
 * @returns {string} The formatted Standard Time offset string.
 * @see {@link decimalToHms}
 */
const formatTimezone = (offset_in_hours, suffixZ = false) => {
  if (offset_in_hours === 0) return suffixZ ? 'Z' : '+00:00';
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
