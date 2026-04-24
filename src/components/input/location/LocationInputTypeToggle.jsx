// src/components/input/location/LocationInputTypeToggle.jsx
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useLocationInput } from '@context/LocationInputContext';
import * as actionTypes from '@context/locationInputActionTypes';
import { LOC_INPUT_TYPES } from '@utils/constants';

const GROUP_LABEL = 'Input type';
const ADDR_LABEL = 'Search address';
const COORD_LABEL = 'Enter coordinates';

const LocationInputTypeToggle = () => {
  const { t } = useTranslation('location');
  const { locationInputType, locationInputTypeRef, locationDispatch } =
    useLocationInput();

  /* [AddressInput] When toggles to address mode, clear errors; clear null errors
   * and reset validity if no flag
   */
  /* [CoordinatesInput] When toggles to coordinate mode, clear errors; clear null errors
   * and reset validity if no flag;
   */

  /** @type {(event: ReactMouseEvent, value: LocInputType | null) => void} */
  const handleInputTypeChange = useCallback(
    (event, value) => {
      /* Block deselection (when value is null) */
      if (value === null) return;
      locationInputTypeRef.current = value;
      locationDispatch({ type: actionTypes.SET_INPUT_TYPE, payload: value });
      // TODO: test: cleaning should be done in AddressInput
      /* When toggles to address mode, clear location and suggestions */
      // if (value === LOC_INPUT_TYPES.addr) {
      //   resetLocationValues();
      //   /* Clearing debounced searchTerm also clears lastSelectedTermRef below */
      // }
      /* When toggles to coordinate mode, KEEP location and suggestions
       * (so if there is a reverse geocoding unavailable warning triggered by
       * id === LOC_UNKNOWN_ID, it keeps open)
       */
    },
    [locationInputTypeRef, locationDispatch],
  );

  return (
    <ToggleButtonGroup
      exclusive
      aria-label={GROUP_LABEL}
      color="primary"
      size="small"
      value={locationInputType}
      onChange={handleInputTypeChange}
      fullWidth
    >
      <ToggleButton value={LOC_INPUT_TYPES.addr} aria-label={ADDR_LABEL}>
        {t('address')}
      </ToggleButton>
      <ToggleButton value={LOC_INPUT_TYPES.coord} aria-label={COORD_LABEL}>
        {t('coordinates')}
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

export default memo(LocationInputTypeToggle);
