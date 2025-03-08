// src/components/Input/Star/RadecDecimalInput.jsx
import React, { useCallback } from 'react';
import { Grid, TextField } from '@mui/material';
import { useStarInput } from '@context/StarInputContext';
import * as actionTypes from '@context/starInputActionTypes';
// import { decimalToDMS } from '@utils/coordUtils';
// import { decimalToHMS } from '@utils/dateUtils';

const RadecDecimalInput = () => {
  const {
    starRadec,
    // starRaHMS,
    // starDecDMS,
    starError, starNullError,
    starDispatch,
  } = useStarInput();

  const handleInputChange = useCallback((event) => {
    const { name, value } = event.target;
    if (name === 'ra') {
      starDispatch({ type: actionTypes.SET_STAR_RA, payload: value });
    } else {
      starDispatch({ type: actionTypes.SET_STAR_DEC, payload: value });
    }
    /* Convert decimal degrees to HMS/DMS */
    // const newRadec = { raHMS: starRaHMS, decDMS: starDecDMS };
    // if (name === 'ra' && value) {
    //   const hms = decimalToHMS(parseFloat(value) / 15);
    //   newRadec.raHMS.hours = `${hms.sign < 0 ? '-' : ''}${hms.hours}`;
    //   newRadec.raHMS.minutes = hms.minutes.toString();
    //   newRadec.raHMS.seconds = hms.seconds.toString();
    //   starDispatch({ type: actionTypes.SET_STAR_RA_HMS, payload: newRadec.raHMS });
    // } else if (name === 'dec' && value) {
    //   const dms = decimalToDMS(parseFloat(value));
    //   newRadec.decDMS.degrees = `${dms.sign < 0 ? '-' : ''}${dms.degrees}`;
    //   newRadec.decDMS.minutes = dms.minutes.toString();
    //   newRadec.decDMS.seconds = dms.seconds.toString();
    //   starDispatch({ type: actionTypes.SET_STAR_DEC_DMS, payload: newRadec.decDMS });
    // }
  }, [starDispatch]);

  return (
    <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
      <Grid item xs={12} sm={6} md={6}>
        <TextField
          required
          label="Right Ascension (RA)"
          placeholder="Enter in decimal degrees"
          size="small"
          variant="outlined"
          name="ra"
          type="number"
          value={starRadec.ra}
          onChange={handleInputChange}
          onWheel={(event) => event.target.blur()}
          fullWidth
          error={!!starError.ra || !!starNullError.ra}
          helperText={starError.ra || starNullError.ra}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={6}>
        <TextField
          required
          label="Declination (Dec)"
          placeholder="Enter in decimal degrees"
          size="small"
          variant="outlined"
          name="dec"
          type="number"
          value={starRadec.dec}
          onChange={handleInputChange}
          onWheel={(event) => event.target.blur()}
          fullWidth
          error={!!starError.dec || !!starNullError.dec}
          helperText={starError.dec || starNullError.dec}
        />
      </Grid>
    </Grid>
  );
};

export default React.memo(RadecDecimalInput);
