// src/components/Input/Star/StarNameInput.jsx
import React, { useCallback } from 'react';
import { TextField, MenuItem } from '@mui/material';
import { useStarInput } from '@context/StarInputContext';
import * as actionTypes from '@context/starInputActionTypes';
import { STARS, TYPE_NAME } from '@utils/constants';

const StarNameInput = () => {
  const {
    starName,
    starError, starNullError,
    starDispatch,
  } = useStarInput();

  const handleInputChange = useCallback((event) => {
    starDispatch({ type: actionTypes.SET_STAR_NAME, payload: event.target.value });
  }, [starDispatch]);

  return (
    <TextField
      required
      select
      autoComplete="off"
      label="Planet name"
      InputLabelProps={{ htmlFor: 'star-select' }}
      inputProps={{ id: 'star-select' }}
      size="small"
      variant="outlined"
      name={TYPE_NAME}
      value={starName}
      onChange={handleInputChange}
      fullWidth
      error={!!starError.name || !!starNullError.name}
      helperText={starError.name || starNullError.name}
      sx={{ marginTop: 2 }}
    >
      <MenuItem key="none" value="" sx={{ color: 'action.active' }}>
        -- Select a planet --
      </MenuItem>
      {Object.keys(STARS).map((key) => (
        <MenuItem key={key} value={key}>
          {key}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default React.memo(StarNameInput);
