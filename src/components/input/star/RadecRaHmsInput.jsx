// src/components/input/star/RadecRaHmsInput.jsx
import { memo, useCallback } from 'react';
import { Grid, Typography } from '@mui/material';
import { useStarInput } from '@context/StarInputContext';
import * as actionTypes from '@context/starInputActionTypes';
import { hmsToDecimal } from '@utils/dateUtils';
import CustomNumberField from '@components/ui/CustomNumberField';
import ErrorHelperText from '@components/ui/ErrorHelperText';

const HR_ID = 'hours-hms-input';
const MIN_ID = 'minutes-hms-input';
const SEC_ID = 'seconds-hms-input';
const HR_LABEL = 'Hours';
const MIN_LABEL = 'Minutes';
const SEC_LABEL = 'Seconds';
const HR_NAME = HR_LABEL.toLowerCase();
const MIN_NAME = MIN_LABEL.toLowerCase();
const SEC_NAME = SEC_LABEL.toLowerCase();
const PLACEHOLDER = '0';

const RA_TEXT = 'RA';

const RadecRaHmsInput = () => {
  const { starRaHms, starError, starNullError, starDispatch } = useStarInput();

  /** @type {(event: ChangeEvent) => void} */
  const handleInputChange = useCallback(
    (event) => {
      const { name, value } = event.target;
      /** @type {RaHmsObj & { [key: string]: string }} */
      const newRaHms = { ...starRaHms };
      newRaHms[name] = value;
      /* If at least one of the fields is provided, convert HMS to decimal degrees
       * Default to 0. The sign should be put in the hours field
       */
      const newRa =
        newRaHms.hours || newRaHms.minutes || newRaHms.seconds
          ? (
              hmsToDecimal({
                sign: newRaHms.hours[0] === '-' ? -1 : 1,
                hours: Math.abs(parseInt(newRaHms.hours)) || 0,
                minutes: parseInt(newRaHms.minutes) || 0,
                seconds: parseFloat(newRaHms.seconds) || 0,
              }) * 15
            ).toString()
          : '';
      switch (name) {
        case HR_NAME:
          starDispatch({ type: actionTypes.SET_STAR_RA_HOURS, payload: value });
          break;
        case MIN_NAME:
          starDispatch({
            type: actionTypes.SET_STAR_RA_MINUTES,
            payload: value,
          });
          break;
        case SEC_NAME:
          starDispatch({
            type: actionTypes.SET_STAR_RA_SECONDS,
            payload: value,
          });
          break;
        default:
          return;
      }
      starDispatch({ type: actionTypes.SET_STAR_RA, payload: newRa });
    },
    [starRaHms, starDispatch],
  );

  return (
    <Grid
      container
      size={{ xs: 12, sm: 12, md: 5.88 }}
      rowSpacing={2}
      columnSpacing={1.5}
      alignItems="center"
      justifyContent="space-between"
    >
      <Grid
        size={{ xs: 12, sm: 0.9, md: 1.2 }}
        ml={{ xs: 0.5, sm: 0, md: 0 }}
        mr={{ xs: 0, sm: -0.5, md: -0.5 }}
        my={{ xs: -1, sm: 0, md: 0 }}
      >
        <Typography
          variant="body1"
          textAlign={{ xs: 'left', sm: 'center', md: 'center' }}
        >
          {RA_TEXT}
        </Typography>
      </Grid>
      <Grid size={{ xs: 12, sm: 3.7, md: 3.6 }}>
        <CustomNumberField
          id={HR_ID}
          label={HR_LABEL}
          placeholder={PLACEHOLDER}
          name={HR_NAME}
          value={starRaHms.hours}
          onChange={handleInputChange}
          intOnly={true}
          min={0}
          max={23}
          allowOutOfRange={false}
          error={!!starError.ra || !!starNullError.ra}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 3.7, md: 3.6 }}>
        <CustomNumberField
          id={MIN_ID}
          label={MIN_LABEL}
          placeholder={PLACEHOLDER}
          name={MIN_NAME}
          value={starRaHms.minutes}
          onChange={handleInputChange}
          intOnly={true}
          min={0}
          max={59}
          allowOutOfRange={false}
          error={!!starError.ra || !!starNullError.ra}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 3.7, md: 3.6 }}>
        <CustomNumberField
          id={SEC_ID}
          label={SEC_LABEL}
          name={SEC_NAME}
          placeholder={PLACEHOLDER}
          value={starRaHms.seconds}
          onChange={handleInputChange}
          min={0}
          max={59.999}
          allowOutOfRange={false}
          error={!!starError.ra || !!starNullError.ra}
        />
      </Grid>
      {(starError.ra || starNullError.ra) && (
        <Grid size={{ xs: 12, sm: 12, md: 12 }} sx={{ mt: -2 }}>
          <ErrorHelperText variant="body2">
            {starError.ra || starNullError.ra}
          </ErrorHelperText>
        </Grid>
      )}
    </Grid>
  );
};

export default memo(RadecRaHmsInput);
