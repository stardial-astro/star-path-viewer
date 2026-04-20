// src/components/output/annotations/DownloadAnnoTable.jsx
import { memo, useMemo, useCallback } from 'react';
import { Stack, Button } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { saveAs } from 'file-saver';
import { useHome } from '@context/HomeContext';
import { datetimeToStr, formatTimezone } from '@utils/dateUtils';
import { formatDecimalDegrees } from '@utils/coordUtils';
import * as XLSX from 'xlsx';

const TABLE_HEAD = {
  point: 'Point',
  alt: 'Altitude',
  az: 'Azimuth',
  stG: 'Standard Time (Gregorian)',
  stJ: 'Standard Time (Julian)',
  lmtG: 'Local Mean Time (Gregorian)',
  lmtJ: 'Local Mean Time (Julian)',
  ut1G: 'UT1 (Gregorian)',
  ut1J: 'UT1 (Julian)',
};

const CSV_FMT = 'csv';
const JSON_FMT = 'json';
const XLSX_FMT = 'xlsx';

/**
 * Prints the export error.
 * @param {string} type
 * @param {*} err
 */
const printExportError = (type, err) =>
  console.error(
    `Unable to export ${type}: ${Error.isError(err) ? err.message : err}`,
  );

/** @param {AnnoItem[]} anno */
const annoToJson = (anno) => {
  const suffixZ = true; // replace '+00:00' with 'Z'
  const offsetStr = formatTimezone(anno[0].time_zone, suffixZ);
  const delim = 'T';
  return anno.map((item) => ({
    [TABLE_HEAD.point]: item.name,
    [TABLE_HEAD.alt]: formatDecimalDegrees(item.alt).replace(/°/g, '\u00B0'),
    [TABLE_HEAD.az]: formatDecimalDegrees(item.az).replace(/°/g, '\u00B0'),
    [TABLE_HEAD.stG]: `${datetimeToStr({ datetimeArr: item.time_standard, delim })}${offsetStr}`,
    [TABLE_HEAD.stJ]: `${datetimeToStr({ datetimeArr: item.time_standard_julian, delim })}${offsetStr}`,
    [TABLE_HEAD.lmtG]: `${datetimeToStr({ datetimeArr: item.time_local_mean, delim })}`,
    [TABLE_HEAD.lmtJ]: `${datetimeToStr({ datetimeArr: item.time_local_mean_julian, delim })}`,
    [TABLE_HEAD.ut1G]: datetimeToStr({ datetimeArr: item.time_ut1, delim }),
    [TABLE_HEAD.ut1J]: datetimeToStr({
      datetimeArr: item.time_ut1_julian,
      delim,
    }),
  }));
};

/** @param {Record<string, string>[]} annoJson */
const annoJsonToCsv = (annoJson) => {
  const csvContent = [
    /* Table head (same as values in TABLE_HEAD) */
    Object.keys(annoJson[0]),
    /* Rows (quote if needed) */
    ...annoJson.map((r) =>
      Object.entries(r).map(([c, v]) => {
        if (c === TABLE_HEAD.alt || c === TABLE_HEAD.az) {
          return `"${v.replace(/"/g, '""')}"`; // quote and escape quotes
        }
        return v;
      }),
    ),
  ];
  /* Join columns */
  return csvContent.map((c) => c.join(',')).join('\n') + '\n';
};

/**
 * @param {object} params
 * @param {AnnoItem[]} params.anno - Filtered annotations.
 * @param {string} params.filenameBase - Filename base.
 */
const DownloadAnnoTable = ({ anno, filenameBase }) => {
  const { setErrorMessage } = useHome();

  /** @type {Record<string, string>[]} */
  const annoJson = useMemo(() => annoToJson(anno), [anno]);

  /** @type {(format: string) => void} */
  const handleDownload = useCallback(
    (format) => {
      const filename = `${filenameBase}.${format}`;

      if (format === CSV_FMT) {
        /* Export CSV ----------------------------------------------- */
        try {
          const csvString = annoJsonToCsv(annoJson);
          /* Add BOM (UTF-8 BOM) */
          const csvWithBom = '\uFEFF' + csvString;
          const blob = new Blob([csvWithBom], {
            type: 'text/csv;charset=utf-8;',
          });
          saveAs(blob, filename);
        } catch (err) {
          printExportError('CSV', err);
          setErrorMessage((prev) => ({
            ...prev,
            download: 'errors:table_csv_error', // i18n key
          }));
        }
      } else if (format === JSON_FMT) {
        /* Export JSON ---------------------------------------------- */
        try {
          const jsonContent = JSON.stringify(annoJson, null, 2) + '\n';
          const blob = new Blob([jsonContent], {
            type: 'application/json;charset=utf-8;',
          });
          saveAs(blob, filename);
        } catch (err) {
          printExportError('JSON', err);
          setErrorMessage((prev) => ({
            ...prev,
            download: 'errors:table_json_error', // i18n key
          }));
        }
      } else if (format === XLSX_FMT) {
        /* Export XLSX ---------------------------------------------- */
        try {
          const worksheet = XLSX.utils.json_to_sheet(annoJson);
          const workbook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(workbook, worksheet, 'Annotations');
          XLSX.writeFile(workbook, filename);
        } catch (err) {
          printExportError('XLSX', err);
          setErrorMessage((prev) => ({
            ...prev,
            download: 'errors:table_xlsx_error', // i18n key
          }));
        }
      }
    },
    [annoJson, filenameBase, setErrorMessage],
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
