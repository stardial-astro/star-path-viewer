// src/components/Input/Star/RadecDecDmsInput.jsx
import { memo, useCallback } from 'react';
import { Grid, Typography } from '@mui/material';
import { useStarInput } from '@context/StarInputContext';
import * as actionTypes from '@context/starInputActionTypes';
import { dmsToDecimal } from '@utils/coordUtils';
import CustomNumberField from '@/components/UI/CustomNumberField';
import { ErrorHelperText } from '@components/UI/HelperText';

const DEG_LABEL = 'Degrees';
const MIN_LABEL = 'Minutes';
const SEC_LABEL = 'Seconds';

const DEG_NAME = DEG_LABEL.toLowerCase();
const MIN_NAME = MIN_LABEL.toLowerCase();
const SEC_NAME = SEC_LABEL.toLowerCase();

const DEC_TEXT = 'Dec';

const RadecDecDmsInput = () => {
  const { starDecDms, starError, starNullError, starDispatch } = useStarInput();

  /** @type {(event: ChangeEvent) => void} */
  const handleInputChange = useCallback(
    (event) => {
      const { name, value } = event.target;
      /** @type {DecDmsObj & { [key: string]: string }} */
      const newDecDms = { ...starDecDms };
      newDecDms[name] = value;
      /* If at least one of the fields is provided, convert DMS to decimal degrees
       * Default to 0. The sign should be put in the degrees field
       */
      const newDec =
        newDecDms.degrees || newDecDms.minutes || newDecDms.seconds
          ? dmsToDecimal({
              sign: newDecDms.degrees[0] === '-' ? -1 : 1,
              degrees: Math.abs(parseInt(newDecDms.degrees)) || 0,
              minutes: parseInt(newDecDms.minutes) || 0,
              seconds: parseFloat(newDecDms.seconds) || 0,
            }).toString()
          : '';
      switch (name) {
        case DEG_NAME:
          starDispatch({
            type: actionTypes.SET_STAR_DEC_DEGREES,
            payload: value,
          });
          break;
        case MIN_NAME:
          starDispatch({
            type: actionTypes.SET_STAR_DEC_MINUTES,
            payload: value,
          });
          break;
        case SEC_NAME:
          starDispatch({
            type: actionTypes.SET_STAR_DEC_SECONDS,
            payload: value,
          });
          break;
        default:
          return;
      }
      starDispatch({ type: actionTypes.SET_STAR_DEC, payload: newDec });
    },
    [starDecDms, starDispatch],
  );

  return (
    <Grid
      container
      size={{ xs: 12, sm: 12, md: 6.1 }}
      rowSpacing={2}
      columnSpacing={1.5}
      alignItems="center"
      justifyContent="space-between"
    >
      <Grid
        size={{ xs: 12, sm: 0.9, md: 1.2 }}
        sx={{
          ml: { xs: 0.5, sm: 0, md: 0 },
          mr: { xs: 0, sm: -0.5, md: -0.5 },
          my: { xs: -1, sm: 0, md: 0 },
        }}
      >
        <Typography
          variant="body1"
          textAlign={{ xs: 'left', sm: 'center', md: 'center' }}
        >
          {DEC_TEXT}
        </Typography>
      </Grid>
      <Grid size={{ xs: 12, sm: 3.7, md: 3.6 }}>
        <CustomNumberField
          label={DEG_LABEL}
          name={DEG_NAME}
          value={starDecDms.degrees}
          onChange={handleInputChange}
          intOnly={true}
          min={-90}
          max={90}
          allowOutOfRange={true}
          error={!!starError.dec || !!starNullError.dec}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 3.7, md: 3.6 }}>
        <CustomNumberField
          label={MIN_LABEL}
          name={MIN_NAME}
          value={starDecDms.minutes}
          onChange={handleInputChange}
          intOnly={true}
          min={0}
          max={59}
          allowOutOfRange={false}
          error={!!starError.dec || !!starNullError.dec}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 3.7, md: 3.6 }}>
        <CustomNumberField
          label={SEC_LABEL}
          name={SEC_NAME}
          value={starDecDms.seconds}
          onChange={handleInputChange}
          min={0}
          max={59.999}
          allowOutOfRange={false}
          error={!!starError.dec || !!starNullError.dec}
        />
      </Grid>
      {(starError.dec || starNullError.dec) && (
        <Grid size={{ xs: 12, sm: 12, md: 12 }} sx={{ mt: -2 }}>
          <ErrorHelperText variant="body2">
            {starError.dec || starNullError.dec}
          </ErrorHelperText>
        </Grid>
      )}
    </Grid>
  );
};

export default memo(RadecDecDmsInput);
