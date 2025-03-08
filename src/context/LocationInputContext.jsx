// src/context/LocationInputContext.jsx
import React, { createContext, useContext, useReducer, useRef } from 'react';
import { useService } from './ServiceContext';
import * as actionTypes from './locationInputActionTypes';
import { TYPE_ADDR } from '@utils/constants';

const LocationInputContext = createContext();

const initialState = {
  location: { lat: '', lng: '', id: '', tz: '' },  // id: ''(not-found), 'unknown'
  locationInputType: TYPE_ADDR,  // 'address', 'coordinates'
  searchTerm: '',
  suggestions: [],
  highlightedIndex: -1,
  locationLoading: false,
  suggestionsLoading: false,
  locationError: { address: '', lat: '', lng: '' },
  locationNullError: { address: '', lat: '', lng: '' },
  locationValid: true,
};

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
      return {
        ...state,
        ...action.payload,
      };
    case actionTypes.CLEAR_LOCATION:
      return { lat: '', lng: '', id: '', tz: '' };
    default:
      return state;
  }
};

const locationErrorReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_ADDRESS_ERROR:
      return { ...state, address: action.payload };
    case actionTypes.SET_LAT_ERROR:
      return { ...state, lat: action.payload };
    case actionTypes.SET_LNG_ERROR:
      return { ...state, lng: action.payload };
    case actionTypes.SET_LOCATION_ERROR:
      return {
        ...state,
        ...action.payload,
      };
    case actionTypes.CLEAR_LOCATION_ERROR:
      return { address: '', lat: '', lng: '' };
    default:
      return state;
  }
};

const locationNullErrorReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_ADDRESS_NULL_ERROR:
      return { ...state, address: 'Please search and select a location.' };
    case actionTypes.SET_LAT_NULL_ERROR:
      return { ...state, lat: 'Please enter a latitude.' };
    case actionTypes.SET_LNG_NULL_ERROR:
      return { ...state, lng: 'Please enter a longitude.' };
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
        locationNullError: locationNullErrorReducer(state.locationNullError, action),
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

    case actionTypes.SET_HIGHLIGHTED_INDEX:
      return { ...state, highlightedIndex: action.payload };
    case actionTypes.CLEAR_HIGHLIGHTED_INDEX:
      return { ...state, highlightedIndex: -1 };

    case actionTypes.SET_LOCATION_LOADING_ON:
      return { ...state, locationLoading: true };
    case actionTypes.SET_LOCATION_LOADING_OFF:
      return { ...state, locationLoading: false };
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

export const LocationInputProvider = ({ children }) => {
  const [locationState, locationDispatch] = useReducer(locationInputReducer, initialState);
  const { serviceChosen, setServiceChosen } = useService();
  const latestTzRequest = useRef(0);
  const latestSuggestionRequest = useRef(0);
  const isSelecting = useRef(false);
  const lastSelectedTerm = useRef(null);

  return (
    <LocationInputContext.Provider value={{
      ...locationState,
      serviceChosen, setServiceChosen,
      latestTzRequest, latestSuggestionRequest,
      isSelecting,
      lastSelectedTerm,
      locationDispatch,
    }}>
      {children}
    </LocationInputContext.Provider>
  );
};

export const useLocationInput = () => useContext(LocationInputContext);
