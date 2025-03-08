// src/context/DateInputContext.jsx
import React, { createContext, useContext, useReducer, useRef } from 'react';
import * as actionTypes from './dateInputActionTypes';
import { GREGORIAN } from '@utils/constants';

const DateInputContext = createContext();

const initialState = {
  date: { year: '', month: '', day: '' },
  flag: '',  // 've', 'ss', 'ae', 'ws'
  cal: GREGORIAN,  // '': Gregorian, 'j': Julian
  disabledMonths: {},
  lastDay: 31,
  dateAdjusting: false,
  dateFetching: false,
  dateError: { general: '', year: '', month: '', day: '' },
  dateNullError: { year: '', month: '', day: '' },
  dateValid: true,
};

const dateReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_YEAR:
      return { ...state, year: action.payload };
    case actionTypes.SET_MONTH:
      return { ...state, month: action.payload };
    case actionTypes.SET_DAY:
      return { ...state, day: action.payload };
    case actionTypes.SET_DATE:
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
};

const dateErrorReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_GENERAL_DATE_ERROR:
      return { ...state, general: action.payload };
    case actionTypes.SET_YEAR_ERROR:
      return { ...state, year: action.payload };
    case actionTypes.SET_MONTH_ERROR:
      return { ...state, month: action.payload };
    case actionTypes.SET_DAY_ERROR:
      return { ...state, day: action.payload };
    case actionTypes.SET_DATE_ERROR:
      return {
        ...state,
        ...action.payload,
      };
    case actionTypes.CLEAR_DATE_ERROR:
      return { general: '', year: '', month: '', day: '' };
    default:
      return state;
  }
};

const dateNullErrorReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_YEAR_NULL_ERROR:
      return { ...state, year: 'Please enter a year.' };
    case actionTypes.SET_MONTH_NULL_ERROR:
      return { ...state, month: 'Please enter a month.' };
    case actionTypes.SET_DAY_NULL_ERROR:
      return { ...state, day: 'Please enter a day.' };
    case actionTypes.CLEAR_YEAR_NULL_ERROR:
      return { ...state, year: '' };
    case actionTypes.CLEAR_MONTH_NULL_ERROR:
      return { ...state, month: '' };
    case actionTypes.CLEAR_DAY_NULL_ERROR:
      return { ...state, day: '' };
    case actionTypes.CLEAR_DATE_NULL_ERROR:
      return { year: '', month: '', day: '' };
    default:
      return state;
  }
};

const dateInputReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_YEAR:
    case actionTypes.SET_MONTH:
    case actionTypes.SET_DAY:
    case actionTypes.SET_DATE:
      return {
        ...state,
        date: dateReducer(state.date, action),
      };

    case actionTypes.SET_GENERAL_DATE_ERROR:
    case actionTypes.SET_YEAR_ERROR:
    case actionTypes.SET_MONTH_ERROR:
    case actionTypes.SET_DAY_ERROR:
    case actionTypes.SET_DATE_ERROR:
    case actionTypes.CLEAR_DATE_ERROR:
      return {
        ...state,
        dateError: dateErrorReducer(state.dateError, action),
      };

    case actionTypes.SET_YEAR_NULL_ERROR:
    case actionTypes.SET_MONTH_NULL_ERROR:
    case actionTypes.SET_DAY_NULL_ERROR:
    case actionTypes.CLEAR_YEAR_NULL_ERROR:
    case actionTypes.CLEAR_MONTH_NULL_ERROR:
    case actionTypes.CLEAR_DAY_NULL_ERROR:
    case actionTypes.CLEAR_DATE_NULL_ERROR:
      return {
        ...state,
        dateNullError: dateNullErrorReducer(state.dateNullError, action),
      };

    case actionTypes.SET_FLAG:
      return { ...state, flag: action.payload };
    case actionTypes.SET_CAL:
      return { ...state, cal: action.payload };

    case actionTypes.SET_DISABLED_MONTHS:
      return { ...state, disabledMonths: action.payload };
    case actionTypes.SET_LAST_DAY:
      return { ...state, lastDay: action.payload };

    case actionTypes.SET_DATE_ADJUSTING_ON:
      return { ...state, dateAdjusting: true };
    case actionTypes.SET_DATE_ADJUSTING_OFF:
      return { ...state, dateAdjusting: false };
    case actionTypes.SET_DATE_FETCHING_ON:
      return { ...state, dateFetching: true };
    case actionTypes.SET_DATE_FETCHING_OFF:
      return { ...state, dateFetching: false };

    case actionTypes.SET_DATE_VALID:
      return { ...state, dateValid: action.payload };

    default:
      return state;
  }
};

export const DateInputProvider = ({ children }) => {
  const [dateState, dateDispatch] = useReducer(dateInputReducer, initialState);
  const abortControllerRef = useRef(null);
  const queryDateFromRef = useRef('');  // 'click', 'change'
  const latestDateRequest = useRef(0);

  return (
    <DateInputContext.Provider
      value={{
        ...dateState,
        abortControllerRef,
        queryDateFromRef,
        latestDateRequest,
        dateDispatch,
      }}
    >
      {children}
    </DateInputContext.Provider>
  );
};

export const useDateInput = () => useContext(DateInputContext);
