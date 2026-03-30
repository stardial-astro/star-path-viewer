// src/components/Input/Star/StarNameInput.jsx
import { memo, useEffect, useCallback } from 'react';
import { MenuItem } from '@mui/material';
import { useHome } from '@context/HomeContext';
import { useStarInput } from '@context/StarInputContext';
import * as actionTypes from '@context/starInputActionTypes';
import { PLANETS } from '@utils/constants';
import { clearStarError } from '@utils/starInputUtils';
import TextField from '@mui/material/TextField';

const NAME_LABEL = 'Planet name';
const NAME_NAME = 'planet';
const NAME_NULL_TEXT = '— Select a planet —';

const NAME_ID = 'star-select';

const nullItem = (
  <MenuItem key="none" value="" sx={{ color: 'action.active' }}>
    {NAME_NULL_TEXT}
  </MenuItem>
);

const planetItems = PLANETS.map((name) => (
  <MenuItem key={name} value={name}>
    {name}
  </MenuItem>
));

const StarNameInput = () => {
  const { setErrorMessage } = useHome();
  const { starName, starError, starNullError, resetStarValues, starDispatch } =
    useStarInput();

  /* Initialize */
  useEffect(() => {
    /* Clear errors & null errors */
    clearStarError(starDispatch, setErrorMessage);
    starDispatch({ type: actionTypes.CLEAR_STAR_NULL_ERROR });
    /* Clear name, HIP, suggestions, RA/Dec and resets validity */
    resetStarValues();
  }, [resetStarValues, starDispatch, setErrorMessage]);

  /* Clear errors & null errors when user selects a name option */
  useEffect(() => {
    clearStarError(starDispatch, setErrorMessage);
    if (starName) {
      starDispatch({ type: actionTypes.CLEAR_STAR_NAME_NULL_ERROR });
      /* Set valid if selects a star */
      starDispatch({ type: actionTypes.SET_STAR_VALID, payload: true });
    }
  }, [starName, starDispatch, setErrorMessage]);

  /** @type {(event: ReactChangeEvent) => void} */
  const handleInputChange = useCallback(
    (event) => {
      starDispatch({
        type: actionTypes.SET_STAR_NAME,
        payload: event.target.value,
      });
    },
    [starDispatch],
  );

  return (
    <TextField
      select
      required
      autoComplete="off"
      variant="outlined"
      size="small"
      // id={NAME_ID} // not working, use slotProps
      label={NAME_LABEL}
      name={NAME_NAME}
      value={starName}
      onChange={handleInputChange}
      error={!!starError.name || !!starNullError.name}
      helperText={starError.name || starNullError.name}
      sx={{ mt: 2 }}
      slotProps={{
        htmlInput: { id: NAME_ID },
        inputLabel: { htmlFor: NAME_ID },
      }}
      fullWidth
    >
      {nullItem}
      {planetItems}
    </TextField>
  );
};

export default memo(StarNameInput);
