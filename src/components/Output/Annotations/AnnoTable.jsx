// src/components/Output/Annotations/AnnoTable.jsx
import { memo } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from '@mui/material';
import { styled, lighten } from '@mui/material/styles';
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
 */
const AnnoTable = ({ anno }) => {
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
                Point
              </StyledStickyColumn>
              <StyledHeadCell rowSpan={2}>Altitude</StyledHeadCell>
              <StyledHeadCell rowSpan={2}>Azimuth</StyledHeadCell>
              <StyledHeadCell colSpan={2}>
                {`Standard Time (${tzStr})`} {redAsterisk}
              </StyledHeadCell>
              <StyledHeadCell colSpan={2}>Local Mean Time (LMT)</StyledHeadCell>
              <StyledHeadCell colSpan={2}>Universal Time (UT1)</StyledHeadCell>
            </TableRow>
            <TableRow>
              <StyledHeadCell sx={dateColumnStyle}>Gregorian</StyledHeadCell>
              <StyledHeadCell sx={dateColumnStyle}>Julian</StyledHeadCell>
              <StyledHeadCell sx={dateColumnStyle}>Gregorian</StyledHeadCell>
              <StyledHeadCell sx={dateColumnStyle}>Julian</StyledHeadCell>
              <StyledHeadCell sx={dateColumnStyle}>Gregorian</StyledHeadCell>
              <StyledHeadCell sx={dateColumnStyle}>Julian</StyledHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {anno.map((item, index) => (
              <StyledRow key={index}>
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
        {redAsterisk} No Daylight Saving Time (DST) adjustments.
      </Typography>
    </>
  );
};

export default memo(AnnoTable);
