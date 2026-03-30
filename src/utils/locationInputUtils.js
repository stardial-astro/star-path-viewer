// src/utils/locationInputUtils.js
import * as actionTypes from '@context/locationInputActionTypes';

/**
 * Validates the coordinates.
 * @param {string} lat - Latitude (-90 <= `lat` <=90).
 * @param {string} lng - Longitude (-180 <= `lng` <=180).
 * @returns {{ isValid: boolean, invalidError: LocationErrorObj }}
 */
const validateLocationSync = (lat, lng) => {
  // console.log('Validating location...', lat, lng);
  let isValid = true;
  /** @type {LocationErrorObj} */
  const invalidError = { address: '', lat: '', lng: '' };
  if (lat) {
    const latFloat = parseFloat(lat);
    if (latFloat < -90 || latFloat > 90) {
      isValid = false;
      invalidError.lat = 'The latitude must be in the range [-90°, 90°].';
    }
  }
  if (lng) {
    const lngFloat = parseFloat(lng);
    if (lngFloat < -180 || lngFloat > 180) {
      isValid = false;
      invalidError.lng = 'The longitude must be in the range [-180°, 180°].';
    }
  }
  return { isValid, invalidError };
};

/**
 * Clears lat/location/draw/download errors except null errors.
 * @param {ReactDispatch} dispatch
 * @param {ReactSetState<ErrorObj>} setErrorMessage
 */
const clearLatError = (dispatch, setErrorMessage) => {
  setErrorMessage((prev) => ({
    ...prev,
    location: '',
    draw: '',
    download: '',
  }));
  dispatch({ type: actionTypes.SET_LAT_ERROR, payload: '' });
};

/**
 * Clears lng/location/draw/download errors except null errors.
 * @param {ReactDispatch} dispatch
 * @param {ReactSetState<ErrorObj>} setErrorMessage
 */
const clearLngError = (dispatch, setErrorMessage) => {
  setErrorMessage((prev) => ({
    ...prev,
    location: '',
    draw: '',
    download: '',
  }));
  dispatch({ type: actionTypes.SET_LNG_ERROR, payload: '' });
};

/**
 * Clears location-related/draw/download errors except null errors.
 * @param {ReactDispatch} dispatch
 * @param {ReactSetState<ErrorObj>} setErrorMessage
 */
const clearLocationError = (dispatch, setErrorMessage) => {
  setErrorMessage((prev) => ({
    ...prev,
    location: '',
    draw: '',
    download: '',
  }));
  dispatch({ type: actionTypes.CLEAR_LOCATION_ERROR });
};

export {
  validateLocationSync,
  clearLatError,
  clearLngError,
  clearLocationError,
};
