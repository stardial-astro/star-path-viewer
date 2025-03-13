// src/components/Input/Star/StarInput.js
import React, { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Stack } from '@mui/material';
import Config from '../../../Config';
import { useStarInput } from '../../../context/StarInputContext';
import * as actionTypes from '../../../context/starInputActionTypes';
import { TYPE_NAME, TYPE_HIP } from '../../../utils/constants';
import { validateStarSync, clearStarError } from '../../../utils/starInputUtils';
import StarInputTypeToggle from './StarInputTypeToggle';
import StarNameInput from './StarNameInput';
import StarHipInput from './StarHipInput';
import RadecInput from './RadecInput';
import debounce from 'lodash/debounce';

const StarInput = ({ setErrorMessage }) => {
  // console.log('Rendering StarInput');
  const {
    starName,
    starHip,
    starRadec, starRaHMS, starDecDMS,
    starInputType,  // 'name', 'hip', 'radec'
    radecFormat,  // 'decimal', 'dms'
    searchTerm,
    starDispatch,
  } = useStarInput();

  /* Initialize */
  useEffect(() => {
    clearStarError(starDispatch, setErrorMessage);
  }, [starDispatch, setErrorMessage]);

  /* Reset error when user starts typing */
  useEffect(() => {
    clearStarError(starDispatch, setErrorMessage);
    starDispatch({ type: actionTypes.CLEAR_STAR_NULL_ERROR });
    if (starName) {
      starDispatch({ type: actionTypes.SET_STAR_VALID, payload: true });
    }
  }, [searchTerm, starName, starHip, starRadec, starInputType, radecFormat, starDispatch, setErrorMessage]);

  useEffect(() => {
    starDispatch({ type: actionTypes.CLEAR_STAR_NAME_NULL_ERROR });
  }, [starName, starInputType, starDispatch]);

  useEffect(() => {
    starDispatch({ type: actionTypes.CLEAR_STAR_HIP_NULL_ERROR });
  }, [starHip, starInputType, starDispatch]);

  useEffect(() => {
    starDispatch({ type: actionTypes.CLEAR_STAR_RA_NULL_ERROR });
  }, [starRadec.ra, starInputType, radecFormat, starDispatch]);

  useEffect(() => {
    starDispatch({ type: actionTypes.CLEAR_STAR_DEC_NULL_ERROR });
  }, [starRadec.dec, starInputType, radecFormat, starDispatch]);

  const debouncedValidateStar = useMemo(
    () => debounce((starInputType, radecFormat, starHip, starRadec, starRaHMS, starDecDMS) => {
      const validationResult = validateStarSync(
        starInputType, radecFormat,
        starHip, starRadec, starRaHMS, starDecDMS
      );
      const isValid = !Object.values(validationResult).some(item => !!item);
      starDispatch({ type: actionTypes.SET_STAR_ERROR, payload: validationResult });
      starDispatch({ type: actionTypes.SET_STAR_VALID, payload: isValid });
    }, Config.TypingDelay / 2),
    [starDispatch]
  );

  useEffect(() => {
    debouncedValidateStar(starInputType, radecFormat, starHip, starRadec, starRaHMS, starDecDMS);
    /* Cleanup function */
    return () => {
      debouncedValidateStar.cancel();
    };
  }, [starHip, starRadec, starRaHMS, starDecDMS, starInputType, radecFormat, debouncedValidateStar]);

  return (
    <Stack direction="column">
      <StarInputTypeToggle />
      {starInputType === TYPE_NAME ? (
        <StarNameInput />
      ) : starInputType === TYPE_HIP ? (
        <StarHipInput setErrorMessage={setErrorMessage} />
      ) : (
        <RadecInput />
      )}
    </Stack>
  );
};

StarInput.propTypes = {
  setErrorMessage: PropTypes.func.isRequired,
};

export default React.memo(StarInput);
