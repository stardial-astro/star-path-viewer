// src/context/LocationInputContext.jsx
/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  use,
  useReducer,
  useState,
  useRef,
  useCallback,
} from 'react';
import { STORAGE_KEYS, LOC_INPUT_TYPES } from '@utils/constants';
import * as actionTypes from './locationInputActionTypes';

/** 1 hour */
const SERVICE_STALE_MS = 60 * 60_000;

/**
 * Loads the geocoding service name from `localStorage`.
 * @returns {GeoService | null} The geocoding service name, or `null` if stale or missing.
 */
const getInitialService = () => {
  const raw = localStorage.getItem(STORAGE_KEYS.service);
  if (!raw) return null;
  /** @type {{service: GeoService, timestamp: number}} */
  const { service, timestamp } = JSON.parse(raw);
  if (Date.now() - timestamp > SERVICE_STALE_MS) return null;
  console.debug('📦 [Geocoding service]', service, ' (from storage)');
  return service;
};

const initialService = getInitialService();

/** @type {React.Context<*>} */
const LocationInputContext = createContext(null);

/** @type {LocationInitialState} */
const initialState = {
  location: { lat: '', lng: '', id: '', tz: '' },
  locationInputType: LOC_INPUT_TYPES.addr,
  searchTerm: '',
  suggestions: [],
  gpsLoading: false,
  suggestionsLoading: false,
  locationError: { address: '', lat: '', lng: '' },
  locationNullError: { address: '', lat: '', lng: '' },
  locationValid: true,
};

/**
 * @param {LocationObj} state
 * @param {Action} action
 * @returns {LocationObj}
 */
const locationReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_LAT:
      return { ...state, lat: action.payload };
    case actionTypes.SET_LNG:
      return { ...state, lng: action.payload };
    case actionTypes.SET_ID:
      return { ...state, id: action.payload };
    case actionTypes.SET_TZ:
      return { ...state, tz: action.payload };
    case actionTypes.SET_LOCATION:
      return { ...state, ...action.payload };
    case actionTypes.CLEAR_LOCATION:
      return { lat: '', lng: '', id: '', tz: '' };
    default:
      return state;
  }
};

/**
 * @param {LocationErrorObj} state
 * @param {Action} action
 * @returns {LocationErrorObj}
 */
const locationErrorReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_ADDRESS_ERROR:
      return { ...state, address: action.payload };
    case actionTypes.SET_LAT_ERROR:
      return { ...state, lat: action.payload };
    case actionTypes.SET_LNG_ERROR:
      return { ...state, lng: action.payload };
    case actionTypes.SET_LOCATION_ERROR:
      return { ...state, ...action.payload };
    case actionTypes.CLEAR_LOCATION_ERROR:
      return { address: '', lat: '', lng: '' };
    default:
      return state;
  }
};

/**
 * @param {LocationNullErrorObj} state
 * @param {Action} action
 * @returns {LocationNullErrorObj}
 */
const locationNullErrorReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_ADDRESS_NULL_ERROR:
      return { ...state, address: 'errors:please_search_location' }; // i18n key
    case actionTypes.SET_LAT_NULL_ERROR:
      return { ...state, lat: 'errors:please_enter_latitude' }; // i18n key
    case actionTypes.SET_LNG_NULL_ERROR:
      return { ...state, lng: 'errors:please_enter_longitude' }; // i18n key
    case actionTypes.CLEAR_ADDRESS_NULL_ERROR:
      return { ...state, address: '' };
    case actionTypes.CLEAR_LAT_NULL_ERROR:
      return { ...state, lat: '' };
    case actionTypes.CLEAR_LNG_NULL_ERROR:
      return { ...state, lng: '' };
    case actionTypes.CLEAR_LOCATION_NULL_ERROR:
      return { address: '', lat: '', lng: '' };
    default:
      return state;
  }
};

/**
 * @param {LocationInitialState} state
 * @param {Action} action
 * @returns {LocationInitialState}
 */
const locationInputReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_LAT:
    case actionTypes.SET_LNG:
    case actionTypes.SET_ID:
    case actionTypes.SET_TZ:
    case actionTypes.SET_LOCATION:
    case actionTypes.CLEAR_LOCATION:
      return {
        ...state,
        location: locationReducer(state.location, action),
      };

    case actionTypes.SET_ADDRESS_ERROR:
    case actionTypes.SET_LAT_ERROR:
    case actionTypes.SET_LNG_ERROR:
    case actionTypes.SET_LOCATION_ERROR:
    case actionTypes.CLEAR_LOCATION_ERROR:
      return {
        ...state,
        locationError: locationErrorReducer(state.locationError, action),
      };

    case actionTypes.SET_ADDRESS_NULL_ERROR:
    case actionTypes.SET_LAT_NULL_ERROR:
    case actionTypes.SET_LNG_NULL_ERROR:
    case actionTypes.CLEAR_ADDRESS_NULL_ERROR:
    case actionTypes.CLEAR_LAT_NULL_ERROR:
    case actionTypes.CLEAR_LNG_NULL_ERROR:
    case actionTypes.CLEAR_LOCATION_NULL_ERROR:
      return {
        ...state,
        locationNullError: locationNullErrorReducer(
          state.locationNullError,
          action,
        ),
      };

    case actionTypes.SET_INPUT_TYPE:
      return { ...state, locationInputType: action.payload };

    case actionTypes.SET_SEARCH_TERM:
      return { ...state, searchTerm: action.payload };
    case actionTypes.CLEAR_SEARCH_TERM:
      return { ...state, searchTerm: '' };

    case actionTypes.SET_SUGGESTIONS:
      return { ...state, suggestions: action.payload };
    case actionTypes.CLEAR_SUGGESTIONS:
      return { ...state, suggestions: [] };

    case actionTypes.SET_GPS_LOADING_ON:
      return { ...state, gpsLoading: true };
    case actionTypes.SET_GPS_LOADING_OFF:
      return { ...state, gpsLoading: false };
    case actionTypes.SET_SUGGESTIONS_LOADING_ON:
      return { ...state, suggestionsLoading: true };
    case actionTypes.SET_SUGGESTIONS_LOADING_OFF:
      return { ...state, suggestionsLoading: false };
    case actionTypes.SET_LOCATION_VALID:
      return { ...state, locationValid: action.payload };

    default:
      return state;
  }
};

/**
 * Provides the location input context to its children components.
 * @param {object} props
 * @param {React.ReactNode} props.children
 */
export const LocationInputProvider = ({ children }) => {
  const [locationState, locationDispatch] = useReducer(
    locationInputReducer,
    initialState,
  );
  const [geoService, setGeoService] = useState(initialService);
  const [skipTz, setSkipTz] = useState(false);
  const locationInputTypeRef = useRef(LOC_INPUT_TYPES.addr);

  /**
   * Sets `geoService` and stores in `localStorage`.
   * @type {(service: GeoService | null, noLocal?: boolean) => void}
   */
  const updateService = useCallback((service, noLocal = false) => {
    setGeoService(service);
    if (!noLocal) {
      localStorage.setItem(
        STORAGE_KEYS.service,
        JSON.stringify({ service, timestamp: Date.now() }),
      );
    } else {
      localStorage.removeItem(STORAGE_KEYS.service);
    }
  }, []);

  /**
   * Clears location and suggestions.
   * @type {() => void}
   */
  const resetLocationValues = useCallback(() => {
    /* Clear location and suggestions */
    locationDispatch({ type: actionTypes.CLEAR_LOCATION });
    locationDispatch({ type: actionTypes.CLEAR_SEARCH_TERM });
    locationDispatch({ type: actionTypes.CLEAR_SUGGESTIONS });
  }, []);

  return (
    <LocationInputContext
      value={{
        ...locationState,
        geoService,
        skipTz,
        setSkipTz,
        setGeoService: updateService,
        locationInputTypeRef,
        resetLocationValues,
        locationDispatch,
      }}
    >
      {children}
    </LocationInputContext>
  );
};

/**
 * Custom hook to use the LocationInputContext.
 * Ensures the hook is used within an LocationInputProvider.
 * @returns {LocationContextType} The location input context value.
 * @throws {Error} If used outside of an LocationInputProvider.
 */
export const useLocationInput = () => {
  const context = use(LocationInputContext);
  if (!context) {
    throw new Error(
      'useLocationInput must be used within an LocationInputProvider',
    );
  }
  return context;
};
