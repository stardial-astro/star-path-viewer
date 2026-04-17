// src/components/output/InfoDisplay.jsx
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Grid, Box, Stack, Typography } from '@mui/material';
import { useHome } from '@context/HomeContext';
import {
  formatDecimalHours,
  formatDatetime,
  formatDatetimeIso,
} from '@utils/dateUtils';
import { formatCoordinate, formatDecimalDegrees } from '@utils/coordUtils';
import { joinNameZh } from '@utils/starInputUtils';
import { LATITUDE, LONGITUDE, CC_HANT_CODES } from '@utils/constants';
import CustomDivider from '@components/ui/CustomDivider';

const FRAC_DIGITS = 3;

const itemStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'start',
};

const nameItemStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  columnGap: '0.5em',
  justifyContent: 'start',
  maxWidth: { md: 320 },
};

const labelStyle = (mdMinWidth = '') => ({
  fontSize: {
    xs: 'body2.fontSize',
    sm: 'body1.fontSize',
    md: 'body1.fontSize',
  },
  minWidth: {
    xs: '5.1rem',
    sm: '6rem',
    md: mdMinWidth ? mdMinWidth : '6rem',
  },
  fontWeight: 500,
});

const detailStyle = {
  fontSize: {
    xs: 'body2.fontSize',
    sm: 'body1.fontSize',
    md: 'body1.fontSize',
  },
};

// /** @param {string} s */
// const quoteToPrime = (s) => s.replaceAll("'", '′').replaceAll('"', '″');

/**
 * Formats RA/Dec in decimal degrees into `'{raHms}/{decDms}'`.
 * @param {number | null | undefined} ra
 * @param {number | null | undefined} dec
 * @returns
 */
const radecToStr = (ra, dec) => {
  if (ra !== null && ra !== undefined && dec !== null && dec !== undefined) {
    return (
      formatDecimalHours(ra / 15, FRAC_DIGITS) +
      '/' +
      formatDecimalDegrees(dec, FRAC_DIGITS)
    );
  } else {
    return '';
  }
};

/**
 * Formats lat/lng in decimal degrees into `'{lat}/{lng}'`.
 * @param {number} lat
 * @param {number} lng
 * @returns
 */
const coordsToStr = (lat, lng) => {
  return (
    formatCoordinate(lat, LATITUDE) + '/' + formatCoordinate(lng, LONGITUDE)
  );
};

const InfoDisplay = () => {
  // console.log('Rendering InfoDisplay');
  const { i18n, t } = useTranslation('output');
  const langCode = i18n.resolvedLanguage || i18n.language;
  const isZh = i18n.language.startsWith('zh');
  const isZhHant = CC_HANT_CODES.includes(i18n.language);
  const { info } = useHome();

  const radecStr = useMemo(
    () => radecToStr(info.ra, info.dec),
    [info.ra, info.dec],
  );

  const dateInfoItems = useMemo(() => {
    const dateStrG = formatDatetime({
      datetime: info.dateG,
      abbr: false,
      langCode,
    }).date;
    const dateStrJ = formatDatetime({
      datetime: info.dateJ,
      abbr: false,
      langCode,
    }).date;
    const dateStrIsoG = formatDatetimeIso(info.dateG).date;
    const dateStrIsoJ = formatDatetimeIso(info.dateJ).date;
    return (
      <>
        <Box sx={itemStyle}>
          <Typography variant="body1" align="left" sx={labelStyle()}>
            [{t('gregorian')}]
          </Typography>
          <Typography variant="body1" align="left" sx={detailStyle}>
            {dateStrIsoG} ({dateStrG})
          </Typography>
        </Box>
        <Box sx={itemStyle}>
          <Typography variant="body1" align="left" sx={labelStyle()}>
            [{t('julian')}]
          </Typography>
          <Typography variant="body1" align="left" sx={detailStyle}>
            {dateStrIsoJ} ({dateStrJ})
          </Typography>
        </Box>
      </>
    );
  }, [info, langCode, t]);

  const locationInfoItem = useMemo(
    () => (
      <>
        <Box sx={itemStyle}>
          <Typography variant="body1" align="left" sx={labelStyle()}>
            [{t('location')}]
          </Typography>
          <Typography variant="body1" align="left" sx={detailStyle}>
            {coordsToStr(info.lat, info.lng)}
          </Typography>
        </Box>
      </>
    ),
    [info, t],
  );

  const starInfoItem = useMemo(
    () => (
      <>
        {info.name && !info.hip ? (
          <Box sx={itemStyle}>
            <Typography variant="body1" align="left" sx={labelStyle()}>
              [{t('planet')}]
            </Typography>
            <Typography variant="body1" align="left" sx={detailStyle}>
              {t('common:' + info.name)}
            </Typography>
          </Box>
        ) : info.hip ? (
          <>
            {(info.name || info.nameZh?.zh) && (
              <Box sx={itemStyle}>
                <Typography
                  variant="body1"
                  align="left"
                  sx={labelStyle(isZh ? '5.4rem' : '6.2rem')}
                >
                  [{t('star_name')}]
                </Typography>
                <Box sx={nameItemStyle}>
                  <Typography variant="body1" align="left" sx={detailStyle}>
                    {info.name}
                    {info.nameZh?.zh
                      ? (info.name ? ', ' : '') +
                        joinNameZh(info.nameZh, isZhHant)
                      : ''}
                  </Typography>
                </Box>
              </Box>
            )}
            <Box sx={itemStyle}>
              <Typography
                variant="body1"
                align="left"
                mr={{ xs: 0.8, sm: 1.5, md: 1.5 }}
                sx={labelStyle()}
              >
                [{t('hip')}]
              </Typography>
              <Typography variant="body1" align="left" sx={detailStyle}>
                {info.hip}
              </Typography>
            </Box>
          </>
        ) : (
          radecStr && (
            <Box sx={itemStyle}>
              <Typography variant="body1" align="left" sx={labelStyle()}>
                [{t('radec')}]
              </Typography>
              <Typography variant="body1" align="left" sx={detailStyle}>
                {radecStr}
              </Typography>
            </Box>
          )
        )}
      </>
    ),
    [info.name, info.nameZh, info.hip, radecStr, isZh, isZhHant, t],
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
            {dateInfoItems}
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
      </Grid>
      <CustomDivider />
    </Box>
  );
};

export default memo(InfoDisplay);
