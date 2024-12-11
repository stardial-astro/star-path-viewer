// src/components/Output/DownloadImage.js
import React, { useMemo, useCallback } from 'react';
import { Stack, Button } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { saveAs } from 'file-saver';
import { Canvg } from 'canvg';
import { jsPDF } from 'jspdf';
import 'svg2pdf.js';
import { formatDateTimeISO } from '../../utils/dateUtils';

const capitalize = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const DownloadImage = ({ svgData, info, filenameBase, dpi = 300, setErrorMessage }) => {
  // console.log('Rendering DownloadImage');
  const dateStrIsoG = useMemo(() => formatDateTimeISO({
    year: parseInt(info.dateG.year),
    month: parseInt(info.dateG.month),
    day: parseInt(info.dateG.day),
  }).date, [info]);

  const handleDownload = useCallback(async (format) => {
    const svgElement = document.getElementById('svg-container').querySelector('svg');
    if (!svgElement) {
      setErrorMessage((prev) => ({ ...prev, download: 'SVG element not found' }));
      return;
    }

    const widthPx = parseFloat(svgElement.width.baseVal.value);
    const heightPx = parseFloat(svgElement.height.baseVal.value);
    // console.log(`width: ${widthPx}, height: ${heightPx}`);

    const filename = `${filenameBase}.${format}`;
    /* ---------------------------------------------------------------------- */
    if (format === 'svg') {
      /* Define XML and DOCTYPE headers */
      const xmlHeader = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';

      /* Append metadata to the SVG */
      const newMetadata = '\n  <title>' + filenameBase + '</title>\n' +
                          '  <desc>Date (Gregorian): ' + dateStrIsoG + '</desc>\n' +
                          '  <desc>Location (lat/lng): ' + info.lat.toFixed(3) + '/' + info.lng.toFixed(3) + '</desc>\n' +
                          '  <desc>Celestial Object' +
                          (
                            (info.name && !info.hip && ': ' + capitalize(info.name)) ||
                            (info.hip && ' (HIP): ' + info.hip) ||
                            ' (RA/Dec): ' + (info.ra.toFixed(3) + '/' + info.dec.toFixed(3))
                          ) +
                          '</desc>\n';

      let svgWithMetadata;
      if (svgData.includes('<metadata>')) {
        /* Append new metadata inside the existing <metadata> tag */
        svgWithMetadata = svgData.replace('<metadata>', `<metadata>${newMetadata}`);
      } else {
        /* If no <metadata> tag exists, insert a new <metadata> tag after <svg ...> */
        svgWithMetadata = svgData.replace(
          /<svg[^>]*>/i,
          (match) => `${match}\n <metadata>${newMetadata} </metadata>`
        );
      }

      /* Concatenate headers with the modified SVG data */
      const svgWithHeaders = xmlHeader + svgWithMetadata;

      const blob = new Blob([svgWithHeaders], { type: 'image/svg+xml' });
      saveAs(blob, filename);
    /* ---------------------------------------------------------------------- */
    } else if (format === 'png') {
      /* Assuming the current DPI is 96 (standard for SVGs) */
      const pngScaleFactor = parseFloat(dpi) / 96;
      const newWidthPx = widthPx * pngScaleFactor;
      const newHeightPx = heightPx * pngScaleFactor;

      const canvas = document.createElement('canvas');
      if (!canvas || !canvas.getContext) {
        setErrorMessage((prev) => ({ ...prev, download: 'Your browser does not support the HTML5 Canvas feature.' }));
        return;
      }

      canvas.width = newWidthPx;
      canvas.height = newHeightPx;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setErrorMessage((prev) => ({ ...prev, download: 'Your browser does not support the 2D rendering context.' }));
        return;
      }

      /* Center the SVG on the canvas */
      ctx.translate((newWidthPx - widthPx) / 2, (newHeightPx - heightPx) / 2);

      /* Render the SVG onto the canvas */
      const v = await Canvg.fromString(ctx, svgData, {
        ignoreDimensions: true,  // Ignore the SVG's width and height attributes
        scaleWidth: newWidthPx,
        scaleHeight: newHeightPx,
      });
      await v.render();

      canvas.toBlob((blob) => {
        if (blob) {
          saveAs(blob, filename);
        } else {
          setErrorMessage((prev) => ({ ...prev, download: 'Failed to generate PNG.' }));
        }
      });
    /* ---------------------------------------------------------------------- */
    } else if (format === 'pdf') {
      const pdfScaleFactor = 1;
      const pdfDoc = new jsPDF({
        unit: 'pt',
        format: [widthPx * pdfScaleFactor, heightPx * pdfScaleFactor],
      });

      /* Set metadata for the PDF */
      pdfDoc.setProperties({
        title: filenameBase,
        subject: 'Date (Gregorian): ' + dateStrIsoG +
                ', Location (lat/lng): ' + info.lat.toFixed(3) + '/' + info.lng.toFixed(3) +
                ', Celestial Object' + (
                  (info.name && !info.hip && ': ' + capitalize(info.name)) ||
                  (info.hip && ' (HIP): ' + info.hip) ||
                  ' (RA/Dec): ' + (info.ra.toFixed(3) + '/' + info.dec.toFixed(3))
                ),
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
        .catch((error) => {
          setErrorMessage((prev) => ({ ...prev, download: 'Failed to generate PDF.' }));
        });
    }
    /* ---------------------------------------------------------------------- */
  }, [svgData, info, filenameBase, dpi, dateStrIsoG, setErrorMessage]);

  return (
    <Stack direction='row' spacing={{ xs: 2, sm: 3, md: 4 }} justifyContent='center'>
      {['svg', 'png', 'pdf'].map((format) => (
        <Button
          variant="contained"
          aria-label={format}
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

export default React.memo(DownloadImage);
