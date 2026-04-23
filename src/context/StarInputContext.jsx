// src/context/StarInputContext.jsx
/* eslint-disable react-refresh/only-export-components */
import { createContext, use, useReducer, useState, useCallback } from 'react';
import { STORAGE_KEYS, STAR_INPUT_TYPES, RADEC_TYPES } from '@utils/constants';
import { isDevMode } from '@utils/devMode';
import * as actionTypes from './starInputActionTypes';

/** 6 hours */
const HIP_STALE_MS = 6 * 60 * 60_000;

/**
 * Loads the HIP ident list from `localStorage`.
 * @returns {HipItem[] | null} The HIP ident list, or `null` if stale or missing.
 */
const getInitialHipList = () => {
  const raw = localStorage.getItem(STORAGE_KEYS.hip);
  if (!raw) return null;
  /** @type {{data: HipItem[], timestamp: number}} */
  const { data, timestamp } = JSON.parse(raw);
  if (Date.now() - timestamp > HIP_STALE_MS) return null;
  isDevMode &&
    console.debug('📦 [HIP ident]', data.length, 'entries (from storage)');
  return data;
};

const initialHipList = getInitialHipList();

/** @type {React.Context<*>} */
const StarInputContext = createContext(null);

/** @type {StarInitialState} */
export const starInitialState = {
  starName: '',
  starNameZh: { zh: '', zhHK: '', pinyin: '' },
  starHip: '',
  starRadec: { ra: '', dec: '' },
  starRaHms: { hours: '', minutes: '', seconds: '' },
  starDecDms: { degrees: '', minutes: '', seconds: '' },
  starInputType: STAR_INPUT_TYPES.name,
  radecFormat: RADEC_TYPES.dms,
  searchTerm: '',
  suggestions: [],
  starError: { name: '', hip: '', ra: '', dec: '' },
  starNullError: { name: '', hip: '', ra: '', dec: '' },
  starValid: true,
};

/**
 * @param {RadecObj} state
 * @param {Action} action
 * @returns {RadecObj}
 */
const starRadecReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_STAR_RA:
      return { ...state, ra: action.payload };
    case actionTypes.SET_STAR_DEC:
      return { ...state, dec: action.payload };
    case actionTypes.SET_STAR_RADEC:
      return { ...state, ...action.payload };
    case actionTypes.CLEAR_STAR_RADEC:
      return { ra: '', dec: '' };
    default:
      return state;
  }
};

/**
 * @param {RaHmsObj} state
 * @param {Action} action
 * @returns {RaHmsObj}
 */
const starRaHmsReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_STAR_RA_HOURS:
      return { ...state, hours: action.payload };
    case actionTypes.SET_STAR_RA_MINUTES:
      return { ...state, minutes: action.payload };
    case actionTypes.SET_STAR_RA_SECONDS:
      return { ...state, seconds: action.payload };
    case actionTypes.SET_STAR_RA_HMS:
      return { ...state, ...action.payload };
    case actionTypes.CLEAR_STAR_RA_HMS:
      return { hours: '', minutes: '', seconds: '' };
    default:
      return state;
  }
};

/**
 * @param {DecDmsObj} state
 * @param {Action} action
 * @returns {DecDmsObj}
 */
const starDecDmsReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_STAR_DEC_DEGREES:
      return { ...state, degrees: action.payload };
    case actionTypes.SET_STAR_DEC_MINUTES:
      return { ...state, minutes: action.payload };
    case actionTypes.SET_STAR_DEC_SECONDS:
      return { ...state, seconds: action.payload };
    case actionTypes.SET_STAR_DEC_DMS:
      return { ...state, ...action.payload };
    case actionTypes.CLEAR_STAR_DEC_DMS:
      return { degrees: '', minutes: '', seconds: '' };
    default:
      return state;
  }
};

/**
 * @param {StarErrorObj} state
 * @param {Action} action
 * @returns {StarErrorObj}
 */
const starErrorReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_STAR_NAME_ERROR:
      return { ...state, name: action.payload };
    case actionTypes.SET_STAR_HIP_ERROR:
      return { ...state, hip: action.payload };
    case actionTypes.SET_STAR_RA_ERROR:
      return { ...state, ra: action.payload };
    case actionTypes.SET_STAR_DEC_ERROR:
      return { ...state, dec: action.payload };
    case actionTypes.SET_STAR_ERROR:
      return { ...state, ...action.payload };
    case actionTypes.CLEAR_STAR_ERROR:
      return { name: '', hip: '', ra: '', dec: '' };
    default:
      return state;
  }
};

/**
 * @param {StarNullErrorObj} state
 * @param {Action} action
 * @returns {StarNullErrorObj}
 */
const starNullErrorReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_STAR_NAME_NULL_ERROR:
      return { ...state, name: 'errors:please_select_planet' }; // i18n key
    case actionTypes.SET_STAR_HIP_NULL_ERROR:
      return {
        ...state,
        hip: 'errors:please_search_hip', // i18n key
      };
    case actionTypes.SET_STAR_RA_NULL_ERROR:
      return { ...state, ra: 'errors:please_enter_ra' }; // i18n key
    case actionTypes.SET_STAR_DEC_NULL_ERROR:
      return { ...state, dec: 'errors:please_enter_dec' }; // i18n key
    case actionTypes.CLEAR_STAR_NAME_NULL_ERROR:
      return { ...state, name: '' };
    case actionTypes.CLEAR_STAR_HIP_NULL_ERROR:
      return { ...state, hip: '' };
    case actionTypes.CLEAR_STAR_RA_NULL_ERROR:
      return { ...state, ra: '' };
    case actionTypes.CLEAR_STAR_DEC_NULL_ERROR:
      return { ...state, dec: '' };
    case actionTypes.CLEAR_STAR_NULL_ERROR:
      return { name: '', hip: '', ra: '', dec: '' };
    default:
      return state;
  }
};

/**
 * @param {StarInitialState} state
 * @param {Action} action
 * @returns {StarInitialState}
 */
const starInputReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_STAR_NAME:
      return { ...state, starName: action.payload };
    case actionTypes.SET_STAR_NAME_ZH:
      return { ...state, starNameZh: action.payload };
    case actionTypes.SET_STAR_HIP:
      return { ...state, starHip: action.payload };
    case actionTypes.CLEAR_STAR_HIP_AND_NAME:
      return {
        ...state,
        starHip: '',
        starName: '',
        starNameZh: { zh: '', zhHK: '', pinyin: '' },
      };

    case actionTypes.SET_STAR_RA:
    case actionTypes.SET_STAR_DEC:
    case actionTypes.SET_STAR_RADEC:
    case actionTypes.CLEAR_STAR_RADEC:
      return {
        ...state,
        starRadec: starRadecReducer(state.starRadec, action),
      };

    case actionTypes.SET_STAR_RA_HOURS:
    case actionTypes.SET_STAR_RA_MINUTES:
    case actionTypes.SET_STAR_RA_SECONDS:
    case actionTypes.SET_STAR_RA_HMS:
    case actionTypes.CLEAR_STAR_RA_HMS:
      return {
        ...state,
        starRaHms: starRaHmsReducer(state.starRaHms, action),
      };

    case actionTypes.SET_STAR_DEC_DEGREES:
    case actionTypes.SET_STAR_DEC_MINUTES:
    case actionTypes.SET_STAR_DEC_SECONDS:
    case actionTypes.SET_STAR_DEC_DMS:
    case actionTypes.CLEAR_STAR_DEC_DMS:
      return {
        ...state,
        starDecDms: starDecDmsReducer(state.starDecDms, action),
      };

    case actionTypes.SET_STAR_NAME_ERROR:
    case actionTypes.SET_STAR_HIP_ERROR:
    case actionTypes.SET_STAR_RA_ERROR:
    case actionTypes.SET_STAR_DEC_ERROR:
    case actionTypes.SET_STAR_ERROR:
    case actionTypes.CLEAR_STAR_ERROR:
      return {
        ...state,
        starError: starErrorReducer(state.starError, action),
      };

    case actionTypes.SET_STAR_NAME_NULL_ERROR:
    case actionTypes.SET_STAR_HIP_NULL_ERROR:
    case actionTypes.SET_STAR_RA_NULL_ERROR:
    case actionTypes.SET_STAR_DEC_NULL_ERROR:
    case actionTypes.CLEAR_STAR_NAME_NULL_ERROR:
    case actionTypes.CLEAR_STAR_HIP_NULL_ERROR:
    case actionTypes.CLEAR_STAR_RA_NULL_ERROR:
    case actionTypes.CLEAR_STAR_DEC_NULL_ERROR:
    case actionTypes.CLEAR_STAR_NULL_ERROR:
      return {
        ...state,
        starNullError: starNullErrorReducer(state.starNullError, action),
      };

    case actionTypes.SET_INPUT_TYPE:
      return { ...state, starInputType: action.payload };
    case actionTypes.SET_RADEC_FORMAT:
      return { ...state, radecFormat: action.payload };

    case actionTypes.SET_SEARCH_TERM:
      return { ...state, searchTerm: action.payload };
    case actionTypes.CLEAR_SEARCH_TERM:
      return { ...state, searchTerm: '' };

    case actionTypes.SET_SUGGESTIONS:
      return { ...state, suggestions: action.payload };
    case actionTypes.CLEAR_SUGGESTIONS:
      return { ...state, suggestions: [] };

    case actionTypes.SET_STAR_VALID:
      return { ...state, starValid: action.payload };
    default:
      return state;
  }
};

