// src/components/Output/InfoDisplay.js
import React, { useMemo } from 'react';
import { Box, Stack, Grid, Typography } from '@mui/material';
import { formatDateTime, formatDateTimeISO, decimalToHMS, formatHMS } from '../../utils/dateUtils';
import { formatCoordinate, formatDecimalDgrees } from '../../utils/coordUtils';
import CustomDivider from '../UI/CustomDivider';

const capitalize = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const labelStyle = {
  textAlign: 'left',
  fontSize: { xs: 'body2.fontSize', sm: 'body1.fontSize', md: 'body1.fontSize' },
  minWidth: { xs: '4.8rem', sm: '6rem', md: '6rem' },
  fontWeight: 500,
};
const detailStyle = {
  textAlign: 'left',
  fontSize: { xs: 'body2.fontSize', sm: 'body1.fontSize', md: 'body1.fontSize' },
};

const InfoDisplay = ({ info }) => {
  // console.log('Rendering InfoDisplay');
  const latStr = useMemo(() => formatCoordinate(info.lat, 'lat'), [info.lat]);
  const lngStr = useMemo(() => formatCoordinate(info.lng, 'lng'), [info.lng]);

  const dateStrG = useMemo(() => formatDateTime({
    year: parseInt(info.dateG.year),
    month: parseInt(info.dateG.month),
    day: parseInt(info.dateG.day),
    monthFirst: true,
    abbr: false,
  }).date, [info]);

  const dateStrIsoG = useMemo(() => formatDateTimeISO({
    year: parseInt(info.dateG.year),
    month: parseInt(info.dateG.month),
    day: parseInt(info.dateG.day),
  }).date, [info]);


  const dateStrJ = useMemo(() => formatDateTime({
    year: parseInt(info.dateJ.year),
    month: parseInt(info.dateJ.month),
    day: parseInt(info.dateJ.day),
    monthFirst: true,
    abbr: false,
  }).date, [info]);

  const dateStrIsoJ = useMemo(() => formatDateTimeISO({
    year: parseInt(info.dateJ.year),
    month: parseInt(info.dateJ.month),
    day: parseInt(info.dateJ.day),
  }).date, [info]);

  const raStr = useMemo(() => info.ra !== null && info.ra !== undefined ? formatHMS(decimalToHMS(info.ra / 15)) : '', [info.ra]);
  const decStr = useMemo(() => info.dec !== null && info.dec !== undefined ? formatDecimalDgrees(info.dec) : '', [info.dec]);

  // const eqxSolTimeStr = useMemo(() => {
  //   if (EQX_SOL_NAMES.hasOwnProperty(info.flag) && info.eqxSolTime.length === 6) {
  //     return `${EQX_SOL_NAMES[info.flag]}: ${dateTimeToStr({ dateTime: info.eqxSolTime })}`;
  //   } else {
  //     return '';
  //   }
  // }, [info.flag, info.eqxSolTime]);

  const dateInfoItemG = useMemo(() => (
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
  ), [dateStrG, dateStrIsoG]);

  const dateInfoItemJ = useMemo(() => (
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
  ), [dateStrJ, dateStrIsoJ]);

  const locationInfoItem = useMemo(() => (
    <>
      <Box display="flex" alignItems="start" flexWrap="wrap">
        <Typography variant="body1" sx={labelStyle}>
          [Location]
        </Typography>
        <Typography variant="body1" sx={detailStyle}>
          {latStr}/{lngStr}
        </Typography>
      </Box>
    </>
  ), [latStr, lngStr]);

  const starInfoItem = useMemo(() => (
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
            <Typography variant="body1" mr={{ xs: 0.6, sm: 1, md: 1 }} sx={labelStyle}>
              [Hipparchus Catalogue Number]
            </Typography>
            <Typography variant="body1" sx={detailStyle}>
              {info.hip}
            </Typography>
          </Box>
        </>
      ) : raStr && decStr && (
        <Box display="flex" alignItems="start" flexWrap="wrap">
          <Typography variant="body1" sx={labelStyle}>
            [RA/Dec]
          </Typography>
          <Typography variant="body1" sx={detailStyle}>
            {raStr}/{decStr}
          </Typography>
        </Box>
      )}
    </>
  ), [info.name, info.nameZh, info.hip, raStr, decStr]);

  return (
    <Box mt={1}>
      <CustomDivider sx={{ mb: 0.5 }} />
      <Grid container pr={0.5} rowSpacing={0.5} columnSpacing={0} sx={{ maxWidth: '100%', margin: 'auto' }}>
        <Grid item xs={12} sm={12} md="auto">
          <Stack
            direction="column"
            spacing={0.5}
            ml={{ xs: '1.5%', sm: 4, md: (info.name && info.hip) ? 3.5 : 5.5 }}
          >
            {dateInfoItemG}
            {dateInfoItemJ}
            {info.name && info.hip && locationInfoItem}
          </Stack>
        </Grid>

        <Grid item xs={12} sm={12} md="auto">
          <Stack
            direction="column"
            spacing={0.5}
            ml={{ xs: '1.5%', sm: 4, md: (info.name && info.hip) ? 3.5 : 5.5 }}
          >
            {(!info.name || !info.hip) && locationInfoItem}
            {starInfoItem}
          </Stack>
        </Grid>

        {/* {eqxSolTimeStr && (
          <Grid item xs={12} sm={12} md={12}>
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

export default React.memo(InfoDisplay);
