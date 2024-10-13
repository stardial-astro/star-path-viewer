// src/utils/starInputUtils.js
import * as actionTypes from '../context/starInputActionTypes';
import { HIP_MIN, HIP_MAX, TYPE_HIP, TYPE_RADEC, FORMAT_DD } from './constants';

const constructNameZh = (item) => {
  if (item.name_zh) {
    return (
      item.name_zh === item.name_zh_hk
        ? `${item.name_zh}, ${item.pinyin}`
        : `${item.name_zh}, ${item.name_zh_hk}, ${item.pinyin}`
    );
  } else {
    return '';
  }
};

/* Validate the star */
const validateStarSync = (
  starInputType, radecFormat,
  starHip, starRadec, starRaHMS, starDecDMS
) => {
  let newStarError = { name: '', hip: '', ra: '', dec: '' };

  if (starInputType === TYPE_HIP) {
    if (!/^\d*$/.test(starHip)) {
      return { ...newStarError, hip: 'Invalid Hipparchus Catalogue number.' };
    }
    if (starHip) {
      const hip = parseInt(starHip);
      if (hip < HIP_MIN || hip > HIP_MAX) {
        return { ...newStarError, hip: `The Hipparchus Catalogue number must be in the range [${HIP_MIN}, ${HIP_MAX}].` };
      }
    }
  } else if (starInputType === TYPE_RADEC) {
    if (radecFormat === FORMAT_DD) {
      if (!/^\d*(\.\d+)?$/.test(starRadec.ra)) {
        return { ...newStarError, ra: 'The right ascension must be a positive decimal.' };
      }
      if (!/^-?\d*(\.\d+)?$/.test(starRadec.dec)) {
        return { ...newStarError, dec: 'The declination must be a decimal.' };
      }

      if (starRadec.ra) {
        const ra = parseFloat(starRadec.ra);
        if (ra < 0 || ra >= 360) {
          return { ...newStarError, ra: 'The right ascension must be in the range [0°, 360°).' };
        }
      }
    } else {
      if (!/^\d*$/.test(starRaHMS.hours)) {
        return { ...newStarError, ra: 'The hours must be a positive integer.' };
      }
      if (!/^-?\d*$/.test(starDecDMS.degrees)) {
        return { ...newStarError, dec: 'The degrees must be an integer.' };
      }
      if (!/^\d*$/.test(starRaHMS.minutes)) {
        return { ...newStarError, ra: 'The minutes must be a positive integer.' };
      }
      if (!/^\d*$/.test(starDecDMS.minutes)) {
        return { ...newStarError, dec: 'The minutes must be a positive integer.' };
      }
      if (!/^\d*(\.\d+)?$/.test(starRaHMS.seconds)) {
        return { ...newStarError, ra: 'The seconds must be a positive decimal.' };
      }
      if (!/^\d*(\.\d+)?$/.test(starDecDMS.seconds)) {
        return { ...newStarError, dec: 'The seconds must be a positive decimal.' };
      }

      if (starRadec.ra) {
        const ra = parseFloat(starRadec.ra);
        if (ra < 0 || ra >= 360) {
          return { ...newStarError, ra: 'The right ascension must be in the range [0h, 24h).' };
        }
      }
    }

    if (starRadec.dec) {
      const dec = parseFloat(starRadec.dec);
      if (dec < -90 || dec > 90) {
        return { ...newStarError, dec: 'The declination must be in the range [-90°, 90°].' };
      }
    }
  }

  return newStarError;
};

const clearStarError = (starDispatch, setErrorMessage) => {
  setErrorMessage((prev) => ({ ...prev, star: '', draw: '', download: '' }));
  starDispatch({ type: actionTypes.CLEAR_STAR_ERROR });
};

export {
  constructNameZh,
  validateStarSync,
  clearStarError,
};
