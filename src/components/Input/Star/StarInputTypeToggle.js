// src/components/Input/Star/StarInputTypeToggle.js
import React, { useCallback } from 'react';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useStarInput } from '../../../context/StarInputContext';
import * as actionTypes from '../../../context/starInputActionTypes';
import { TYPE_NAME, TYPE_HIP, TYPE_RADEC } from '../../../utils/constants';

const StarInputTypeToggle = () => {
  const { starInputType, starDispatch } = useStarInput();

  const handleInputTypeChange = useCallback((event, newInputType) => {
    if (newInputType !== null) {
      /* Clear the fields */
      starDispatch({ type: actionTypes.CLEAR_STAR_HIP_AND_NAME });
      starDispatch({ type: actionTypes.CLEAR_SEARCH_TERM });
      starDispatch({ type: actionTypes.CLEAR_STAR_RADEC });
      starDispatch({ type: actionTypes.CLEAR_STAR_RA_HMS });
      starDispatch({ type: actionTypes.CLEAR_STAR_DEC_DMS });

      starDispatch({ type: actionTypes.SET_INPUT_TYPE, payload: newInputType });
    }
  }, [starDispatch]);

  return (
    <ToggleButtonGroup
      color="primary"
      size="small"
      value={starInputType}
      exclusive
      onChange={handleInputTypeChange}
      aria-label="Input type"
      fullWidth
    >
      <ToggleButton value={TYPE_NAME} aria-label="Input Name">
        Planet
      </ToggleButton>
      <ToggleButton value={TYPE_HIP} aria-label="Input Hipparcos">
        Star
      </ToggleButton>
      <ToggleButton value={TYPE_RADEC} aria-label="Input Radec">
        RA/Dec (J2000)
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

export default React.memo(StarInputTypeToggle);
