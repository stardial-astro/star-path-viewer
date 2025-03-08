// src/utils/locationInputUtils.js
import fetchGeolocation from './fetchGeolocation';
import * as actionTypes from '@context/locationInputActionTypes';
import { TYPE_COORD, ADDR_UNKNOWN } from './constants';

const fetchCurrentLocation = async (service, lastSelectedTerm, locationDispatch, setErrorMessage) => {
  try {
    locationDispatch({ type: actionTypes.SET_LOCATION_LOADING_ON });
    const locationData = await fetchGeolocation(service);
    if (locationData.display_name !== ADDR_UNKNOWN) {
      locationDispatch({ type: actionTypes.SET_SEARCH_TERM, payload: locationData.display_name });
      lastSelectedTerm.current = locationData.display_name;
    }
    locationDispatch({ type: actionTypes.SET_LOCATION, payload: {
      lat: locationData.lat,
      lng: locationData.lng,
      id: locationData.id,
    } });
    if (locationData.id === ADDR_UNKNOWN) {
      locationDispatch({ type: actionTypes.SET_INPUT_TYPE, payload: TYPE_COORD });
    }
  } catch (error) {
    setErrorMessage((prev) => ({ ...prev, location: error.message }));
  } finally {
    locationDispatch({ type: actionTypes.SET_LOCATION_LOADING_OFF });
  }
};

/* Validate the location */
const validateLocationSync = (locationInputType, location) => {
  // console.log(location);
  let newLocationError = { address: '', lat: '', lng: '' };

  if (locationInputType === TYPE_COORD) {
    if (!/^-?\d*(\.\d+)?$/.test(location.lat)) {
      return { ...newLocationError, lat: 'The latitude must be a decimal.' };
    }
    if (!/^-?\d*(\.\d+)?$/.test(location.lng)) {
      return { ...newLocationError, lng: 'The longitude must be a decimal.' };
    }

    if (location.lat) {
      const lat = parseFloat(location.lat);
      if (lat < -90 || lat > 90) {
        return { ...newLocationError, lat: 'The latitude must be in the range [-90°, 90°].' };
      }
    }
    if (location.lng) {
      const lng = parseFloat(location.lng);
      if (lng < -180 || lng > 180) {
        return { ...newLocationError, lng: 'The longitude must be in the range [-180°, 180°].' };
      }
    }
  }

  return newLocationError;
};

const clearLocationError = (locationDispatch, setErrorMessage) => {
  setErrorMessage((prev) => ({ ...prev, location: '', draw: '', download: '' }));
  locationDispatch({ type: actionTypes.CLEAR_LOCATION_ERROR });
};

export {
  fetchCurrentLocation,
  validateLocationSync,
  clearLocationError,
};
