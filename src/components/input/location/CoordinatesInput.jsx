// src/components/input/location/CoordinatesInput.jsx
import { memo, useEffect, useCallback, useEffectEvent } from 'react';
import { useTranslation } from 'react-i18next';
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
import { isDevMode } from '@utils/devMode';
import CustomNumberField from '@components/ui/CustomNumberField';

const LAT_ID = 'latitude-input';
const LNG_ID = 'longitude-input';

const CoordinatesInput = () => {
  // console.log('Rendering CoordinatesInput');
  const { t } = useTranslation('location');
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

  const latError = locationError.lat || locationNullError.lat;
  const lngError = locationError.lng || locationNullError.lng;

  const onInit = useEffectEvent(() => {
    /* Clear errors */
    clearLocationError(locationDispatch, setErrorMessage);
    /* Clear null errors if no flag */
    isDevMode && console.debug('[CoordinatesInput onInit] flag:', flag); // TODO: test
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

  /* Clear errors & null errors in each field when user starts typing coordinates; reset validity */
  useEffect(() => {
    clearLatError(locationDispatch, setErrorMessage);
    if (location.lat) {
      locationDispatch({ type: actionTypes.CLEAR_LAT_NULL_ERROR });
    }
    /* Reset validity */
    locationDispatch({ type: actionTypes.SET_LOCATION_VALID, payload: true });
  }, [location.lat, locationDispatch, setErrorMessage]);

  useEffect(() => {
    clearLngError(locationDispatch, setErrorMessage);
    if (location.lng) {
      locationDispatch({ type: actionTypes.CLEAR_LNG_NULL_ERROR });
    }
    /* Reset validity */
    locationDispatch({ type: actionTypes.SET_LOCATION_VALID, payload: true });
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
    <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <CustomNumberField
          id={LAT_ID}
          label={t('latitude')}
          placeholder={t('enter_decimal')}
          name={LATITUDE}
          value={location.lat}
          onChange={handleInputChange}
          min={-90}
          max={90}
          allowOutOfRange={false}
          loading={gpsLoading}
          error={!!latError}
          helperText={latError ? t(latError) : ''}
        />
      </Grid>
      <Grid size="grow">
        <CustomNumberField
          id={LNG_ID}
          label={t('longitude')}
          placeholder={t('enter_decimal')}
          name={LONGITUDE}
          value={location.lng}
          onChange={handleInputChange}
          min={-180}
          max={180}
          allowOutOfRange={false}
          loading={gpsLoading}
          error={!!lngError}
          helperText={lngError ? t(lngError) : ''}
        />
      </Grid>
    </Grid>
  );
};

export default memo(CoordinatesInput);
