// src/components/input/location/LocationInput.jsx
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Stack, Snackbar } from '@mui/material';
import { useHome } from '@context/HomeContext';
import { useLocationInput } from '@context/LocationInputContext';
import * as actionTypes from '@context/locationInputActionTypes';
import useDebounce from '@hooks/useDebounce';
import useFetchTimezone from '@/hooks/useFetchTimezone';
import useDetermineService from '@hooks/useDetermineService';
import config from '@utils/config';
import { LOC_INPUT_TYPES, LOC_UNKNOWN_ID } from '@utils/constants';
import CustomAlert from '@components/ui/CustomAlert';
import LocationInputTypeToggle from './LocationInputTypeToggle';
import AddressInput from './AddressInput';
import CoordinatesInput from './CoordinatesInput';

const LocationInput = () => {
  // console.log('Rendering LocationInput');
  const { t } = useTranslation();
  const { isDelayedOnline, offlineState } = useHome();
  const {
    skipTz,
    location,
    locationInputType,
    geoService,
    setGeoService,
    locationDispatch,
  } = useLocationInput();

  const debouncedLocation = useDebounce(location, config.TYPING_DELAY);

  /* ------------------------------------------------------------------|
   * Initialize
   * ------------------------------------------------------------------|
   */
  /* [AddressInput] Clear errors; clear null errors and reset validity if no flag;
   * clear location and suggestions
   * > Clearing debounced searchTerm also clears lastSelectedTermRef in [AddressInput]
   */
  /* [CoordinatesInput] Clear errors; clear null errors and reset validity if no flag;
   * KEEP location and suggestions
   * (so if there is a reverse geocoding unavailable warning triggered by
   * id === LOC_UNKNOWN_ID, it keeps open)
   */

  /* Determine the geocoding service */
  useDetermineService(isDelayedOnline, offlineState, geoService, setGeoService);

  /* ------------------------------------------------------------------|
   * Clear errors when user starts typing
   * ------------------------------------------------------------------|
   */
  /* [AddressInput] Clear errors & null errors when user starts typing in search bar; reset validity */
  /* [CoordinatesInput] Clear errors & null errors when user starts typing coordinates; reset validity */

  /* ------------------------------------------------------------------|
   * Update refs
   * ------------------------------------------------------------------|
   */
  /* [LocationInputTypeToggle] Update locationInputTypeRef when toggles */

  /* ------------------------------------------------------------------|
   * Clear stale data on input change
   * ------------------------------------------------------------------|
   */
  /* [AddressInput] Clear suggestions and lastSelectedTermRef if
   * debounced searchTerm is cleared
   * > When in address mode, also clear location
   * > When in coordinate mode, only clear id
   */
  /* [LocationInputTypeToggle]
   * > When toggles to address mode, clear location and suggestions
   * > When toggles to coordinate mode, KEEP location and suggestions
   * (so if there is a reverse geocoding unavailable warning triggered by
   * id === LOC_UNKNOWN_ID, it keeps open)
   */

  /* ------------------------------------------------------------------|
   * Fetch data
   * ------------------------------------------------------------------|
   */
  /* [AddressInput] Fetch suggestions on debounced searchTerm change */

  /* Fetch and update tz on debounced location change */
  useFetchTimezone(
    debouncedLocation.lat,
    debouncedLocation.lng,
    skipTz,
    locationDispatch,
  );

  /* ------------------------------------------------------------------|
   * Handlers
   * ------------------------------------------------------------------|
   */
  const handleSnackbarClose = useCallback(() => {
    locationDispatch({ type: actionTypes.SET_ID, payload: '' });
  }, [locationDispatch]);

  return (
    <Stack direction="column" spacing={2}>
      <LocationInputTypeToggle />
      {locationInputType === LOC_INPUT_TYPES.addr ? (
        <AddressInput />
      ) : (
        <CoordinatesInput />
      )}
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={location.id === LOC_UNKNOWN_ID}
        autoHideDuration={12_000}
        onClose={handleSnackbarClose}
        sx={(theme) => ({
          boxShadow: theme.shadows[2],
        })}
      >
        <CustomAlert severity="warning" onClose={handleSnackbarClose}>
          {t('errors:reverse_geo_error')}
        </CustomAlert>
      </Snackbar>
    </Stack>
  );
};

export default memo(LocationInput);
