// src/utils/dateInputUtils.js
import { EPH_DATE_MIN, EPH_DATE_MAX, EPH_DATE_MIN_JULIAN, EPH_DATE_MAX_JULIAN } from './constants';
import * as actionTypes from '../context/dateInputActionTypes';
import { JULIAN } from './constants';
import { dateToStr } from './dateUtils';
import { fetchEquinoxSolstice } from './fetchEquinoxSolstice';

/* Fetch the date of the equinox/solstice in the given year */
const fetchDate = async (date, flag, locationRef, dateDispatch, setErrorMessage, signal, abortControllerRef, requestId, latestDateRequest) => {
  // console.log('Fetching date...', date.year, locationRef.current, flag);
  // const date = dateRef.current;
  // const flag = flagRef.current;
  const location = locationRef.current;

  if (!flag || !date.year || !location.lat || !location.lng || !location.tz) {
    dateDispatch({ type: actionTypes.SET_DATE_FETCHING_OFF });
    abortControllerRef.current = null;
    return;
  }

  const year = parseInt(date.year);

  if (year <= EPH_DATE_MIN[0] || year >= EPH_DATE_MAX[0]) {
    dateDispatch({ type: actionTypes.SET_DATE_FETCHING_OFF });
    abortControllerRef.current = null;
    return;
  }

  try {
    const { month: newMonth, day: newDay } = await fetchEquinoxSolstice(location.lat, location.lng, location.tz, year, flag, signal);
    if (requestId === latestDateRequest.current) {
      if (!(newMonth > 0 && newDay > 0)) {
        setErrorMessage((prev) => ({ ...prev, date: 'Unable to fetch the date.' }));
        dateDispatch({ type: actionTypes.SET_DATE_FETCHING_OFF });
        abortControllerRef.current = null;
        return;
      }

      const month = newMonth;
      const day = newDay;
      /* Reset month and day if needed */
      const newDate = {
        ...date,
        month: month.toString(),
        day: day.toString(),
      };
      dateDispatch({ type: actionTypes.SET_DATE, payload: newDate });
      dateDispatch({ type: actionTypes.SET_DATE_FETCHING_OFF });
      dateDispatch({ type: actionTypes.SET_DATE_VALID, payload: true });
      abortControllerRef.current = null;
    }
  } catch (error) {
    if (error.name !== 'CanceledError' && requestId === latestDateRequest.current) {
      setErrorMessage((prev) => ({ ...prev, date: error.message }));
      dateDispatch({ type: actionTypes.SET_DATE_FETCHING_OFF });
      abortControllerRef.current = null;
    }
    // else {
    //   console.log(`Request for ${date.year}-${flag} canceled.`);
    // }
  }
};

