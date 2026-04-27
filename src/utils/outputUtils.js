// src/utils/outputUtils.js
import DOMPurify from 'dompurify';

/** @param {string} str */
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

/**
 * Decodes the SVG using `atob` and sanitizes it using `DOMPurify`.
 * @param {string} svgBase64 - The Base64 encoded SVG.
 * @returns {string} The sanitized SVG.
 */
const sanitizeSvg = (svgBase64) => {
  /* Decode base64 to binary string */
  const svgBinaryString = atob(svgBase64);

  /* Convert binary string to an array of char codes */
  const charCodes = new Uint8Array(svgBinaryString.length);
  for (let i = 0; i < svgBinaryString.length; i++) {
    charCodes[i] = svgBinaryString.charCodeAt(i);
  }

  /* Decode UTF-8 from char codes */
  const decoder = new TextDecoder('utf-8');
  const svgDecoded = decoder.decode(charCodes);

  /* Sanitize the SVG content using DOMPurify */
  const sanitizedSvg = DOMPurify.sanitize(svgDecoded, {
    ADD_TAGS: ['use', 'clipPath'],
    ADD_ATTR: ['id', 'xlink:href', 'clip-path'],
  });

  return sanitizedSvg;
};

const colorFilter = 'invert(1) hue-rotate(170deg) contrast(0.9)';

export { capitalize, sanitizeSvg, colorFilter };
