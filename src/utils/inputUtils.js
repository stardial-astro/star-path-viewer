// src/utils/inputUtils.js
import * as locationActionTypes from '@context/locationInputActionTypes';
import * as dateActionTypes from '@context/dateInputActionTypes';
import * as starActionTypes from '@context/starInputActionTypes';
import { TYPE_ADDR, TYPE_NAME, TYPE_HIP, TYPE_RADEC } from './constants';

/* Validate the location */
const validateLocationInputSync = (location, locationInputType, locationDispatch) => {
  if (locationInputType === TYPE_ADDR) {
    if (!location.id) {
      locationDispatch({ type: locationActionTypes.SET_ADDRESS_NULL_ERROR });
      locationDispatch({ type: locationActionTypes.SET_LOCATION_VALID, payload: false });
      return false;
    }
  } else if (!location.lat || !location.lng) {
    if (!location.lat) {
      locationDispatch({ type: locationActionTypes.SET_LAT_NULL_ERROR });
    }
    if (!location.lng) {
      locationDispatch({ type: locationActionTypes.SET_LNG_NULL_ERROR });
    }
    locationDispatch({ type: locationActionTypes.SET_LOCATION_VALID, payload: false });
    return false;
  }
  return true;
};

/* Validate the date */
const validateDateInputSync = (date, flag, dateDispatch) => {
  if (flag) {
    if (!date.year) {
      dateDispatch({ type: dateActionTypes.SET_YEAR_NULL_ERROR });
      dateDispatch({ type: dateActionTypes.SET_DATE_VALID, payload: false });
      return false;
    }
  } else if (!date.year || !date.month || !date.day) {
    if (!date.year) {
      dateDispatch({ type: dateActionTypes.SET_YEAR_NULL_ERROR });
    }
    if (!date.month) {
      dateDispatch({ type: dateActionTypes.SET_MONTH_NULL_ERROR });
    }
    if (!date.day) {
      dateDispatch({ type: dateActionTypes.SET_DAY_NULL_ERROR });
    }
    dateDispatch({ type: dateActionTypes.SET_DATE_VALID, payload: false });
    return false;
  }
  return true;
};

/* Validate the star */
const validateStarInputSync = (starName, starHip, starRadec, starInputType, starDispatch) => {
  if (starInputType === TYPE_NAME && !starName) {
    starDispatch({ type: starActionTypes.SET_STAR_NAME_NULL_ERROR });
    starDispatch({ type: starActionTypes.SET_STAR_VALID, payload: false });
    return false;
  } else if (starInputType === TYPE_HIP && !starHip) {
    starDispatch({ type: starActionTypes.SET_STAR_HIP_NULL_ERROR });
    starDispatch({ type: starActionTypes.SET_STAR_VALID, payload: false });
    return false;
  } else if (starInputType === TYPE_RADEC && (!starRadec.ra || !starRadec.dec)) {
    if (!starRadec.ra) {
      starDispatch({ type: starActionTypes.SET_STAR_RA_NULL_ERROR });
    }
    if (!starRadec.dec) {
      starDispatch({ type: starActionTypes.SET_STAR_DEC_NULL_ERROR });
    }
    starDispatch({ type: starActionTypes.SET_STAR_VALID, payload: false });
    return false;
  }
  return true;
};

/* Validate the input */
const validateInputSync = (
  location, locationInputType,
  date, flag,
  starName, starHip, starRadec, starInputType,
  locationDispatch,
  dateDispatch,
  starDispatch
) => {
  const isLocationValid = validateLocationInputSync(location, locationInputType, locationDispatch);
  const isDateValid = validateDateInputSync(date, flag, dateDispatch);
  const isStarValid = validateStarInputSync(starName, starHip, starRadec, starInputType, starDispatch);
  return isLocationValid && isDateValid && isStarValid;
};

/* Clear any null errors */
const clearNullError = (locationDispatch, dateDispatch, starDispatch) => {
  locationDispatch({ type: locationActionTypes.CLEAR_LOCATION_NULL_ERROR });
  dateDispatch({ type: dateActionTypes.CLEAR_DATE_NULL_ERROR });
  starDispatch({ type: starActionTypes.CLEAR_STAR_NULL_ERROR });
};

export {
  validateLocationInputSync,
  validateDateInputSync,
  validateStarInputSync,
  validateInputSync,
  clearNullError,
};