/* Adjust the date based on the selected calendar and flag */
const adjustDate = (date, cal, dateDispatch) => {
  // console.log('Adjusting...', date);
  // const date = dateRef.current;
  if (!date.year) {
    dateDispatch({ type: actionTypes.SET_DATE_ADJUSTING_OFF });
    return;
  }

  const year = parseInt(date.year);
  let month = parseInt(date.month) || 1;
  let day = parseInt(date.day) || 1;

  const ephDateMin = cal === JULIAN ? EPH_DATE_MIN_JULIAN : EPH_DATE_MIN;
  const ephDateMax = cal === JULIAN ? EPH_DATE_MAX_JULIAN : EPH_DATE_MAX;
  const newDisabledMonths = {};
  let dayMin = 1;
  let dayMax = 31;

  /* Reset the last day of a month */
  if (month === 2) {
    dayMax = (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) ? 29 : 28;
  } else if ([4, 6, 9, 11].includes(month)) {
    dayMax = 30;
  }

  /* Enable all month options */
  Object.keys(newDisabledMonths).forEach((key) => {
    newDisabledMonths[key] = false;
  });

  if (year === ephDateMin[0]) {
    /* Disable the month options before ephDateMin */
    for (let i = ephDateMin[1] - 1; i >= 1; i--) {
      newDisabledMonths[i] = true;
    }

    if (date.month && month <= ephDateMin[1]) {
      month = ephDateMin[1];
      dayMin = ephDateMin[2];
    }
  } else if (year === ephDateMax[0]) {
    /* Disable the month options after ephDateMax */
    for (let i = ephDateMax[1] + 1; i <= 12; i++) {
      newDisabledMonths[i] = true;
    }

    if (date.month && month >= ephDateMax[1]) {
      month = ephDateMax[1];
      dayMax = ephDateMax[2];
    } else if (month === ephDateMax[1]) {
      dayMax = ephDateMax[2];
    }
  }

  if (date.day && day < dayMin) {
    day = dayMin;
  }
  if (date.day && day > dayMax) {
    day = dayMax;
  }

  dateDispatch({ type: actionTypes.SET_DISABLED_MONTHS, payload: newDisabledMonths });
  dateDispatch({ type: actionTypes.SET_LAST_DAY, payload: dayMax });

  /* Reset month and day if needed */
  if (month.toString() !== date.month || day.toString() !== date.day) {
    const newDate = {
      ...date,
      month: date.month ? month.toString() : '',
      day: date.day ? day.toString() : '',
    };
    dateDispatch({ type: actionTypes.SET_DATE, payload: newDate });
  }
  dateDispatch({ type: actionTypes.SET_DATE_ADJUSTING_OFF });
};

/* Validate the date */
const validateDateSync = (date, cal) => {
  // console.log('Validating date...', date);
  let newDateError = { general: '', year: '', month: '', day: '' };
  const ephDateMin = cal === JULIAN ? EPH_DATE_MIN_JULIAN : EPH_DATE_MIN;
  const ephDateMax = cal === JULIAN ? EPH_DATE_MAX_JULIAN : EPH_DATE_MAX;

  for (let key of ['year', 'month', 'day']) {
    if (!/^-?\d*$/.test(date[key])) {
      return { ...newDateError, [key]: `The ${key} must be an integer.` };
    }
  }

  if (date.year) {
    const year = parseInt(date.year);
    const month = parseInt(date.month);
    const day = parseInt(date.day);

    if (
      (year < ephDateMin[0] ||
        (year === ephDateMin[0] &&
          (month < ephDateMin[1] || (month === ephDateMin[1] && day < ephDateMin[2])))) ||
      (year > ephDateMax[0] ||
        (year === ephDateMax[0] &&
          (month > ephDateMax[1] || (month === ephDateMax[1] && day > ephDateMax[2]))))
    ) {
      return {
        ...newDateError,
        general: `Out of the ephemeris date range: ${dateToStr({ date: ephDateMin })}/${dateToStr({ date: ephDateMax })} (${cal === JULIAN ? 'Julian' : 'Gregorian'})`,
      };
    }
  }

  return newDateError;
};

/* Validate the year */
const validateYearSync = (date) => {
  // console.log('Validating year...', date);
  let newDateError = { general: '', year: '', month: '', day: '' };
  const ephDateMin = EPH_DATE_MIN;
  const ephDateMax = EPH_DATE_MAX;

  if (!/^-?\d*$/.test(date.year)) {
    return { ...newDateError, year: 'The year must be an integer.' };
  }

  if (date.year) {
    const year = parseInt(date.year);

    if (year <= ephDateMin[0] || year >= ephDateMax[0]) {
      return {
        ...newDateError,
        general: `Out of the year range: ${ephDateMin[0]+1}/+${ephDateMax[0]-1}`,
      };
    }
  }

  return newDateError;
};

/* Clear any date-related errors */
const clearDateError = (dateDispatch, setErrorMessage) => {
  setErrorMessage((prev) => ({ ...prev, date: '', draw: '', download: '' }));
  dateDispatch({ type: actionTypes.CLEAR_DATE_ERROR });
};

export {
  fetchDate,
  adjustDate,
  validateDateSync,
  validateYearSync,
  clearDateError,
};
