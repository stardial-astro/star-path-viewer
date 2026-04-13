// src/components/input/star/RadecDecDmsInput.jsx
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Grid, Typography } from '@mui/material';
import { useStarInput } from '@context/StarInputContext';
import * as actionTypes from '@context/starInputActionTypes';
import { dmsToDecimal } from '@utils/coordUtils';
import CustomNumberField from '@components/ui/CustomNumberField';
import ErrorHelperText from '@components/ui/ErrorHelperText';

const DEG_ID = 'degrees-dms-input';
const MIN_ID = 'minutes-dms-input';
const SEC_ID = 'seconds-dms-input';
const DEG_NAME = 'degrees';
const MIN_NAME = 'minutes';
const SEC_NAME = 'seconds';
const PLACEHOLDER = '0';

const RadecDecDmsInput = () => {
  const { t } = useTranslation('star');
  const { starDecDms, starError, starNullError, starDispatch } = useStarInput();

  const decError = starError.dec || starNullError.dec;

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
        size={{ xs: 12, sm: 'auto' }}
        sx={{
          width: { sm: '45px', md: '30px' },
          ml: { xs: 0.5, sm: 0, md: 0 },
          mr: { xs: 0, sm: -0.5, md: -0.5 },
          my: { xs: -1, sm: 0, md: 0 },
        }}
      >
        <Typography
          variant="body1"
          textAlign={{ xs: 'left', sm: 'center', md: 'center' }}
          sx={{ lineHeight: { xs: 1.5, sm: 1.5, md: 1.05 } }}
        >
          {t('dec')}
        </Typography>
      </Grid>
      <Grid size={{ xs: 12, sm: 'grow' }}>
        <CustomNumberField
          id={DEG_ID}
          label={t('degrees')}
          placeholder={PLACEHOLDER}
          name={DEG_NAME}
          value={starDecDms.degrees}
          onChange={handleInputChange}
          intOnly={true}
          min={-90}
          max={90}
          allowOutOfRange={false}
          error={!!decError}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 'grow' }}>
        <CustomNumberField
          id={MIN_ID}
          label={t('minutes')}
          placeholder={PLACEHOLDER}
          name={MIN_NAME}
          value={starDecDms.minutes}
          onChange={handleInputChange}
          intOnly={true}
          min={0}
          max={59}
          allowOutOfRange={false}
          error={!!decError}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 'grow' }}>
        <CustomNumberField
          id={SEC_ID}
          label={t('seconds')}
          placeholder={PLACEHOLDER}
          name={SEC_NAME}
          value={starDecDms.seconds}
          onChange={handleInputChange}
          min={0}
          max={59.999}
          allowOutOfRange={false}
          error={!!decError}
        />
      </Grid>
      {decError && (
        <Grid
          size={12}
          sx={{ mt: -2, mx: { xs: 0, sm: 6, md: 4.8 } }}
        >
          <ErrorHelperText variant="body2">{t(decError)}</ErrorHelperText>
        </Grid>
      )}
    </Grid>
  );
};

export default memo(RadecDecDmsInput);
