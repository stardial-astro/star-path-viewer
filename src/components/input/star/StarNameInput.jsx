// src/components/input/star/StarNameInput.jsx
import { memo, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { TextField, MenuItem } from '@mui/material';
import { useHome } from '@context/HomeContext';
import { useStarInput } from '@context/StarInputContext';
import * as actionTypes from '@context/starInputActionTypes';
import { PLANETS } from '@utils/constants';
import { clearStarError } from '@utils/starInputUtils';

const NAME_NAME = 'planet';

const NAME_ID = 'star-select';

const StarNameInput = () => {
  const { t } = useTranslation('star');
  const { setErrorMessage } = useHome();
  const { starName, starError, starNullError, resetStarValues, starDispatch } =
    useStarInput();

  const nameError = starError.name || starNullError.name;

  const nullItem = useMemo(
    () => (
      <MenuItem dense key="none" value="" sx={{ color: 'action.active' }}>
        {`— ${t('select_planet')} —`}
      </MenuItem>
    ),
    [t],
  );

  const planetItems = useMemo(
    () =>
      PLANETS.map((name) => (
        <MenuItem dense key={name} value={name}>
          {t('common:' + name)}
        </MenuItem>
      )),
    [t],
  );

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
      label={t('planet_name')}
      name={NAME_NAME}
      value={starName}
      onChange={handleInputChange}
      error={!!nameError}
      helperText={nameError ? t(nameError) : ''}
      sx={{ mt: 2 }}
      slotProps={{
        htmlInput: { id: NAME_ID },
        inputLabel: { htmlFor: NAME_ID },
        select: {
          MenuProps: {
            disableScrollLock: true,
          },
        },
      }}
      fullWidth
    >
      {nullItem}
      {planetItems}
    </TextField>
  );
};

export default memo(StarNameInput);
