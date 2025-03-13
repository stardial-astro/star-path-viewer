// src/components/Input/Location/LocationInput.jsx
import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Stack, Snackbar, Alert } from '@mui/material';
import Config from '@/Config';
import { useLocationInput } from '@context/LocationInputContext';
import * as actionTypes from '@context/locationInputActionTypes';
import { TYPE_ADDR, TYPE_COORD, ADDR_UNKNOWN } from '@utils/constants';
import { validateLocationSync, clearLocationError } from '@utils/locationInputUtils';
import determineService from '@utils/determineService';
import LocationInputTypeToggle from './LocationInputTypeToggle';
import AddressInput from './AddressInput';
import CoordinatesInput from './CoordinatesInput';
import TimezoneFetcher from './TimezoneFetcher';
// import debounce from 'lodash/debounce';
import debounce from 'lodash-es/debounce';

const alertStyle = { width: '100%', textAlign: 'left' };

const LocationInput = ({ setErrorMessage }) => {
  // console.log('Rendering LocationInput');
  const {
    location,  // id: ''(not-found), 'unknown'
    locationInputType,  // 'address', 'coordinates'
    searchTerm,
    serviceChosen, setServiceChosen,
    latestTzRequest,
    locationDispatch,
  } = useLocationInput();

  const servicePromiseRef = useRef(null);

  /* Initialize */
  useEffect(() => {
    /* Choose geocoding service */
    const setService = async () => {
      if (serviceChosen === null) {
        /* If there's already a pending or resolved promise, use it */
        if (!servicePromiseRef.current) {
          /* Start the service determination and store the promise in the ref */
          servicePromiseRef.current = determineService().then(service => {
            setServiceChosen(service);
            return service;  // Store the resolved value in the ref
          }).catch(() => {
            servicePromiseRef.current = null;
          });
        }
        /* Await the existing or newly created promise */
        await servicePromiseRef.current;
      }
    };
    clearLocationError(locationDispatch, setErrorMessage);
    // fetchCurrentLocation(serviceChosen, locationDispatch, lastSelectedTerm, setErrorMessage);
    setService();
  }, [serviceChosen, setServiceChosen, locationDispatch, setErrorMessage]);

  /* Reset error when user starts typing */
  useEffect(() => {
    clearLocationError(locationDispatch, setErrorMessage);
    locationDispatch({ type: actionTypes.CLEAR_LOCATION_NULL_ERROR });
    /* Clear address and tz if lat or lng is empty */
    if (searchTerm.trim() && locationInputType === TYPE_COORD && (!location.lat || !location.lng)) {
      locationDispatch({ type: actionTypes.CLEAR_SEARCH_TERM });
      locationDispatch({ type: actionTypes.CLEAR_SUGGESTIONS });
      locationDispatch({ type: actionTypes.SET_ID, payload: '' });
      locationDispatch({ type: actionTypes.SET_TZ, payload: '' });
    }
  }, [searchTerm, location, locationInputType, locationDispatch, setErrorMessage]);

  /* Clear tz if lat or lng is empty */
  useEffect(() => {
    if (location.tz && (!location.lat || !location.lng)) {
      locationDispatch({ type: actionTypes.SET_TZ, payload: '' });
    }
  }, [location, locationDispatch]);

  useEffect(() => {
    locationDispatch({ type: actionTypes.CLEAR_ADDRESS_NULL_ERROR });
  }, [searchTerm, locationInputType, locationDispatch]);

  useEffect(() => {
    locationDispatch({ type: actionTypes.CLEAR_LAT_NULL_ERROR });
  }, [location.lat, locationInputType, locationDispatch]);

  useEffect(() => {
    locationDispatch({ type: actionTypes.CLEAR_LNG_NULL_ERROR });
  }, [location.lng, locationInputType, locationDispatch]);

  const debouncedValidateLocation = useMemo(
    () => debounce((locationInputType, location) => {
      const validationResult = validateLocationSync(locationInputType, location);
      const isValid = !Object.values(validationResult).some((item) => !!item);
      locationDispatch({ type: actionTypes.SET_LOCATION_ERROR, payload: validationResult });
      locationDispatch({ type: actionTypes.SET_LOCATION_VALID, payload: isValid });
    }, Config.TypingDelay / 2),
    [locationDispatch]
  );

  useEffect(() => {
    debouncedValidateLocation(locationInputType, location);
    /* Cleanup function */
    return () => {
      debouncedValidateLocation.cancel();
    };
  }, [location, locationInputType, debouncedValidateLocation]);

  const handleSnackbarClose = useCallback((event, reason) => {
    locationDispatch({ type: actionTypes.SET_ID, payload: '' });
  }, [locationDispatch]);

  return (
    <Stack direction="column" spacing={2}>
      <LocationInputTypeToggle />
      {locationInputType === TYPE_ADDR ? (
        <AddressInput setErrorMessage={setErrorMessage} />
      ) : (
        <CoordinatesInput />
      )}
      <TimezoneFetcher
        lat={location.lat}
        lng={location.lng}
        latestTzRequest={latestTzRequest}
      />
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={location.id === ADDR_UNKNOWN}
        autoHideDuration={12000}
        onClose={handleSnackbarClose}
        sx={(theme) => ({
          boxShadow: theme.shadows[2],
        })}
      >
        <Alert severity="warning" sx={alertStyle} onClose={handleSnackbarClose}>
          Sorry, we couldn't fetch the address, but you can use these GPS coordinates of this location. ↓
        </Alert>
      </Snackbar>
    </Stack>
  );
};

LocationInput.propTypes = {
  setErrorMessage: PropTypes.func.isRequired,
};

export default React.memo(LocationInput);
