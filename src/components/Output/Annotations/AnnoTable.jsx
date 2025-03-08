// src/components/Output/Annotations/AnnoTable.jsx
import React, { useMemo } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { dateTimeToStr, formatTimezone } from '@utils/dateUtils';
import { formatDecimalDegrees } from '@utils/coordUtils';

const redAsterisk = <span style={{ color: 'red' }}>*</span>;

const headStyle = { px: 1.5, textAlign: 'center' };
const cellStyleHead = { px: 1, py: 1.5, textAlign: 'center', fontWeight: 500 };
const cellStyleCenter = { px: 1, py: 1.5, textAlign: 'center' };
const cellStyleRight = { pl: 1.2, pr: 1, py: 1.5, textAlign: 'right' };
const timeMinWidth = '6.2rem';

const stickyStyle = {
  position: 'sticky',
  left: 0,
  backgroundColor: 'white',
  zIndex: 1,
  borderRight: '1px solid rgba(224, 224, 224, 1)',
};

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  // '&:nth-of-type(odd)': {
  //   backgroundColor: theme.palette.action.hover,
  // },
  // Hide last border
  '&:last-child td, &:last-child th': {
    borderBottom: 0,
  },
}));

const AnnoTable = ({ anno }) => {
  const tzStr = useMemo(() => formatTimezone(anno[0].time_zone), [anno]);

  return (
    <>
      <TableContainer component={Paper} sx={{ overflow: 'auto' }}>
        <Table size="small" sx={{ borderCollapse: 'separate' }}>
          <TableHead>
            <TableRow>
              <TableCell rowSpan={2} sx={{ ...headStyle, ...stickyStyle, px: 1.2 }}>Point</TableCell>
              <TableCell rowSpan={2} sx={headStyle}>Altitude</TableCell>
              <TableCell rowSpan={2} sx={headStyle}>Azimuth</TableCell>
              <TableCell colSpan={2} sx={headStyle}>{`Standard Time (${tzStr})`} {redAsterisk}</TableCell>
              <TableCell colSpan={2} sx={headStyle}>Local Mean Time (LMT)</TableCell>
              <TableCell colSpan={2} sx={headStyle}>Universal Time (UT1)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ ...headStyle, minWidth: timeMinWidth }}>Gregorian</TableCell>
              <TableCell sx={{ ...headStyle, minWidth: timeMinWidth }}>Julian</TableCell>
              <TableCell sx={{ ...headStyle, minWidth: timeMinWidth }}>Gregorian</TableCell>
              <TableCell sx={{ ...headStyle, minWidth: timeMinWidth }}>Julian</TableCell>
              <TableCell sx={{ ...headStyle, minWidth: timeMinWidth }}>Gregorian</TableCell>
              <TableCell sx={{ ...headStyle, minWidth: timeMinWidth }}>Julian</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {anno.map((item, index) => (
              <StyledTableRow key={index}>
                <TableCell component="th" scope="row" sx={{ ...cellStyleHead, ...stickyStyle }}>{item.name}</TableCell>
                <TableCell sx={cellStyleRight}>{formatDecimalDegrees(item.alt)}</TableCell>
                <TableCell sx={cellStyleRight}>{formatDecimalDegrees(item.az)}</TableCell>
                <TableCell sx={cellStyleCenter}>{dateTimeToStr({ dateTime: item.time_standard })}</TableCell>
                <TableCell sx={cellStyleCenter}>{dateTimeToStr({ dateTime: item.time_standard_julian })}</TableCell>
                <TableCell sx={cellStyleCenter}>{dateTimeToStr({ dateTime: item.time_local_mean })}</TableCell>
                <TableCell sx={cellStyleCenter}>{dateTimeToStr({ dateTime: item.time_local_mean_julian })}</TableCell>
                <TableCell sx={cellStyleCenter}>{dateTimeToStr({ dateTime: item.time_ut1 })}</TableCell>
                <TableCell sx={cellStyleCenter}>{dateTimeToStr({ dateTime: item.time_ut1_julian })}</TableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'left', mt: 1, ml: 1 }}>
        {redAsterisk} No Daylight Saving Time (DST) adjustments.
      </Typography>
    </>
  );
};

export default React.memo(AnnoTable);
