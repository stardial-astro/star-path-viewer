// src/utils/dateInputUtils.js
import * as actionTypes from '@context/dateInputActionTypes';
import {
  EPH_RANGE,
  EPH_RANGE_JULIAN,
  EPH_RANGE_ERR_PREFIX,
  CALS,
} from './constants';
import { dateToStr } from './dateUtils';

/**
 * Clamps the value to min/max.
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number} The updated value.
 */
const clamp = (value, min, max) => {
  if (min > max) return value;
  if (value < min) {
    value = min;
  } else if (value > max) {
    value = max;
  }
  return value;
};

/**
 * Derives month and day ranges from the date and the selected calendar.
 * - Returns updated `monthMin`, `monthMax`, `dayMin`, and `dayMax`
 * @param {DateObj} date
 * @param {Cal} cal
 * @returns {DateParams}
 */
const deriveRangeFromDate = (date, cal) => {
  let monthMin = 1;
  let monthMax = 12;
  let dayMin = 1;
  let dayMax = 31;

  const yearInt = parseInt(date.year);
  const monthInt = parseInt(date.month) || 0;

  const { min: ephDateMin, max: ephDateMax } =
    cal === CALS.julian ? EPH_RANGE_JULIAN : EPH_RANGE;

  /* Reset the last day of a month */
  if (monthInt === 2) {
    dayMax =
      date.year &&
      yearInt % 4 === 0 &&
      (yearInt % 100 !== 0 || yearInt % 400 === 0)
        ? 29
        : 28;
  } else if ([4, 6, 9, 11].includes(monthInt)) {
    dayMax = 30;
  }
  // getIsDevMode() && console.debug('Current day range:', dayMin, dayMax);
  if (!date.year) return { monthMin, monthMax, dayMin, dayMax };

  /* If year is given, reset according to the ephemeris date range and calendar */
  if (yearInt === ephDateMin[0]) {
    /* Reset monthMin */
    monthMin = ephDateMin[1];
    // getIsDevMode() && console.debug('Updated month range:', monthMin, monthMax);
    /* If month is given, reset dayMin */
    if (monthInt > 0 && monthInt <= ephDateMin[1]) {
      dayMin = ephDateMin[2];
      // getIsDevMode() && console.debug('Updated day range:', dayMin, dayMax);
    }
  } else if (yearInt === ephDateMax[0]) {
    /* Reset monthMax */
    monthMax = ephDateMax[1];
    // getIsDevMode() && console.debug('Updated month range:', monthMin, monthMax);
    /* If month is given, reset dayMax */
    if (monthInt >= ephDateMax[1]) {
      dayMax = ephDateMax[2];
      // getIsDevMode() && console.debug('Updated day range:', dayMin, dayMax);
    }
  }

  return { monthMin, monthMax, dayMin, dayMax };
};

/**
 * Corrects the date based on `monthMin`, `monthMax`, `dayMin`, and `dayMax`.
 * - Updates `month` and `day`
 * @param {DateObj} date
 * @param {Cal} cal
 * @returns {{correctedDate: DateObj, dateParams: DateParams, hasCorrection: boolean}}
 */
const clampDateSync = (date, cal) => {
  // console.log('Clamping date...', date, cal);
  const { monthMin, monthMax, dayMin, dayMax } = deriveRangeFromDate(date, cal);
  const correctedDate = {
    ...date,
    month: date.month
      ? clamp(parseInt(date.month), monthMin, monthMax).toString()
      : '',
    day: date.day ? clamp(parseInt(date.day), dayMin, dayMax).toString() : '',
  };
  return {
    correctedDate,
    dateParams: { monthMin, monthMax, dayMin, dayMax },
    hasCorrection:
      correctedDate.day !== date.day || correctedDate.month !== date.month,
  };
};

/**
 * Validates the date. Date should be within the ephemeris range.
 * @param {DateObj} date
 * @param {Cal} cal
 * @returns {{ isValid: boolean, invalidError: DateErrorObj }}
 */
const validateDateSync = (date, cal) => {
  // console.log('Validating date...', date, cal);
  let isValid = true;
  /** @type {DateErrorObj} */
  const invalidError = { general: '', year: '', month: '', day: '' };

  /* If year is provided and valid, check the range */
  if (date.year) {
    const yearInt = parseInt(date.year);
    const monthInt = parseInt(date.month) || 0;
    const dayInt = parseInt(date.day) || 0;
    const { min: ephDateMin, max: ephDateMax } =
      cal === CALS.julian ? EPH_RANGE_JULIAN : EPH_RANGE;
    if (
      yearInt < ephDateMin[0] ||
      (yearInt === ephDateMin[0] &&
        ((monthInt > 0 && monthInt < ephDateMin[1]) ||
          (monthInt === ephDateMin[1] &&
            dayInt > 0 &&
            dayInt < ephDateMin[2]))) ||
      yearInt > ephDateMax[0] ||
      (yearInt === ephDateMax[0] &&
        (monthInt > ephDateMax[1] ||
          (monthInt === ephDateMax[1] && dayInt > ephDateMax[2])))
    ) {
      isValid = false;
      invalidError.general =
        EPH_RANGE_ERR_PREFIX +
        `${dateToStr({ dateArr: ephDateMin })}/${dateToStr({ dateArr: ephDateMax })} ` +
        `(${cal === CALS.julian ? 'Julian' : 'Gregorian'})`;
    }
  }
  return { isValid, invalidError };
};

/**
 * Validates the year. Year should be within the ephemeris range.
 * @param {string} year
 * @returns {string} The error message
 */
const validateYearSync = (year) => {
  // console.log('Validating year...', year);
  /* If year is provided and valid, check the range */
  const yearInt = parseInt(year);
  if (yearInt <= EPH_RANGE.min[0] || yearInt >= EPH_RANGE.max[0]) {
    return (
      EPH_RANGE_ERR_PREFIX +
      `${dateToStr({ dateArr: EPH_RANGE.min })}/${dateToStr({ dateArr: EPH_RANGE.max })} ` +
      '(Gregorian)'
    );
  }
  return '';
};

/**
 * Clears date-related/draw/download errors except null errors.
 * @param {ReactDispatch} dispatch
 * @param {ReactSetState<ErrorObj>} setErrorMessage
 */
const clearDateError = (dispatch, setErrorMessage) => {
  setErrorMessage((prev) => ({ ...prev, date: '', draw: '', download: '' }));
  dispatch({ type: actionTypes.CLEAR_DATE_ERROR });
};

export { clampDateSync, validateDateSync, validateYearSync, clearDateError };
