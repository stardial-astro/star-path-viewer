// src/components/Input/Star/RadecDecimalInput.jsx
import { memo, useCallback } from 'react';
import { Grid } from '@mui/material';
import { useStarInput } from '@context/StarInputContext';
import * as actionTypes from '@context/starInputActionTypes';
// import { decimalToDms } from '@utils/coordUtils';
// import { decimalToHms } from '@utils/dateUtils';
import CustomNumberField from '@/components/UI/CustomNumberField';

const RA_LABEL = 'Right Ascension (RA)';
const DEC_LABEL = 'Declination (Dec)';

const RA_PLACEHOLDER = 'Enter in decimal degrees';
const DEC_PLACEHOLDER = 'Enter in decimal degrees';

const RA_NAME = 'ra';
const DEC_NAME = 'dec';

const RadecDecimalInput = () => {
  const {
    starRadec,
    // starRaHms,
    // starDecDms,
    starError,
    starNullError,
    starDispatch,
  } = useStarInput();

  /** @type {(event: ChangeEvent) => void} */
  const handleInputChange = useCallback(
    (event) => {
      const { name, value } = event.target;
      if (name === RA_NAME) {
        starDispatch({ type: actionTypes.SET_STAR_RA, payload: value });
      } else {
        starDispatch({ type: actionTypes.SET_STAR_DEC, payload: value });
      }
      /* Convert decimal degrees to HMS/DMS */
      // const newRadec = { raHms: starRaHms, decDms: starDecDms };
      // if (name === 'ra' && value) {
      //   const hms = decimalToHms(parseFloat(value) / 15);
      //   newRadec.raHms.hours = `${hms.sign < 0 ? '-' : ''}${hms.hours}`;
      //   newRadec.raHms.minutes = hms.minutes.toString();
      //   newRadec.raHms.seconds = hms.seconds.toString();
      //   starDispatch({ type: actionTypes.SET_STAR_RA_HMS, payload: newRadec.raHms });
      // } else if (name === 'dec' && value) {
      //   const dms = decimalToDms(parseFloat(value));
      //   newRadec.decDms.degrees = `${dms.sign < 0 ? '-' : ''}${dms.degrees}`;
      //   newRadec.decDms.minutes = dms.minutes.toString();
      //   newRadec.decDms.seconds = dms.seconds.toString();
      //   starDispatch({ type: actionTypes.SET_STAR_DEC_DMS, payload: newRadec.decDms });
      // }
    },
    [starDispatch],
  );

  return (
    <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
      <Grid size={{ xs: 12, sm: 6, md: 6 }}>
        <CustomNumberField
          label={RA_LABEL}
          placeholder={RA_PLACEHOLDER}
          name={RA_NAME}
          value={starRadec.ra}
          onChange={handleInputChange}
          min={0}
          max={360}
          allowOutOfRange={false}
          error={!!starError.ra || !!starNullError.ra}
          helperText={starError.ra || starNullError.ra}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 6 }}>
        <CustomNumberField
          label={DEC_LABEL}
          placeholder={DEC_PLACEHOLDER}
          name={DEC_NAME}
          value={starRadec.dec}
          onChange={handleInputChange}
          min={-90}
          max={90}
          allowOutOfRange={false}
          error={!!starError.dec || !!starNullError.dec}
          helperText={starError.dec || starNullError.dec}
        />
      </Grid>
    </Grid>
  );
};

export default memo(RadecDecimalInput);
