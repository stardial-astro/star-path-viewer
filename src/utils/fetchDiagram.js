// src/utils/fetchDiagram.js
import axios from 'axios';
import config from './config';
import { CALS, INFO_KEYS } from './constants';
import { parseApiError } from './apiUtils';
import { sanitizeSvg } from './outputUtils';
import { getIsDevMode } from './devMode';

const NO_DATA_ERR_MSG = 'errors:no_diagram_data_returned'; // i18n key
const DIAGRAM_ERR_MSG = 'errors:diagram_error'; // i18n key

const diagramUrl = `${import.meta.env.VITE_SERVER_URL}/diagram`;

/**
 * Fetches diagram and prepares info & sanitized SVG.
 * @param {ParamObj} params - Query parameters.
 * @param {AbortSignal} signal
 * @returns {Promise<DiagramObj | null>} The diagram data object, or `null` if aborted.
 * @throws {Error} If request failed or result is invalid.
 */
const fetchDiagram = async (params, signal) => {
  if (signal?.aborted) return null;

  const isDevMode = getIsDevMode();
  isDevMode && console.debug('> Fetching diagram...');
  /** @type {DiagramSchema} */
  let data;
  try {
    /* Fetch diagram */
    const response = await axios.get(diagramUrl, {
      params,
      timeout: config.SERVER_DIAGRAM_TIMEOUT,
      signal,
    });
    /** @type {DiagramSchema} */
    data = response.data;
    if (!data) throw new Error(NO_DATA_ERR_MSG);

    /* Verify tz values */
    const offset = data.annotations[0].time_zone;
    if (data.offset !== offset) {
      console.warn(
        `Returned Standard Time offset ${data.offset} does't match ${offset} in annotations`,
      );
    }
    if (params.tz && data.tz !== params.tz) {
      console.warn(
        `Returned tz '${data.tz}' does't match '${params.tz}' in params`,
      );
    }
    /* Parse the fetched data later */
  } catch (err) {
    if (axios.isCancel(err)) {
      isDevMode && console.debug('Diagram fetching cancelled.');
      return null;
    }
    throw parseApiError(err);
  }

  /* Construct info: location, tz, calendar, star */
  /** @type {InfoObj} */
  const newInfo = {};
  for (const key of INFO_KEYS) {
    newInfo[key] = data[key];
  }

  /* Insert date into info */
  if (params.cal === CALS.gregorian && data.cal === CALS.julian) {
    newInfo.dateG = {
      year: parseInt(params.year),
      month: parseInt(params.month),
      day: parseInt(params.day),
    };
    newInfo.dateJ = { year: data.year, month: data.month, day: data.day };
  } else if (params.cal === CALS.julian && data.cal === CALS.gregorian) {
    newInfo.dateJ = {
      year: parseInt(params.year),
      month: parseInt(params.month),
      day: parseInt(params.day),
    };
    newInfo.dateG = { year: data.year, month: data.month, day: data.day };
  } else {
    console.error(`cal_query=${params.cal}, cal_other=${data.cal}`);
    throw new Error(DIAGRAM_ERR_MSG);
  }

  /* (Unused) The equinox/solstice times */
  newInfo.eqxSolTime = [];
  // if (data.flag && data.eqxSolTime.length > 0) {
  //   const res_month = data.eqxSolTime[1].toString();
  //   const res_day = data.eqxSolTime[2].toString();
  //   newInfo.eqxSolTime = data.eqxSolTime;
  //   newInfo.dateG.month = res_month;
  //   newInfo.dateG.day = res_day;
  //   dateDispatch({ type: dateActionTypes.SET_MONTH, payload: res_month });
  //   dateDispatch({ type: dateActionTypes.SET_DAY, payload: res_day });
  // }

  isDevMode &&
    console.debug(
      '[Diagram ID]',
      data.diagramId,
      '\n[Results]',
      newInfo,
      '\n[Annotations]',
      data.annotations,
    );

  return {
    diagramId: data.diagramId,
    info: newInfo,
    svgData: sanitizeSvg(data.svgData),
    anno: data.annotations,
  };
};

export default fetchDiagram;
