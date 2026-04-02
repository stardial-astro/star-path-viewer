// src/components/Input/Location/CoordinatesInput.jsx
import { memo, useEffect, useCallback, useEffectEvent } from 'react';
import { Grid } from '@mui/material';
import { useHome } from '@context/HomeContext';
import { useLocationInput } from '@context/LocationInputContext';
import { useDateInput } from '@context/DateInputContext';
import * as actionTypes from '@context/locationInputActionTypes';
import { LATITUDE, LONGITUDE } from '@utils/constants';
import {
  clearLatError,
  clearLngError,
  clearLocationError,
} from '@utils/locationInputUtils';
import CustomNumberField from '@/components/UI/CustomNumberField';

const LAT_ID = 'latitude-input';
const LNG_ID = 'longitude-input';
const LAT_LABEL = 'Latitude';
const LNG_LABEL = 'Longitude';
const LAT_PLACEHOLDER = 'Enter the latitude in decimal degrees';
const LNG_PLACEHOLDER = 'Enter the longitude in decimal degrees';

const CoordinatesInput = () => {
  // console.log('Rendering CoordinatesInput');
  const { setErrorMessage } = useHome();
  const {
    setSkipTz,
    location,
    gpsLoading,
    locationError,
    locationNullError,
    locationDispatch,
  } = useLocationInput();
  const { flag } = useDateInput();

  const onInit = useEffectEvent(() => {
    /* Clear errors */
    clearLocationError(locationDispatch, setErrorMessage);
    /* Clear null errors if no flag */
    if (!flag) {
      locationDispatch({ type: actionTypes.CLEAR_LOCATION_NULL_ERROR });
      /* Reset validity */
      locationDispatch({ type: actionTypes.SET_LOCATION_VALID, payload: true });
    }
    /* KEEP location and suggestions
     * (so if there is a reverse geocoding unavailable warning triggered by
     * id === LOC_UNKNOWN_ID, it keeps open)
     */
  });

  /* Initialize */
  useEffect(() => {
    onInit();
  }, []);

  /* Clear errors & null errors in each field when user starts typing coordinates */
  useEffect(() => {
    clearLatError(locationDispatch, setErrorMessage);
    if (location.lat) {
      locationDispatch({ type: actionTypes.CLEAR_LAT_NULL_ERROR });
    }
  }, [location.lat, locationDispatch, setErrorMessage]);

  useEffect(() => {
    clearLngError(locationDispatch, setErrorMessage);
    if (location.lng) {
      locationDispatch({ type: actionTypes.CLEAR_LNG_NULL_ERROR });
    }
  }, [location.lng, locationDispatch, setErrorMessage]);

  /** @type {(event: ChangeEvent) => void} */
  const handleInputChange = useCallback(
    (event) => {
      const { name, value } = event.target;
      /* Ready to fetch tz */
      setSkipTz(false);
      if (name === LATITUDE) {
        locationDispatch({ type: actionTypes.SET_LAT, payload: value });
      } else {
        locationDispatch({ type: actionTypes.SET_LNG, payload: value });
      }
    },
    [setSkipTz, locationDispatch],
  );

  return (
    <div>
      <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 6 }}>
          <CustomNumberField
            id={LAT_ID}
            label={LAT_LABEL}
            placeholder={LAT_PLACEHOLDER}
            name={LATITUDE}
            value={location.lat}
            onChange={handleInputChange}
            min={-90}
            max={90}
            allowOutOfRange={false}
            loading={gpsLoading}
            error={!!locationError.lat || !!locationNullError.lat}
            helperText={locationError.lat || locationNullError.lat}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 6 }}>
          <CustomNumberField
            id={LNG_ID}
            label={LNG_LABEL}
            placeholder={LNG_PLACEHOLDER}
            name={LONGITUDE}
            value={location.lng}
            onChange={handleInputChange}
            min={-180}
            max={180}
            allowOutOfRange={false}
            loading={gpsLoading}
            error={!!locationError.lng || !!locationNullError.lng}
            helperText={locationError.lng || locationNullError.lng}
          />
        </Grid>
      </Grid>
    </div>
  );
};

export default memo(CoordinatesInput);
