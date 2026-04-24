// src/components/output/annotations/AnnoTable.jsx
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme, styled, lighten } from '@mui/material/styles';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Tooltip,
} from '@mui/material';
import isMobile from '@utils/isMobile';
import { datetimeToStr, formatTimezone } from '@utils/dateUtils';
import { formatDecimalDegrees } from '@utils/coordUtils';

const footnoteStyle = {
  color: 'text.secondary',
  mt: 1,
  ml: 1,
};

const dateColumnStyle = { minWidth: '6.2rem' };

const StyledHeadCell = styled(TableCell)(() => ({
  textAlign: 'center',
  paddingLeft: '12px',
  paddingRight: '12px',
}));

const StyledCenterAlignCell = styled(TableCell)(() => ({
  textAlign: 'center',
  paddingLeft: '8px',
  paddingRight: '8px',
  paddingTop: '12px',
  paddingBottom: '12px',
}));

const StyledRightAlignCell = styled(TableCell)(() => ({
  textAlign: 'right',
  paddingLeft: '9.6px',
  paddingRight: '8px',
  paddingTop: '12px',
  paddingBottom: '12px',
}));

const StyledStickyColumn = styled(TableCell)(({ theme }) => ({
  position: 'sticky',
  left: 0,
  textAlign: 'center',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  backgroundColor: lighten(theme.palette.background.paper, 0.1),
  borderRight: `1px solid ${theme.palette.action.disabledBackground}`,
  zIndex: 1,
}));

const StyledRow = styled(TableRow)(() => ({
  // '&:nth-of-type(odd)': {
  //   backgroundColor: theme.palette.action.hover,
  // },
  /* Hide last border */
  '&:last-child td, &:last-child th': {
    borderBottom: 0,
  },
}));

/**
 * @param {object} params
 * @param {AnnoItem[]} params.anno - Filtered annotations.
 * @param {string} [params.tzname]
 */
const AnnoTable = ({ anno, tzname }) => {
  const { t } = useTranslation('output');
  const theme = useTheme();
  const redAsterisk = (
    <span style={{ color: theme.palette.error.main }}>*</span>
  );
  const tzStr = formatTimezone(anno[0].time_zone);

  return (
    <>
      <TableContainer
        component={Paper}
        sx={{ overflow: 'auto', colorScheme: theme.palette.mode }}
      >
        <Table size="small" sx={{ borderCollapse: 'separate' }}>
          <TableHead>
            <TableRow>
              <StyledStickyColumn
                rowSpan={2}
                sx={{
                  px: 1.2,
                }}
              >
                {t('point')}
              </StyledStickyColumn>
              <StyledHeadCell rowSpan={2}>{t('altitude')}</StyledHeadCell>
              <StyledHeadCell rowSpan={2}>{t('azimuth')}</StyledHeadCell>
              <StyledHeadCell colSpan={2}>
                <Tooltip
                  describeChild
                  followCursor={!isMobile}
                  title={tzname || ''}
                  placement="top"
                  disableHoverListener={isMobile}
                  enterTouchDelay={500}
                  leaveTouchDelay={1000}
                >
                  <span>
                    {`${t('standard_time')} (${tzStr})`} {redAsterisk}
                  </span>
                </Tooltip>
              </StyledHeadCell>
              <StyledHeadCell colSpan={2}>{t('lmt')}</StyledHeadCell>
              <StyledHeadCell colSpan={2}>{t('ut1')}</StyledHeadCell>
            </TableRow>
            <TableRow>
              <StyledHeadCell sx={dateColumnStyle}>
                {t('gregorian')}
              </StyledHeadCell>
              <StyledHeadCell sx={dateColumnStyle}>
                {t('julian')}
              </StyledHeadCell>
              <StyledHeadCell sx={dateColumnStyle}>
                {t('gregorian')}
              </StyledHeadCell>
              <StyledHeadCell sx={dateColumnStyle}>
                {t('julian')}
              </StyledHeadCell>
              <StyledHeadCell sx={dateColumnStyle}>
                {t('gregorian')}
              </StyledHeadCell>
              <StyledHeadCell sx={dateColumnStyle}>
                {t('julian')}
              </StyledHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(anno).map(([key, item]) => (
              <StyledRow key={key}>
                <StyledStickyColumn
                  component="th"
                  scope="row"
                  sx={{ px: 1, py: 1.5, fontWeight: 500 }}
                >
                  {item.name}
                </StyledStickyColumn>
                <StyledRightAlignCell>
                  {formatDecimalDegrees(item.alt)}
                </StyledRightAlignCell>
                <StyledRightAlignCell>
                  {formatDecimalDegrees(item.az)}
                </StyledRightAlignCell>
                <StyledCenterAlignCell>
                  {datetimeToStr({ datetimeArr: item.time_standard })}
                </StyledCenterAlignCell>
                <StyledCenterAlignCell>
                  {datetimeToStr({ datetimeArr: item.time_standard_julian })}
                </StyledCenterAlignCell>
                <StyledCenterAlignCell>
                  {datetimeToStr({ datetimeArr: item.time_local_mean })}
                </StyledCenterAlignCell>
                <StyledCenterAlignCell>
                  {datetimeToStr({ datetimeArr: item.time_local_mean_julian })}
                </StyledCenterAlignCell>
                <StyledCenterAlignCell>
                  {datetimeToStr({ datetimeArr: item.time_ut1 })}
                </StyledCenterAlignCell>
                <StyledCenterAlignCell>
                  {datetimeToStr({ datetimeArr: item.time_ut1_julian })}
                </StyledCenterAlignCell>
              </StyledRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="body2" align="left" sx={footnoteStyle}>
        {redAsterisk}
        {' ' + t('no_dst')}
      </Typography>
    </>
  );
};

export default memo(AnnoTable);
