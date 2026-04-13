// src/utils/starInputUtils.js
import * as actionTypes from '@context/starInputActionTypes';
import {
  HIP_MIN,
  HIP_MAX,
  RADEC_TYPES,
  HIP_INVALID_PREFIX,
  HIP_OUT_OF_RANGE_MSG,
} from './constants';

/**
 * Constructs Chinese names into an object.
 * @param {StarItem} item
 * @returns {StarNameZhObj}
 */
const constructNameZh = (item) => {
  return {
    zh: item.name_zh || '',
    zhHK: item.name_zh_hk || '',
    pinyin: item.pinyin || '',
  };
};

/**
 * Formats Chinese names into `'{name_zh|name_zh_hk} {pinyin}'`.
 * @param {StarNameZhObj} nameZh
 * @param {boolean} isZhHant
 * @returns
 */
const joinNameZh = (nameZh, isZhHant) => {
  if (nameZh.zh) {
    return (
      (isZhHant && nameZh.zhHK ? nameZh.zhHK : nameZh.zh) +
      (nameZh.pinyin ? `, ${nameZh.pinyin}` : '')
    );
  } else {
    return '';
  }
};

/**
 * Validates the HIP of the star.
 * @param {string} starHip - The star's HIP number.
 * @returns {{ isValid: boolean, invalidError: StarErrorObj }}
 */
const validateStarHipSync = (starHip) => {
  // console.log('Validating HIP...', starHip);
  let isValid = true;
  /** @type {StarErrorObj} */
  const invalidError = { name: '', hip: '', ra: '', dec: '' };
  if (starHip) {
    const hipInt = parseInt(starHip);
    if (isNaN(hipInt)) {
      isValid = false;
      invalidError.hip = HIP_INVALID_PREFIX + starHip;
    } else if (hipInt < HIP_MIN || hipInt > HIP_MAX) {
      isValid = false;
      invalidError.hip = HIP_OUT_OF_RANGE_MSG;
    }
  }
  return { isValid, invalidError };
};

/**
 * Validates the RA/Dec of the star.
 * @param {RadecType} radecFormat
 * @param {RadecObj} starRadec - The RA/Dec object.
 * @returns {{ isValid: boolean, invalidError: StarErrorObj }}
 */
const validateStarRadecSync = (radecFormat, starRadec) => {
  // console.log(
  //   'Validating RA/Dec...',
  //   radecFormat,
  //   starRadec,
  //   starRaHms,
  //   starDecDms,
  // );
  let isValid = true;
  /** @type {StarErrorObj} */
  const invalidError = { name: '', hip: '', ra: '', dec: '' };

  if (starRadec.ra) {
    const raFloat = parseFloat(starRadec.ra);
    if (raFloat < 0 || raFloat >= 360) {
      isValid = false;
      invalidError.ra =
        radecFormat === RADEC_TYPES.dd
          ? 'The right ascension must be in the range [0°, 360°).'
          : 'The right ascension must be in the range [0h, 24h).';
    }
  }
  if (starRadec.dec) {
    const decFloat = parseFloat(starRadec.dec);
    if (decFloat < -90 || decFloat > 90) {
      isValid = false;
      invalidError.dec = 'The declination must be in the range [-90°, 90°].';
    }
  }
  return { isValid, invalidError };
};

/**
 * Clears RA/star/draw/download errors except null errors.
 * @param {ReactDispatch} dispatch
 * @param {ReactSetState<ErrorObj>} setErrorMessage
 */
const clearRaError = (dispatch, setErrorMessage) => {
  setErrorMessage((prev) => ({ ...prev, star: '', draw: '', download: '' }));
  dispatch({ type: actionTypes.SET_STAR_RA_ERROR, payload: '' });
};
/**
 * Clears Dec/star/draw/download errors except null errors.
 * @param {ReactDispatch} dispatch
 * @param {ReactSetState<ErrorObj>} setErrorMessage
 */
const clearDecError = (dispatch, setErrorMessage) => {
  setErrorMessage((prev) => ({ ...prev, star: '', draw: '', download: '' }));
  dispatch({ type: actionTypes.SET_STAR_DEC_ERROR, payload: '' });
};

/**
 * Clears star-related/draw/download errors except null errors.
 * @param {ReactDispatch} dispatch
 * @param {ReactSetState<ErrorObj>} setErrorMessage
 */
const clearStarError = (dispatch, setErrorMessage) => {
  setErrorMessage((prev) => ({ ...prev, star: '', draw: '', download: '' }));
  dispatch({ type: actionTypes.CLEAR_STAR_ERROR });
};

export {
  constructNameZh,
  joinNameZh,
  validateStarHipSync,
  validateStarRadecSync,
  clearRaError,
  clearDecError,
  clearStarError,
};
