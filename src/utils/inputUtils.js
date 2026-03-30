// src/utils/inputUtils.js
import * as locationActionTypes from '@context/locationInputActionTypes';
import * as dateActionTypes from '@context/dateInputActionTypes';
import * as starActionTypes from '@context/starInputActionTypes';
import { LOC_INPUT_TYPES, STAR_INPUT_TYPES } from './constants';

/**
 * Converts to string and pads with 0.
 * @param {number} num
 * @param {number} [fractionDigits=0] - Defaults to 0.
 */
const pad = (num, fractionDigits = 0) =>
  num
    .toFixed(fractionDigits > 0 ? fractionDigits : 0)
    .padStart(2 + (fractionDigits > 0 ? 1 + fractionDigits : 0), '0');

/**
 * Checks whether the location input fields are complete.
 * Sets null errors and set to invalid if incomplete.
 * @param {LocationObj} location - The location object.
 * @param {LocInputType} locationInputType
 * @param {ReactDispatch} dispatch
 * @returns {boolean} `true` if complete, otherwise `false`.
 */
const isLocationInputCompleteSync = (location, locationInputType, dispatch) => {
  let isComplete = true;

  if (locationInputType === LOC_INPUT_TYPES.addr) {
    if (!location.id) {
      dispatch({ type: locationActionTypes.SET_ADDRESS_NULL_ERROR });
      isComplete = false;
    }
  } else {
    if (!location.lat) {
      dispatch({ type: locationActionTypes.SET_LAT_NULL_ERROR });
      isComplete = false;
    }
    if (!location.lng) {
      dispatch({ type: locationActionTypes.SET_LNG_NULL_ERROR });
      isComplete = false;
    }
  }

  if (!isComplete) {
    dispatch({ type: locationActionTypes.SET_LOCATION_VALID, payload: false });
  }
  return isComplete;
};

/**
 * Checks whether the date input fields are complete.
 * Sets null errors and set to invalid if incomplete.
 * @param {DateObj} date - The date object.
 * @param {Flag} flag
 * @param {ReactDispatch} dispatch
 * @returns {boolean} `true` if complete, otherwise `false`.
 */
const isDateInputCompleteSync = (date, flag, dispatch) => {
  let isComplete = true;

  if (flag) {
    if (!date.year) {
      dispatch({ type: dateActionTypes.SET_YEAR_NULL_ERROR });
      isComplete = false;
    }
  } else {
    if (!date.year) {
      dispatch({ type: dateActionTypes.SET_YEAR_NULL_ERROR });
      isComplete = false;
    }
    if (!date.month) {
      dispatch({ type: dateActionTypes.SET_MONTH_NULL_ERROR });
      isComplete = false;
    }
    if (!date.day) {
      dispatch({ type: dateActionTypes.SET_DAY_NULL_ERROR });
      isComplete = false;
    }
  }

  if (!isComplete) {
    dispatch({ type: dateActionTypes.SET_DATE_VALID, payload: false });
  }
  return isComplete;
};

/**
 * Checks whether the star input fields are complete.
 * Sets null errors and set to invalid if incomplete.
 * @param {string} starName - The star name.
 * @param {string} starHip - The star's HIP number.
 * @param {RadecObj} starRadec - The RA/Dec object.
 * @param {StarInputType} starInputType
 * @param {ReactDispatch} dispatch
 * @returns {boolean} `true` if complete, otherwise `false`.
 */
const isStarInputCompleteSync = (
  starName,
  starHip,
  starRadec,
  starInputType,
  dispatch,
) => {
  let isComplete = true;

  if (starInputType === STAR_INPUT_TYPES.name && !starName) {
    dispatch({ type: starActionTypes.SET_STAR_NAME_NULL_ERROR });
    isComplete = false;
  } else if (starInputType === STAR_INPUT_TYPES.hip && !starHip) {
    dispatch({ type: starActionTypes.SET_STAR_HIP_NULL_ERROR });
    isComplete = false;
  } else if (starInputType === STAR_INPUT_TYPES.radec) {
    if (!starRadec.ra) {
      dispatch({ type: starActionTypes.SET_STAR_RA_NULL_ERROR });
      isComplete = false;
    }
    if (!starRadec.dec) {
      dispatch({ type: starActionTypes.SET_STAR_DEC_NULL_ERROR });
      isComplete = false;
    }
  }

  if (!isComplete) {
    dispatch({ type: starActionTypes.SET_STAR_VALID, payload: false });
  }
  return isComplete;
};

/**
 * Checks whether all input fields are complete.
 * Sets null errors and set to invalid if incomplete.
 * @param {LocationObj} location - The location object.
 * @param {LocInputType} locationInputType
 * @param {DateObj} date - The date object.
 * @param {Flag} flag
 * @param {string} starName - The star name.
 * @param {string} starHip - The star's HIP number.
 * @param {RadecObj} starRadec - The RA/Dec object.
 * @param {StarInputType} starInputType
 * @param {ReactDispatch} locationDispatch
 * @param {ReactDispatch} dateDispatch
 * @param {ReactDispatch} starDispatch
 * @returns {boolean} `true` if complete, otherwise `false`.
 */
const isInputCompleteSync = (
  location,
  locationInputType,
  date,
  flag,
  starName,
  starHip,
  starRadec,
  starInputType,
  locationDispatch,
  dateDispatch,
  starDispatch,
) => {
  const isLocationValid = isLocationInputCompleteSync(
    location,
    locationInputType,
    locationDispatch,
  );
  const isDateValid = isDateInputCompleteSync(date, flag, dateDispatch);
  const isStarValid = isStarInputCompleteSync(
    starName,
    starHip,
    starRadec,
    starInputType,
    starDispatch,
  );
  return isLocationValid && isDateValid && isStarValid;
};

/**
 * Clears null errors.
 * @param {ReactDispatch} locationDispatch
 * @param {ReactDispatch} dateDispatch
 * @param {ReactDispatch} starDispatch
 */
const clearNullError = (locationDispatch, dateDispatch, starDispatch) => {
  locationDispatch({ type: locationActionTypes.CLEAR_LOCATION_NULL_ERROR });
  dateDispatch({ type: dateActionTypes.CLEAR_DATE_NULL_ERROR });
  starDispatch({ type: starActionTypes.CLEAR_STAR_NULL_ERROR });
};

export {
  pad,
  isLocationInputCompleteSync,
  isDateInputCompleteSync,
  isStarInputCompleteSync,
  isInputCompleteSync,
  clearNullError,
};