/**
 * Provides the star input context to its children components.
 * @param {object} props
 * @param {React.ReactNode} props.children
 */
export const StarInputProvider = ({ children }) => {
  const [starState, starDispatch] = useReducer(
    starInputReducer,
    starInitialState,
  );
  const [hipList, setHipList] = useState(initialHipList);

  /**
   * Sets `hipList` and stores in `localStorage`.
   * @type {(data: HipItem[]) => void}
   */
  const updateHipList = useCallback((data) => {
    setHipList(data);
    localStorage.setItem(
      STORAGE_KEYS.hip,
      JSON.stringify({ data, timestamp: Date.now() }),
    );
  }, []);

  /**
   * Clears name, HIP, suggestions, RA/Dec, and resets validity.
   * @type {() => void}
   */
  const resetStarValues = useCallback(() => {
    /* Clear name, HIP, and suggestions */
    starDispatch({ type: actionTypes.CLEAR_STAR_HIP_AND_NAME });
    starDispatch({ type: actionTypes.CLEAR_SEARCH_TERM });
    starDispatch({ type: actionTypes.CLEAR_SUGGESTIONS });
    /* Clear RA/Dec */
    starDispatch({ type: actionTypes.CLEAR_STAR_RADEC });
    starDispatch({ type: actionTypes.CLEAR_STAR_RA_HMS });
    starDispatch({ type: actionTypes.CLEAR_STAR_DEC_DMS });
    /* Reset validity */
    starDispatch({ type: actionTypes.SET_STAR_VALID, payload: true });
  }, []);

  return (
    <StarInputContext
      value={{
        ...starState,
        hipList,
        setHipList: updateHipList,
        resetStarValues,
        starDispatch,
      }}
    >
      {children}
    </StarInputContext>
  );
};

/**
 * Custom hook to use the StarInputContext.
 * Ensures the hook is used within an StarInputProvider.
 * @returns {StarContextType} The star input context value.
 * @throws {Error} If used outside of an StarInputProvider.
 */
export const useStarInput = () => {
  const context = use(StarInputContext);
  if (!context) {
    throw new Error('useStarInput must be used within an StarInputProvider');
  }
  return context;
};
