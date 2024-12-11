// src/context/StarInputContext.js
import React, { createContext, useContext, useReducer, useRef } from 'react';
import * as actionTypes from './starInputActionTypes';
import { TYPE_NAME, FORMAT_DMS } from '../utils/constants';

const StarInputContext = createContext();

const initialState = {
  starName: '',
  starNameZh: '',
  starHip: '',
  starRadec: { ra: '', dec: '' },
  starRaHMS: { hours: '', minutes: '', seconds: '' },
  starDecDMS: { degrees: '', minutes: '', seconds: '' },
  starInputType: TYPE_NAME,  // 'name', 'hip', 'radec'
  radecFormat: FORMAT_DMS,  // 'decimal', 'dms'
  searchTerm: '',
  suggestions: [],
  highlightedIndex: -1,
  cachedNames: null,
  starError: { name: '', hip: '', ra: '', dec: '' },
  starNullError: { name: '', hip: '', ra: '', dec: '' },
  starValid: true,
};

const starRadecReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_STAR_RA:
      return { ...state, ra: action.payload };
    case actionTypes.SET_STAR_DEC:
      return { ...state, dec: action.payload };
    case actionTypes.SET_STAR_RADEC:
      return {
        ...state,
        ...action.payload,
      };
    case actionTypes.CLEAR_STAR_RADEC:
      return { ra: '', dec: '' };
    default:
      return state;
  }
};

const starRaHmsReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_STAR_RA_HOURS:
      return { ...state, hours: action.payload };
    case actionTypes.SET_STAR_RA_MINUTES:
      return { ...state, minutes: action.payload };
    case actionTypes.SET_STAR_RA_SECONDS:
      return { ...state, seconds: action.payload };
    case actionTypes.SET_STAR_RA_HMS:
      return {
        ...state,
        ...action.payload,
      };
    case actionTypes.CLEAR_STAR_RA_HMS:
      return { hours: '', minutes: '', seconds: '' };
    default:
      return state;
  }
};

const starDecDmsReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_STAR_DEC_DEGREES:
      return { ...state, degrees: action.payload };
    case actionTypes.SET_STAR_DEC_MINUTES:
      return { ...state, minutes: action.payload };
    case actionTypes.SET_STAR_DEC_SECONDS:
      return { ...state, seconds: action.payload };
    case actionTypes.SET_STAR_DEC_DMS:
      return {
        ...state,
        ...action.payload,
      };
    case actionTypes.CLEAR_STAR_DEC_DMS:
      return { degrees: '', minutes: '', seconds: '' };
    default:
      return state;
  }
};

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
      return {
        ...state,
        ...action.payload,
      };
    case actionTypes.CLEAR_STAR_ERROR:
      return { name: '', hip: '', ra: '', dec: '' };
    default:
      return state;
  }
};

const starNullErrorReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_STAR_NAME_NULL_ERROR:
      return { ...state, name: 'Please select a planet.' };
    case actionTypes.SET_STAR_HIP_NULL_ERROR:
      return { ...state, hip: 'Please search and select a Hipparcos Catalogue number.' };
    case actionTypes.SET_STAR_RA_NULL_ERROR:
      return { ...state, ra: 'Please enter a right ascension.' };
    case actionTypes.SET_STAR_DEC_NULL_ERROR:
      return { ...state, dec: 'Please enter a declination.' };
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

const starInputReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_STAR_NAME:
      return { ...state, starName: action.payload };
    case actionTypes.SET_STAR_NAME_ZH:
      return { ...state, starNameZh: action.payload };
    case actionTypes.SET_STAR_HIP:
      return { ...state, starHip: action.payload };
    case actionTypes.CLEAR_STAR_HIP_AND_NAME:
      return { ...state, starHip: '', starName: '', starNameZh: '' };

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
        starRaHMS: starRaHmsReducer(state.starRaHMS, action),
      };

    case actionTypes.SET_STAR_DEC_DEGREES:
    case actionTypes.SET_STAR_DEC_MINUTES:
    case actionTypes.SET_STAR_DEC_SECONDS:
    case actionTypes.SET_STAR_DEC_DMS:
    case actionTypes.CLEAR_STAR_DEC_DMS:
      return {
        ...state,
        starDecDMS: starDecDmsReducer(state.starDecDMS, action),
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

    case actionTypes.SET_HIGHLIGHTED_INDEX:
      return { ...state, highlightedIndex: action.payload };
    case actionTypes.CLEAR_HIGHLIGHTED_INDEX:
      return { ...state, highlightedIndex: -1 };
    
    case actionTypes.SET_CACHED_NAMES:
      return { ...state, cachedNames: action.payload };

    case actionTypes.SET_STAR_VALID:
      return { ...state, starValid: action.payload };
    default:
      return state;
  }
};

export const StarInputProvider = ({ children }) => {
  const [starState, starDispatch] = useReducer(starInputReducer, initialState);
  const latestSuggestionRequest = useRef(0);
  const isSelecting = useRef(false);
  const lastSelectedTerm = useRef(null);

  return (
    <StarInputContext.Provider value={{
      ...starState,
      latestSuggestionRequest,
      isSelecting,
      lastSelectedTerm,
      starDispatch,
    }}>
      {children}
    </StarInputContext.Provider>
  );
};

export const useStarInput = () => useContext(StarInputContext);
