// src/context/DateInputContext.jsx
/* eslint-disable react-refresh/only-export-components */
import { createContext, use, useReducer, useRef } from 'react';
import { CALS } from '@utils/constants';
import * as actionTypes from './dateInputActionTypes';

/** @type {React.Context<*>} */
const DateInputContext = createContext(null);

/** @type {DateInitialState} */
const initialState = {
  date: { year: '', month: '', day: '' },
  flag: '',
  cal: CALS.gregorian,
  dateFetching: false,
  dateError: { general: '', year: '', month: '', day: '' },
  dateNullError: { year: '', month: '', day: '' },
  dateValid: true,
};

/**
 * @param {DateObj} state
 * @param {Action} action
 * @returns {DateObj}
 */
const dateReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_YEAR:
      return { ...state, year: action.payload };
    case actionTypes.SET_MONTH:
      return { ...state, month: action.payload };
    case actionTypes.SET_DAY:
      return { ...state, day: action.payload };
    case actionTypes.SET_DATE:
      return { ...state, ...action.payload };
    case actionTypes.CLEAR_DATE:
      return { year: '', month: '', day: '' };
    default:
      return state;
  }
};

/**
 * @param {DateErrorObj} state
 * @param {Action} action
 * @returns {DateErrorObj}
 */
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
      return { ...state, ...action.payload };
    case actionTypes.CLEAR_DATE_ERROR:
      return { general: '', year: '', month: '', day: '' };
    default:
      return state;
  }
};

/**
 * @param {DateNullErrorObj} state
 * @param {Action} action
 * @returns {DateNullErrorObj}
 */
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

/**
 * @param {DateInitialState} state
 * @param {Action} action
 * @returns {DateInitialState}
 */
const dateInputReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_YEAR:
    case actionTypes.SET_MONTH:
    case actionTypes.SET_DAY:
    case actionTypes.SET_DATE:
    case actionTypes.CLEAR_DATE:
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

/**
 * Provides the date input context to its children components.
 * @param {object} props
 * @param {React.ReactNode} props.children
 */
export const DateInputProvider = ({ children }) => {
  const [dateState, dateDispatch] = useReducer(dateInputReducer, initialState);
  /** @type {ReactRef<Flag>} */
  const flagRef = useRef('');

  return (
    <DateInputContext
      value={{
        ...dateState,
        flagRef,
        dateDispatch,
      }}
    >
      {children}
    </DateInputContext>
  );
};

/**
 * Custom hook to use the DateInputContext.
 * Ensures the hook is used within an DateInputProvider.
 * @returns {DateContextType} The date input context value.
 * @throws {Error} If used outside of an DateInputProvider.
 */
export const useDateInput = () => {
  const context = use(DateInputContext);
  if (!context) {
    throw new Error('useDateInput must be used within an DateInputProvider');
  }
  return context;
};
