// src/components/Output/AnnoTable.js
import React, { useMemo } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@mui/material';
import { dateTimeToStr, formatTimezone } from '../../utils/dateUtils';
import { formatDecimalDgrees } from '../../utils/coordUtils';

const redAsterisk = <span style={{ color: 'red' }}>*</span>;

const headStyle = { textAlign: 'center' };
const cellStyleHead = { paddingX: 1.5, paddingY: 1.5, textAlign: 'center', fontWeight: 500 };
const cellStyleCenter = { paddingX: 1.5, paddingY: 1.5, textAlign: 'center' };
const cellStyleRight = { paddingX: 1.5, paddingY: 1.5, textAlign: 'right' };
const timeMinWidth = '6.5rem';

const stickyStyle = {
  position: 'sticky',
  left: 0,
  backgroundColor: 'white',
  zIndex: 1,
};

const AnnoTable = ({ anno }) => {
  const tzStr = useMemo(() => formatTimezone(anno[0].time_zone), [anno]);

  return (
    <>
      <TableContainer component={Paper} sx={{ overflow: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell rowSpan={2} sx={{ ...headStyle, ...stickyStyle }}>Point</TableCell>
              <TableCell rowSpan={2} sx={headStyle}>Altitude</TableCell>
              <TableCell rowSpan={2} sx={headStyle}>Azimuth</TableCell>
              <TableCell colSpan={2} sx={headStyle}>{`Standard Time (${tzStr})`} {redAsterisk}</TableCell>
              <TableCell colSpan={2} sx={headStyle}>Universal Time (UT1)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ ...headStyle, minWidth: timeMinWidth }}>Gregorian</TableCell>
              <TableCell sx={{ ...headStyle, minWidth: timeMinWidth }}>Julian</TableCell>
              <TableCell sx={{ ...headStyle, minWidth: timeMinWidth }}>Gregorian</TableCell>
              <TableCell sx={{ ...headStyle, minWidth: timeMinWidth }}>Julian</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {anno.map((item, index) => (
              <TableRow key={index}>
                <TableCell component="th" scope="row" sx={{ ...cellStyleHead, ...stickyStyle }}>{item.name}</TableCell>
                <TableCell sx={cellStyleRight}>{formatDecimalDgrees(item.alt)}</TableCell>
                <TableCell sx={cellStyleRight}>{formatDecimalDgrees(item.az)}</TableCell>
                <TableCell sx={cellStyleCenter}>{dateTimeToStr({ dateTime: item.time_local })}</TableCell>
                <TableCell sx={cellStyleCenter}>{dateTimeToStr({ dateTime: item.time_local_julian })}</TableCell>
                <TableCell sx={cellStyleCenter}>{dateTimeToStr({ dateTime: item.time_ut1 })}</TableCell>
                <TableCell sx={cellStyleCenter}>{dateTimeToStr({ dateTime: item.time_ut1_julian })}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'left', mt: 1, ml: 1 }}>
        {redAsterisk} Daylight Saving Time not included.
      </Typography>
    </>
  );
};

export default React.memo(AnnoTable);
