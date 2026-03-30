// src/components/Output/InfoDisplay.jsx
import { memo, useMemo } from 'react';
import { Grid, Box, Stack, Typography } from '@mui/material';
import { useHome } from '@context/HomeContext';
import { formatDatetime, formatDatetimeIso } from '@utils/dateUtils';
import { formatCoordinate, formatDecimalDegrees } from '@utils/coordUtils';
import { formatDecimalHours } from '@utils/dateUtils';
import { LATITUDE, LONGITUDE } from '@utils/constants';
import { capitalize } from '@utils/outputUtils';
import CustomDivider from '@components/UI/CustomDivider';

const labelStyle = {
  textAlign: 'left',
  fontSize: {
    xs: 'body2.fontSize',
    sm: 'body1.fontSize',
    md: 'body1.fontSize',
  },
  minWidth: { xs: '4.8rem', sm: '6rem', md: '6rem' },
  fontWeight: 500,
};
const detailStyle = {
  textAlign: 'left',
  fontSize: {
    xs: 'body2.fontSize',
    sm: 'body1.fontSize',
    md: 'body1.fontSize',
  },
};

/**
 * Formats RA/Dec in decimal degrees into `'{raHms}/{decDms}'`.
 * @param {number | null | undefined} ra
 * @param {number | null | undefined} dec
 * @returns
 */
const radecToStr = (ra, dec) => {
  if (ra !== null && ra !== undefined && dec !== null && dec !== undefined) {
    return `${formatDecimalHours(ra / 15, 3)}/${formatDecimalDegrees(dec, 3)}`;
  } else {
    return '';
  }
};

const InfoDisplay = () => {
  // console.log('Rendering InfoDisplay');
  const { info } = useHome();

  const dateStrG = useMemo(
    () =>
      formatDatetime({ datetime: info.dateG, monthFirst: true, abbr: false })
        .date,
    [info],
  );

  const dateStrIsoG = useMemo(() => formatDatetimeIso(info.dateG).date, [info]);

  const dateStrJ = useMemo(
    () =>
      formatDatetime({ datetime: info.dateJ, monthFirst: true, abbr: false })
        .date,
    [info],
  );

  const dateStrIsoJ = useMemo(() => formatDatetimeIso(info.dateJ).date, [info]);

  const radecStr = useMemo(
    () => radecToStr(info.ra, info.dec),
    [info.ra, info.dec],
  );

  // const eqxSolTimeStr = useMemo(() => {
  //   if (EQX_SOL_NAMES.hasOwnProperty(info.flag) && info.eqxSolTime.length === 6) {
  //     return `${EQX_SOL_NAMES[info.flag]}: ${datetimeToStr({ datetimeArr: info.eqxSolTime })}`;
  //   } else {
  //     return '';
  //   }
  // }, [info.flag, info.eqxSolTime]);

  const dateInfoItemG = useMemo(
    () => (
      <>
        <Box display="flex" alignItems="start" flexWrap="wrap">
          <Typography variant="body1" sx={labelStyle}>
            [Gregorian]
          </Typography>
          <Typography variant="body1" sx={detailStyle}>
            {dateStrIsoG} ({dateStrG})
          </Typography>
        </Box>
      </>
    ),
    [dateStrG, dateStrIsoG],
  );

  const dateInfoItemJ = useMemo(
    () => (
      <>
        <Box display="flex" alignItems="start" flexWrap="wrap">
          <Typography variant="body1" sx={labelStyle}>
            [Julian]
          </Typography>
          <Typography variant="body1" sx={detailStyle}>
            {dateStrIsoJ} ({dateStrJ})
          </Typography>
        </Box>
      </>
    ),
    [dateStrJ, dateStrIsoJ],
  );

  const locationInfoItem = useMemo(
    () => (
      <>
        <Box display="flex" alignItems="start" flexWrap="wrap">
          <Typography variant="body1" sx={labelStyle}>
            [Location]
          </Typography>
          <Typography variant="body1" sx={detailStyle}>
            {formatCoordinate(info.lat, LATITUDE)}/
            {formatCoordinate(info.lng, LONGITUDE)}
          </Typography>
        </Box>
      </>
    ),
    [info],
  );

  const starInfoItem = useMemo(
    () => (
      <>
        {info.name && !info.hip ? (
          <Box display="flex" alignItems="start" flexWrap="wrap">
            <Typography variant="body1" sx={labelStyle}>
              [Planet]
            </Typography>
            <Typography variant="body1" sx={detailStyle}>
              {capitalize(info.name)}
            </Typography>
          </Box>
        ) : info.hip ? (
          <>
            {(info.name || info.nameZh) && (
              <Box display="flex" alignItems="start" flexWrap="wrap">
                <Typography variant="body1" sx={labelStyle}>
                  [Star Name]
                </Typography>
                <Stack direction="column" spacing={0.5}>
                  {info.name && (
                    <Typography variant="body1" sx={detailStyle}>
                      {info.name}
                    </Typography>
                  )}
                  {info.nameZh && (
                    <Typography variant="body1" sx={detailStyle}>
                      {info.nameZh}
                    </Typography>
                  )}
                </Stack>
              </Box>
            )}
            <Box display="flex" alignItems="start" flexWrap="wrap">
              <Typography
                variant="body1"
                mr={{ xs: 0.6, sm: 1, md: 1 }}
                sx={labelStyle}
              >
                [Hipparcos Catalogue Number]
              </Typography>
              <Typography variant="body1" sx={detailStyle}>
                {info.hip}
              </Typography>
            </Box>
          </>
        ) : (
          radecStr && (
            <Box display="flex" alignItems="start" flexWrap="wrap">
              <Typography variant="body1" sx={labelStyle}>
                [RA/Dec]
              </Typography>
              <Typography variant="body1" sx={detailStyle}>
                {radecStr}
              </Typography>
            </Box>
          )
        )}
      </>
    ),
    [info.name, info.nameZh, info.hip, radecStr],
  );

  return (
    <Box sx={{ mt: 1 }}>
      <CustomDivider sx={{ mb: 1 }} />
      <Grid
        container
        rowSpacing={0.5}
        columnSpacing={0}
        sx={{ m: 'auto', pr: 0.5 }}
      >
        <Grid size={{ xs: 12, sm: 12, md: 'auto' }}>
          <Stack
            direction="column"
            spacing={0.5}
            ml={{ xs: '1.5%', sm: 4, md: info.name && info.hip ? 4.5 : 6 }}
          >
            {dateInfoItemG}
            {dateInfoItemJ}
            {info.name && info.hip && locationInfoItem}
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, sm: 12, md: 'auto' }}>
          <Stack
            direction="column"
            spacing={0.5}
            ml={{ xs: '1.5%', sm: 4, md: info.name && info.hip ? 4.5 : 6 }}
          >
            {(!info.name || !info.hip) && locationInfoItem}
            {starInfoItem}
          </Stack>
        </Grid>

        {/* {eqxSolTimeStr && (
          <Grid size={{ xs: 12, sm: 12, md: 12 }}>
            <Typography variant="subtitle1" sx={detailStyle}>
              {eqxSolTimeStr}
            </Typography>
          </Grid>
        )} */}
      </Grid>
      <CustomDivider />
    </Box>
  );
};

export default memo(InfoDisplay);
