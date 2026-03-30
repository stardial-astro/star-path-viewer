// src/components/Input/Star/RadecInput.jsx
import { memo, useEffect } from 'react';
import { Grid } from '@mui/material';
import { useHome } from '@context/HomeContext';
import { useStarInput } from '@context/StarInputContext';
import * as actionTypes from '@context/starInputActionTypes';
import { RADEC_TYPES } from '@utils/constants';
import {
  clearRaError,
  clearDecError,
  clearStarError,
} from '@utils/starInputUtils';
import RadecFormatToggle from './RadecFormatToggle';
import RadecDecimalInput from './RadecDecimalInput';
import RadecRaHmsInput from './RadecRaHmsInput';
import RadecDecDmsInput from './RadecDecDmsInput';

const RadecInput = () => {
  const { setErrorMessage } = useHome();
  const { starRadec, radecFormat, starDispatch } = useStarInput();

  /* Initialize */
  useEffect(() => {
    /* Clear errors & null errors */
    clearStarError(starDispatch, setErrorMessage);
    starDispatch({ type: actionTypes.CLEAR_STAR_NULL_ERROR });
  }, [starDispatch, setErrorMessage]);

  /* Clear errors & null and reset validity when toggles RA/Dec format */
  useEffect(() => {
    clearStarError(starDispatch, setErrorMessage);
    starDispatch({ type: actionTypes.SET_STAR_VALID, payload: true });
    starDispatch({ type: actionTypes.CLEAR_STAR_NULL_ERROR });
  }, [radecFormat, starDispatch, setErrorMessage]);

  /* Clear errors & null errors in each field when user starts typing RA/Dec */
  useEffect(() => {
    clearRaError(starDispatch, setErrorMessage);
    if (starRadec.ra) {
      starDispatch({ type: actionTypes.CLEAR_STAR_RA_NULL_ERROR });
    }
  }, [starRadec.ra, starDispatch, setErrorMessage]);

  useEffect(() => {
    clearDecError(starDispatch, setErrorMessage);
    if (starRadec.dec) {
      starDispatch({ type: actionTypes.CLEAR_STAR_DEC_NULL_ERROR });
    }
  }, [starRadec.dec, starDispatch, setErrorMessage]);

  return (
    <div>
      <RadecFormatToggle />

      {radecFormat === RADEC_TYPES.dd ? (
        <RadecDecimalInput />
      ) : (
        <Grid
          container
          spacing={{ xs: 2, sm: 2, md: 3 }}
          alignItems="flex-start"
        >
          <RadecRaHmsInput />
          <RadecDecDmsInput />
        </Grid>
      )}
    </div>
  );
};

export default memo(RadecInput);
