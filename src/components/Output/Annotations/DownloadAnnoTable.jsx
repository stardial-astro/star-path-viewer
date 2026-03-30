// src/components/Output/Annotations/DownloadAnnoTable.jsx
import { memo, useMemo, useCallback } from 'react';
import { Stack, Button } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { saveAs } from 'file-saver';
import { useHome } from '@context/HomeContext';
import { datetimeToStr, formatTimezone } from '@utils/dateUtils';
import { formatDecimalDegrees } from '@utils/coordUtils';
import * as XLSX from 'xlsx';

const CSV_FMT = 'csv';
const JSON_FMT = 'json';
const XLSX_FMT = 'xlsx';

/**
 * @param {object} params
 * @param {AnnoItem[]} params.anno - Filtered annotations.
 * @param {string} params.filenameBase - Filename base.
 */
const DownloadAnnoTable = ({ anno, filenameBase }) => {
  const { setErrorMessage } = useHome();

  const offsetStr = useMemo(() => formatTimezone(anno[0].time_zone), [anno]);

  const annoExport = useMemo(
    () =>
      anno.map((item) => ({
        name: item.name,
        alt: formatDecimalDegrees(item.alt).replace(/°/g, '\u00B0'),
        az: formatDecimalDegrees(item.az).replace(/°/g, '\u00B0'),
        time_standard: `${datetimeToStr({ datetimeArr: item.time_standard })} UT1${offsetStr}`,
        time_standard_julian: `${datetimeToStr({ datetimeArr: item.time_standard_julian })} UT1${offsetStr}`,
        time_local_mean: `${datetimeToStr({ datetimeArr: item.time_local_mean })}`,
        time_local_mean_julian: `${datetimeToStr({ datetimeArr: item.time_local_mean_julian })}`,
        time_ut1: datetimeToStr({ datetimeArr: item.time_ut1 }),
        time_ut1_julian: datetimeToStr({ datetimeArr: item.time_ut1_julian }),
      })),
    [anno, offsetStr],
  );

  /** @type {(format: string) => void} */
  const handleDownload = useCallback(
    (format) => {
      const filename = `${filenameBase}.${format}`;

      if (format === CSV_FMT) {
        /* Export CSV ----------------------------------------------- */
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
              'UT1 (Julian)',
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
            ]),
          ];
          const csvString =
            csvContent.map((e) => e.join(',')).join('\n') + '\n';
          /* Add BOM (UTF-8 BOM) */
          const csvWithBom = '\uFEFF' + csvString;
          const blob = new Blob([csvWithBom], {
            type: 'text/csv;charset=utf-8;',
          });
          saveAs(blob, filename);
        } catch (err) {
          console.error(
            'Unable to export CSV:',
            Error.isError(err) ? err.message : err,
          );
          setErrorMessage((prev) => ({
            ...prev,
            download: 'Unable to generate CSV table.',
          }));
        }
      } else if (format === JSON_FMT) {
        /* Export JSON ---------------------------------------------- */
        try {
          const jsonContent =
            JSON.stringify(
              annoExport.map((item) => ({
                Point: item.name,
                Altitude: item.alt,
                Azimuth: item.az,
                'Standard Time (Gregorian)': item.time_standard,
                'Standard Time (Julian)': item.time_standard_julian,
                'Local Mean Time (Gregorian)': item.time_local_mean,
                'Local Mean Time (Julian)': item.time_local_mean_julian,
                'UT1 (Gregorian)': item.time_ut1,
                'UT1 (Julian)': item.time_ut1_julian,
              })),
              null,
              2,
            ) + '\n';
          const blob = new Blob([jsonContent], {
            type: 'application/json;charset=utf-8;',
          });
          saveAs(blob, filename);
        } catch (err) {
          console.error(
            'Unable to export JSON:',
            Error.isError(err) ? err.message : err,
          );
          setErrorMessage((prev) => ({
            ...prev,
            download: 'Unable to generate JSON file.',
          }));
        }
      } else if (format === XLSX_FMT) {
        /* Export XLSX ---------------------------------------------- */
        try {
          const worksheet = XLSX.utils.json_to_sheet(
            annoExport.map((item) => ({
              Point: item.name,
              Altitude: item.alt,
              Azimuth: item.az,
              'Standard Time (Gregorian)': item.time_standard,
              'Standard Time (Julian)': item.time_standard_julian,
              'Local Mean Time (Gregorian)': item.time_local_mean,
              'Local Mean Time (Julian)': item.time_local_mean_julian,
              'UT1 (Gregorian)': item.time_ut1,
              'UT1 (Julian)': item.time_ut1_julian,
            })),
          );
          const workbook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(workbook, worksheet, 'Annotations');
          XLSX.writeFile(workbook, filename);
        } catch (err) {
          console.error(
            'Unable to export XLSX:',
            Error.isError(err) ? err.message : err,
          );
          setErrorMessage((prev) => ({
            ...prev,
            download: 'Unable to generate XLSX table.',
          }));
        }
      }
    },
    [annoExport, filenameBase, setErrorMessage],
  );

  return (
    <Stack
      direction="row"
      spacing={{ xs: 2, sm: 3, md: 4 }}
      justifyContent="center"
    >
      {[CSV_FMT, JSON_FMT, XLSX_FMT].map((format) => (
        <Button
          aria-label={format}
          variant="contained"
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

export default memo(DownloadAnnoTable);
