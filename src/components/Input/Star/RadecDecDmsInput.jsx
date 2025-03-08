// src/components/Input/Star/RadecDecDmsInput.jsx
import React, { useCallback } from 'react';
import { Grid, TextField, Typography } from '@mui/material';
import { useStarInput } from '@context/StarInputContext';
import * as actionTypes from '@context/starInputActionTypes';
import { dmsToDecimal } from '@utils/coordUtils';

const RadecDecDmsInput = () => {
  const {
    starDecDMS,
    starError, starNullError,
    starDispatch,
  } = useStarInput();

  const handleInputChange = useCallback((event) => {
    const { name, value } = event.target;
    const newDecDMS = { ...starDecDMS };
    newDecDMS[name] = value;
    /* If at least one of the fields is provided, convert DMS to decimal degrees */
    const newDec = newDecDMS.degrees || newDecDMS.minutes || newDecDMS.seconds
      ? dmsToDecimal({
          sign: newDecDMS.degrees[0] === '-' ? -1 : 1,
          degrees: Math.abs(parseInt(newDecDMS.degrees)) || 0,
          minutes: parseInt(newDecDMS.minutes) || 0,
          seconds: parseInt(newDecDMS.seconds) || 0,
        }).toString()
      : '';
    switch (name) {
      case 'degrees':
        starDispatch({ type: actionTypes.SET_STAR_DEC_DEGREES, payload: value });
        break;
      case 'minutes':
        starDispatch({ type: actionTypes.SET_STAR_DEC_MINUTES, payload: value });
        break;
      case 'seconds':
        starDispatch({ type: actionTypes.SET_STAR_DEC_SECONDS, payload: value });
        break;
      default:
        return;
    }
    starDispatch({ type: actionTypes.SET_STAR_DEC, payload: newDec });
  }, [starDecDMS, starDispatch]);

  return (
    <Grid container item xs={12} sm={12} md={6.1} rowSpacing={2} columnSpacing={1.5} alignItems="center" justifyContent="space-between">
      <Grid item xs={12} sm={0.9} md={1.2} ml={{ xs: 0.5, sm: 0, md: 0 }} mr={{ xs: 0, sm: -0.5, md: -0.5 }} my={{ xs: -1, sm: 0, md: 0 }}>
        <Typography variant="body1" textAlign={{ xs: 'left', sm: 'center', md: 'center' }}>
          Dec
        </Typography>
      </Grid>
      <Grid item xs={12} sm={3.7} md={3.6}>
        <TextField
          required
          label="Degrees"
          size="small"
          variant="outlined"
          name="degrees"
          type="number"
          value={starDecDMS.degrees}
          onChange={handleInputChange}
          onWheel={(event) => event.target.blur()}
          inputProps={{ min: -90, max: 90 }}
          fullWidth
          error={!!starError.dec || !!starNullError.dec}
        />
      </Grid>
      <Grid item xs={12} sm={3.7} md={3.6}>
        <TextField
          required
          label="Minutes"
          size="small"
          variant="outlined"
          name="minutes"
          type="number"
          value={starDecDMS.minutes}
          onChange={handleInputChange}
          onWheel={(event) => event.target.blur()}
          inputProps={{ min: 0, max: 59 }}
          fullWidth
          error={!!starError.dec || !!starNullError.dec}
        />
      </Grid>
      <Grid item xs={12} sm={3.7} md={3.6}>
        <TextField
          required
          label="Seconds"
          size="small"
          variant="outlined"
          name="seconds"
          type="number"
          value={starDecDMS.seconds}
          onChange={handleInputChange}
          onWheel={(event) => event.target.blur()}
          inputProps={{ min: 0, max: 59 }}
          fullWidth
          error={!!starError.dec || !!starNullError.dec}
        />
      </Grid>
      {(starError.dec || starNullError.dec) && (
        <Grid item xs={12} sm={12} md={12} style={{ paddingTop: 0 }}>
          <Typography color="error" variant="body2" sx={{ marginTop: '4px', marginX: '14px', fontSize: 'caption.fontSize', textAlign: 'left' }}>
            {starError.dec || starNullError.dec}
          </Typography>
        </Grid>
      )}
    </Grid>
  );
};

export default React.memo(RadecDecDmsInput);
