// src/components/output/image/DownloadImage.jsx
import { memo, useEffect, useRef, useMemo, useCallback } from 'react';
import { Stack, Button } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { saveAs } from 'file-saver';
// import { Canvg } from 'canvg';
// import { jsPDF } from 'jspdf';
// import 'svg2pdf.js';
import { useHome } from '@context/HomeContext';
import { formatDatetimeIso } from '@utils/dateUtils';
import { capitalize } from '@utils/outputUtils';

const FRAC_DIGITS = 3;

const SVG_FMT = 'svg';
const PNG_FMT = 'png';
const PDF_FMT = 'pdf';

/**
 * Constructs metadata for SVG and PDF.
 * - `location`: lat/lng (3 fraction digits)
 * - `date`: ISO format in Gregorian calendar
 * - `star`: name, HIP, or RA/Dec (3 fraction digits)
 * @param {InfoObj} info
 */
const constructMetadata = (info) => {
  const locationStr =
    'Location (lat/lng): ' +
    info.lat.toFixed(FRAC_DIGITS) +
    '/' +
    info.lng.toFixed(FRAC_DIGITS);
  const dateStrIsoG =
    'Date (Gregorian): ' +
    formatDatetimeIso({
      year: info.dateG.year,
      month: info.dateG.month,
      day: info.dateG.day,
    }).date;
  const starStr =
    'Celestial Object' +
    ((info.name && !info.hip && ': ' + capitalize(info.name)) ||
      (info.hip && ' (HIP): ' + info.hip) ||
      ' (RA/Dec): ' +
        (info.ra?.toFixed(FRAC_DIGITS) + '/' + info.dec?.toFixed(FRAC_DIGITS)));
  return { location: locationStr, date: dateStrIsoG, star: starStr };
};

/**
 * @param {object} params
 * @param {string} params.filenameBase - Filename base.
 * @param {number} [params.dpi=300] - DPI. Defaults to 300.
 */
const DownloadImage = ({ filenameBase, dpi = 300 }) => {
  // console.log('Rendering DownloadImage');
  const { setErrorMessage, svgData, info } = useHome();

  /* Dynamic import */
  /** @type {ReactRef} */
  const libsRef = useRef(null);
  useEffect(() => {
    const loadLibs = async () => {
      const [{ Canvg }, { jsPDF }] = await Promise.all([
        import('canvg'),
        import('jspdf'),
        import('svg2pdf.js'),
      ]);
      libsRef.current = { Canvg, jsPDF };
    };
    loadLibs();
  }, []);

  const metadata = useMemo(() => constructMetadata(info), [info]);

  /** @type {(format: string) => Promise<void>} */
  const handleDownload = useCallback(
    async (format) => {
      const { Canvg, jsPDF } = libsRef.current ?? {};
      const svgElement = document
        ?.getElementById('svg-container')
        ?.querySelector('svg');
      if (!svgElement) {
        setErrorMessage((prev) => ({
          ...prev,
          download: 'SVG element not found',
        }));
        return;
      }

      const widthPx = svgElement.width.baseVal.value;
      const heightPx = svgElement.height.baseVal.value;
      // console.log(`width: ${widthPx}, height: ${heightPx}`);

      const filename = `${filenameBase}.${format}`;
      if (format === SVG_FMT) {
        /* Download SVG --------------------------------------------- */
        /* Define XML and DOCTYPE headers */
        const xmlHeader =
          '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';

        /* Append metadata to the SVG */
        const newMetadata =
          '\n  <title>' +
          filenameBase +
          '</title>\n' +
          '  <desc>' +
          metadata.date +
          '</desc>\n' +
          '  <desc>' +
          metadata.location +
          '</desc>\n' +
          '  <desc>' +
          metadata.star +
          '</desc>\n';

        let svgWithMetadata;
        if (svgData.includes('<metadata>')) {
          /* Append new metadata inside the existing <metadata> tag */
          svgWithMetadata = svgData.replace(
            '<metadata>',
            `<metadata>${newMetadata}`,
          );
        } else {
          /* If no <metadata> tag exists, insert a new <metadata> tag after <svg ...> */
          svgWithMetadata = svgData.replace(
            /<svg[^>]*>/i,
            (match) => `${match}\n <metadata>${newMetadata} </metadata>`,
          );
        }

        /* Concatenate headers with the modified SVG data */
        const svgWithHeaders = xmlHeader + svgWithMetadata;

        const blob = new Blob([svgWithHeaders], { type: 'image/svg+xml' });
        saveAs(blob, filename);
      } else if (format === PNG_FMT) {
        /* Export PNG ----------------------------------------------- */
        /* Assuming the current DPI is 96 (standard for SVGs) */
        const pngScaleFactor = dpi / 96;
        const newWidthPx = widthPx * pngScaleFactor;
        const newHeightPx = heightPx * pngScaleFactor;

        const canvas = document.createElement('canvas');
        if (!canvas || !canvas.getContext) {
          setErrorMessage((prev) => ({
            ...prev,
            download: 'Your browser does not support the HTML5 Canvas feature.',
          }));
          return;
        }

        canvas.width = newWidthPx;
        canvas.height = newHeightPx;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setErrorMessage((prev) => ({
            ...prev,
            download: 'Your browser does not support the 2D rendering context.',
          }));
          return;
        }

        /* Center the SVG on the canvas */
        ctx.translate((newWidthPx - widthPx) / 2, (newHeightPx - heightPx) / 2);

        /* Render the SVG onto the canvas */
        const v = await Canvg.fromString(ctx, svgData, {
          ignoreDimensions: true, // Ignore the SVG's width and height attributes
          scaleWidth: newWidthPx,
          scaleHeight: newHeightPx,
        });
        await v.render();

        canvas.toBlob((blob) => {
          if (blob) {
            saveAs(blob, filename);
          } else {
            setErrorMessage((prev) => ({
              ...prev,
              download: 'Unable to generate PNG.',
            }));
          }
        });
      } else if (format === PDF_FMT) {
        /* Export PDF ----------------------------------------------- */
        const pdfScaleFactor = 1;
        const pdfDoc = new jsPDF({
          unit: 'pt',
          format: [widthPx * pdfScaleFactor, heightPx * pdfScaleFactor],
        });

        /* Set metadata for the PDF */
        pdfDoc.setProperties({
          title: filenameBase,
          subject: Object.values(metadata).join(', '),
        });

        pdfDoc
          .svg(svgElement, {
            x: 0,
            y: 0,
            width: widthPx * pdfScaleFactor,
            height: heightPx * pdfScaleFactor,
          })
          .then(() => {
            pdfDoc.save(filename);
          })
          /* @ts-ignore: TS7006 */
          .catch((err) => {
            console.error('Unable to export PDF:', err?.message ?? err);
            setErrorMessage((prev) => ({
              ...prev,
              download: 'Unable to generate PDF.',
            }));
          });
      }
    },
    [svgData, filenameBase, dpi, metadata, setErrorMessage],
  );

  return (
    <Stack
      direction="row"
      spacing={{ xs: 2, sm: 3, md: 4 }}
      justifyContent="center"
    >
      {[SVG_FMT, PNG_FMT, PDF_FMT].map((format) => (
        <Button
          aria-label={format}
          variant="contained"
          key={format}
          onClick={() => handleDownload(format)}
          startIcon={<DownloadIcon />}
          sx={{ minWidth: '15%', py: { xs: 0.55, sm: 0.75 } }}
        >
          {format}
        </Button>
      ))}
    </Stack>
  );
};

export default memo(DownloadImage);
