// src/components/Input/Location/AddressInput.js
import React, { useEffect, useCallback, useRef } from 'react';
import { Box, Stack, Autocomplete, TextField, IconButton, Tooltip, CircularProgress, InputAdornment, Typography, Chip } from '@mui/material';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import Config from '../../../Config';
import { useLocationInput } from '../../../context/LocationInputContext';
import * as actionTypes from '../../../context/locationInputActionTypes';
import useDebouncedFetchSuggestions from '../../../hooks/useDebouncedFetchSuggestions';
import { ADDR_UNKNOWN, ADDR_NOT_FOUND } from '../../../utils/constants';
import { fetchCurrentLocation } from '../../../utils/locationInputUtils';
import { clearLocationError } from '../../../utils/locationInputUtils';

const gpsBtnStyle = {
  color: "action.active",
  p: '2px',
  '&:hover': {
    color: 'primary.main',
  },
  cursor: 'pointer',
};

const AddressInput = ({ setErrorMessage }) => {
  const {
    searchTerm,
    suggestions,
    highlightedIndex,
    locationLoading,
    suggestionsLoading,
    locationError, locationNullError,
    serviceChosen,
    latestSuggestionRequest,
    isSelecting,
    lastSelectedTerm,
    locationDispatch,
  } = useLocationInput();
  const inputRef = useRef(null);

  /* Clear suggestions and reset highlightedIndex */
  useEffect(() => {
    if (!searchTerm) {
      locationDispatch({ type: actionTypes.CLEAR_LOCATION });
      locationDispatch({ type: actionTypes.CLEAR_SUGGESTIONS });
      locationDispatch({ type: actionTypes.CLEAR_HIGHLIGHTED_INDEX });
      lastSelectedTerm.current = '';
    }
  }, [searchTerm, lastSelectedTerm, locationDispatch]);

  useEffect(() => {
    if (suggestions.length > 0) {
      if (suggestions[0].display_name === ADDR_NOT_FOUND) {
        locationDispatch({ type: actionTypes.SET_ADDRESS_ERROR, payload: 'Location not found.' });
        locationDispatch({ type: actionTypes.CLEAR_SUGGESTIONS });
        locationDispatch({ type: actionTypes.SET_LOCATION_VALID, payload: false });
        return;
      }
      inputRef.current.focus();
      /* Set highlightedIndex to 0 after fetching suggestions */
      if (highlightedIndex < 0) {
        locationDispatch({ type: actionTypes.SET_HIGHLIGHTED_INDEX, payload: 0 });
      }
    }
  }, [suggestions, highlightedIndex, locationDispatch]);

  const handleGpsClick = useCallback(
    () => {
      clearLocationError(locationDispatch, setErrorMessage);
      locationDispatch({ type: actionTypes.CLEAR_SUGGESTIONS });
      locationDispatch({ type: actionTypes.CLEAR_HIGHLIGHTED_INDEX });
      fetchCurrentLocation(serviceChosen, lastSelectedTerm, locationDispatch, setErrorMessage);
    },
    [serviceChosen, lastSelectedTerm, locationDispatch, setErrorMessage]
  );

  const debouncedFetchSuggestions = useDebouncedFetchSuggestions(
    serviceChosen,
    isSelecting,
    latestSuggestionRequest,
    actionTypes,
    locationDispatch,
    setErrorMessage,
    Config.TypingDelay + 300
  );

  /* Cleanup the debounced function on unmount */
  useEffect(() => {
    return () => {
      debouncedFetchSuggestions.cancel();
    };
  }, [debouncedFetchSuggestions]);

  const handleSearchChange = useCallback(
    (event, newSearchTerm) => {
      locationDispatch({ type: actionTypes.SET_SEARCH_TERM, payload: newSearchTerm });
      const trimmedNewSearchTerm = newSearchTerm.trim();
      isSelecting.current = false;
      debouncedFetchSuggestions(trimmedNewSearchTerm);
      if (!trimmedNewSearchTerm) {
        locationDispatch({ type: actionTypes.CLEAR_SEARCH_TERM });
      }
    },
    [isSelecting, locationDispatch, debouncedFetchSuggestions]
  );

  const handleSelect = useCallback((event, value) => {
    if (!value || !value.id || value.id === ADDR_UNKNOWN || value.id === ADDR_NOT_FOUND) {
      locationDispatch({ type: actionTypes.CLEAR_LOCATION });
      locationDispatch({ type: actionTypes.SET_LOCATION_VALID, payload: false });
      locationDispatch({ type: actionTypes.CLEAR_SEARCH_TERM });
      return;
    }

    const selectedSuggestion = suggestions.find(
      (suggestion) => suggestion.id === value.id
    );
    if (selectedSuggestion) {
      isSelecting.current = true;
      locationDispatch({ type: actionTypes.SET_LOCATION, payload: {
        lat: selectedSuggestion.lat,
        lng: selectedSuggestion.lng,
        id: selectedSuggestion.id,
      } });
      locationDispatch({ type: actionTypes.SET_SEARCH_TERM, payload: selectedSuggestion.display_name });
      locationDispatch({ type: actionTypes.CLEAR_SUGGESTIONS });
      lastSelectedTerm.current = selectedSuggestion.display_name;
    }
  }, [suggestions, isSelecting, lastSelectedTerm, locationDispatch]);

  const handleKeyDown = useCallback((event) => {
    if (event.key === 'Enter') {
      /* Prevent default 'Enter' behavior */
      event.defaultMuiPrevented = true;

      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        /* Select the highlighted suggestion */
        const highlightedSuggestion = suggestions[highlightedIndex];
        if (highlightedSuggestion.id && highlightedSuggestion.id !== ADDR_UNKNOWN) {
          isSelecting.current = true;
          locationDispatch({ type: actionTypes.SET_LOCATION, payload: {
            lat: highlightedSuggestion.lat,
            lng: highlightedSuggestion.lng,
            id: highlightedSuggestion.id,
          } });
          locationDispatch({ type: actionTypes.SET_SEARCH_TERM, payload: highlightedSuggestion.display_name });
          locationDispatch({ type: actionTypes.CLEAR_SUGGESTIONS });
          lastSelectedTerm.current = highlightedSuggestion.display_name;
        }
      } else if (searchTerm !== lastSelectedTerm.current && searchTerm && suggestions.length === 0 && !locationLoading && !suggestionsLoading) {
        /* If failed to fetch suggestions due to any unknown reasons last time, fetch again */
        isSelecting.current = false;
        debouncedFetchSuggestions(searchTerm.trim());
      }
    }
  }, [searchTerm, suggestions, highlightedIndex, locationLoading, suggestionsLoading, isSelecting, lastSelectedTerm, locationDispatch, debouncedFetchSuggestions]);

  const handleHighlightChange = useCallback((event, option, reason) => {
    if (reason === 'keyboard' || reason === 'mouse') {
      const index = suggestions.findIndex((suggestion) => suggestion.id === option.id);
      locationDispatch({ type: actionTypes.SET_HIGHLIGHTED_INDEX, payload: index });
    }
  }, [suggestions, locationDispatch]);

  const handleBlur = useCallback(() => {
    if (searchTerm !== lastSelectedTerm.current) {
      if (
        searchTerm && suggestions.length > 0 &&
        suggestions[0].display_name === searchTerm &&
        suggestions[0].display_name !== ADDR_UNKNOWN &&
        suggestions[0].display_name !== ADDR_NOT_FOUND  // redundant, suggestions have been cleared already
      ) {
        /* If the search term is a valid address, set it */
        isSelecting.current = true;
        locationDispatch({ type: actionTypes.SET_LOCATION, payload: {
          lat: suggestions[0].lat,
          lng: suggestions[0].lng,
          id: suggestions[0].id,
        } });
        lastSelectedTerm.current = searchTerm;
      } else if (searchTerm) {
        if (suggestions.length > 0) {
          /* If no option has been selected, warn */
          locationDispatch({ type: actionTypes.SET_ADDRESS_ERROR, payload: 'Please select a location from the suggestions.' });
          locationDispatch({ type: actionTypes.SET_LOCATION_VALID, payload: false });
        } else {
          /* If failed to fetch suggestions due to any unknown reasons last time, fetch again */
          isSelecting.current = false;
          debouncedFetchSuggestions(searchTerm.trim());
        }
      }
    }
  }, [searchTerm, suggestions, isSelecting, lastSelectedTerm, locationDispatch, debouncedFetchSuggestions]);

  return (
    <Autocomplete
      freeSolo
      clearOnEscape
      autoHighlight
      openOnFocus
      disabled={!serviceChosen}
      options={searchTerm.trim() ? suggestions : []}
      getOptionLabel={(option) => option.display_name}
      inputValue={searchTerm}
      onInputChange={handleSearchChange}
      onChange={handleSelect}
      onKeyDown={handleKeyDown}
      onHighlightChange={handleHighlightChange}
      onBlur={handleBlur}
      filterOptions={(x) => x}
      loading={suggestionsLoading}
      renderOption={(props, option) => (
        <li
          {...props}
          key={option.id}
          style={!option.id || option.id === ADDR_UNKNOWN ? { pointerEvents: 'none', color: 'InactiveCaptionText', fontStyle: 'italic' } : {}}
        >
          <Stack direction="row" spacing={1} sx={{ width: '100%', justifyContent: 'space-between' }}>
            <Typography>
              {option.display_name}
            </Typography>
            <Box>
              {option.addresstype ? <Chip label={option.addresstype} size="small" color="primary" variant="outlined" /> : ''}
            </Box>
          </Stack>
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          required
          label="Search address"
          placeholder="Enter a place, city, county, state, or country"
          size="small"
          variant="outlined"
          fullWidth
          error={!!locationError.address || !!locationNullError.address}
          helperText={locationError.address || locationNullError.address}
          inputRef={inputRef}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start" sx={{ ml: 1, mr: -1 }}>
                {!suggestionsLoading && !locationLoading ? (
                  <Tooltip title="Find My Location">
                    <IconButton aria-label="GPS" edge="start" onClick={handleGpsClick}>
                      <GpsFixedIcon size={20} sx={gpsBtnStyle} />
                    </IconButton>
                  </Tooltip>
                ) : (
                  <CircularProgress size={20} sx={{ color: "action.disabled", mr: 1 }} />
                )}
              </InputAdornment>
            ),
          }}
        />
      )}
    />
  );
};

export default React.memo(AddressInput);
