// src/components/Output/Annotations/DownloadAnnoTable.jsx
import React, { useMemo, useCallback } from 'react';
import { Stack, Button } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { saveAs } from 'file-saver';
import { dateTimeToStr, formatTimezone } from '@utils/dateUtils';
import { formatDecimalDegrees } from '@utils/coordUtils';
import * as XLSX from 'xlsx';

const DownloadAnnoTable = ({ anno, filenameBase, setErrorMessage }) => {
  const offsetStr = useMemo(() => formatTimezone(anno[0].time_zone), [anno]);

  const annoExport = useMemo(() => anno.map((item) => ({
    name: item.name,
    alt: formatDecimalDegrees(item.alt).replace(/°/g, '\u00B0'),
    az: formatDecimalDegrees(item.az).replace(/°/g, '\u00B0'),
    time_standard: `${dateTimeToStr({ dateTime: item.time_standard })} UT1${offsetStr}`,
    time_standard_julian: `${dateTimeToStr({ dateTime: item.time_standard_julian })} UT1${offsetStr}`,
    time_local_mean: `${dateTimeToStr({ dateTime: item.time_local_mean })}`,
    time_local_mean_julian: `${dateTimeToStr({ dateTime: item.time_local_mean_julian })}`,
    time_ut1: dateTimeToStr({ dateTime: item.time_ut1 }),
    time_ut1_julian: dateTimeToStr({ dateTime: item.time_ut1_julian }),
  })), [anno, offsetStr]);

  const handleDownload = useCallback((format) => {
    const filename = `${filenameBase}.${format}`;

    /* ---------------------------------------------------------------------- */
    if (format === 'csv') {
      try {
        const csvContent = [
          [
            'Point',
            'Altitude',
            'Azimuth',
            'Standard Time (Gregorian)',
            'Standard Time (Julian)',
            'Local Mean Time (Gregorian)',
            'Local Mean Time (Julian)',
            'UT1 (Gregorian)',
            'UT1 (Julian)'
          ],
          ...annoExport.map((item) => [
            item.name,
            `"${item.alt.replace(/"/g, '""')}"`,
            `"${item.az.replace(/"/g, '""')}"`,
            item.time_standard,
            item.time_standard_julian,
            item.time_local_mean,
            item.time_local_mean_julian,
            item.time_ut1,
            item.time_ut1_julian,
          ])
        ];
        const csvString = csvContent.map(e => e.join(',')).join('\n') + '\n';
        /* Add BOM (UTF-8 BOM) */
        const csvWithBom = '\uFEFF' + csvString;
        const blob = new Blob([csvWithBom], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, filename);
      } catch (error) {
        setErrorMessage((prev) => ({ ...prev, download: 'Failed to generate CSV for the table.' }));
      }
    }
    /* ---------------------------------------------------------------------- */
    else if (format === 'json') {
      try {
        const jsonContent = JSON.stringify(annoExport.map((item) => ({
          Point: item.name,
          Altitude: item.alt,
          Azimuth: item.az,
          'Standard Time (Gregorian)': item.time_standard,
          'Standard Time (Julian)': item.time_standard_julian,
          'Local Mean Time (Gregorian)': item.time_local_mean,
          'Local Mean Time (Julian)': item.time_local_mean_julian,
          'UT1 (Gregorian)': item.time_ut1,
          'UT1 (Julian)': item.time_ut1_julian,
        })), null, 2) + '\n';
        const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
        saveAs(blob, filename);
      } catch (error) {
        setErrorMessage((prev) => ({ ...prev, download: 'Failed to generate JSON for the table.' }));
      }
    }
    /* ---------------------------------------------------------------------- */
    else if (format === 'xlsx') {
      try {
        const worksheet = XLSX.utils.json_to_sheet(annoExport.map(item => ({
          Point: item.name,
          Altitude: item.alt,
          Azimuth: item.az,
          'Standard Time (Gregorian)': item.time_standard,
          'Standard Time (Julian)': item.time_standard_julian,
          'Local Mean Time (Gregorian)': item.time_local_mean,
          'Local Mean Time (Julian)': item.time_local_mean_julian,
          'UT1 (Gregorian)': item.time_ut1,
          'UT1 (Julian)': item.time_ut1_julian,
        })));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Annotations');
        XLSX.writeFile(workbook, filename);
      } catch (error) {
        setErrorMessage((prev) => ({ ...prev, download: 'Failed to generate XLSX for the table.' }));
      }
    }
    /* ---------------------------------------------------------------------- */
  }, [annoExport, filenameBase, setErrorMessage]);

  return (
    <Stack direction='row' spacing={{ xs: 2, sm: 3, md: 4 }} justifyContent='center'>
      {['csv', 'json', 'xlsx'].map((format) => (
        <Button
          variant="contained"
          aria-label={format}
          key={format}
          onClick={() => handleDownload(format)}
          startIcon={<DownloadIcon />}
          sx={{ minWidth: '15%', py: { xs: 0.55, sm: 0.75 } }}
        >
          {format.toUpperCase()}
        </Button>
      ))}
    </Stack>
  );
};

export default React.memo(DownloadAnnoTable);
