// src/components/LocationInput.js
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { Box, Stack, Grid, Autocomplete, TextField, Typography, ToggleButton, ToggleButtonGroup, InputAdornment, CircularProgress, IconButton, Chip, Snackbar, Alert, Tooltip } from '@mui/material';
// import SearchIcon from '@mui/icons-material/Search';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import Config from '../Config';
import debounce from 'lodash/debounce';
import { useService } from '../context/ServiceContext';
import determineService from '../utils/determineService';
import fetchGeolocation from '../utils/fetchGeolocation';
import fetchSuggestions from '../utils/fetchSuggestions';

const gpsBtnStyle = {
  color: "action.active",
  p: '2px',
  '&:hover': {
    color: 'primary.main',
  },
  cursor: 'pointer',
};

const fetchCurrentLocation = async (service, setSearchTerm, setLocation, setInputType, setLoadingLocation, setErrorMessage) => {
  try {
    setLoadingLocation(true);
    const locationData = await fetchGeolocation(service);
    if (locationData.display_name !== 'unknown') {
      setSearchTerm(locationData.display_name);
    }
    setLocation({
      lat: locationData.lat,
      lng: locationData.lng,
      id: locationData.id,
    });
    if (locationData.id === 'unknown') {
      setInputType('coordinates');
    }
  } catch (error) {
    setErrorMessage((prev) => ({ ...prev, location: error.message }));
  } finally {
    setLoadingLocation(false);
  }
};

/* Validate the location */
const validateLocationSync = (inputType, location) => {
  // console.log(location);
  let newLocationError = { address: '', lat: '', lng: '' };

  if (inputType === 'coordinates') {
    if (!/^-?\d*(\.\d+)?$/.test(location.lat)) {
      return { ...newLocationError, lat: 'The latitude must be a decimal.' };
    }
    if (!/^-?\d*(\.\d+)?$/.test(location.lng)) {
      return { ...newLocationError, lng: 'The longitude must be a decimal.' };
    }

    if (location.lat) {
      const lat = parseFloat(location.lat);
      if (lat < -90 || lat > 90) {
        return { ...newLocationError, lat: 'The latitude must be in the range [-90°, 90°].' };
      }
    }
    if (location.lng) {
      const lng = parseFloat(location.lng);
      if (lng < -180 || lng > 180) {
        return { ...newLocationError, lng: 'The longitude must be in the range [-180°, 180°].' };
      }
    }
  }

  return newLocationError;
};

const LocationInput = ({ onLocationChange, setErrorMessage, setLocationValid, fieldError, setFieldError }) => {
  // console.log('Rendering LocationInput');
  const [inputType, setInputType] = useState('address');  // 'address' or 'coordinates'
  const [location, setLocation] = useState({ lat: '', lng: '', id: '', tz: '' });  // 0: not-found, -1: unknown
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [locationError, setLocationError] = useState({ address: '', lat: '', lng: '' });
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const { serviceChosen, setServiceChosen } = useService();
  const latestTzRequest = useRef(0);
  const latestSuggestionRequest = useRef(0);
  const isSelecting = useRef(false);

  const clearError = useCallback(() => {
    setErrorMessage((prev) => ({ ...prev, location: '' }));
    setLocationError({ address: '', lat: '', lng: '' });
  }, [setErrorMessage]);

  /* Initialize */
  useEffect(() => {
    clearError();
    // setLoadingLocation(true);
    // fetchCurrentLocation(serviceChosen, setSearchTerm, setInputType, setLocation, setErrorMessage);
    // setLoadingLocation(false);
  }, [clearError]);

  useEffect(() => {
    onLocationChange({ ...location, type: inputType });
  }, [location, inputType, onLocationChange]);

  /* Reset error when user starts typing */
  useEffect(() => {
    clearError();
    /* Clear address and tz if lat or lng is empty */
    if (searchTerm.trim() && inputType === 'coordinates' && (!location.lat || !location.lng)) {
      setSearchTerm('');
      setSuggestions([]);
      setLocation((prev) => ({ ...prev, id: '', tz: '' }));
    }
  }, [searchTerm, location, inputType, clearError]);

  /* Clear tz if lat or lng is empty */
  useEffect(() => {
    if (location.tz && (!location.lat || !location.lng)) {
      setLocation((prev) => ({ ...prev, tz: '' }));
    }
  }, [location]);

  useEffect(() => {
    setFieldError((prev) => ({ ...prev, address: '' }));
  }, [searchTerm, inputType, setFieldError]);

  useEffect(() => {
    setFieldError((prev) => ({ ...prev, lat: '' }));
  }, [location.lat, inputType, setFieldError]);

  useEffect(() => {
    setFieldError((prev) => ({ ...prev, lng: '' }));
  }, [location.lng, inputType, setFieldError]);

  /* Choose geocoding service */
  useEffect(() => {
    const setService = async () => {
      if (serviceChosen === null) {
          const service = await determineService();
          setServiceChosen(service);
      }
    };
    setService();
  }, [serviceChosen, setServiceChosen]);

  /* Get timezone */
  useEffect(() => {
    const lat = parseFloat(location.lat);
    const lng = parseFloat(location.lng);
    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      const fetchTimeZone = async () => {
        const requestId = ++latestTzRequest.current; // Increment and capture the current request ID
        try {
          const [tz] = await window.GeoTZ.find(lat, lng);
          /* Only update if this request is the latest one */
          if (requestId === latestTzRequest.current) {
            setLocation((prev) => ({ ...prev, tz }));
          }
        } catch (error) {
          if (requestId === latestTzRequest.current) {
            setLocation((prev) => ({ ...prev, tz: '' }));
          }
        }
      };
      const debounceTimeout = setTimeout(fetchTimeZone, Config.TypingDelay / 2);
      /* Cleanup timeout on unmount or dependency change */
      return () => {
        clearTimeout(debounceTimeout);
      };
    }
  }, [location.lat, location.lng, setErrorMessage]);

  const handleGpsClick = useCallback(
    () => {
      clearError();
      setSuggestions([]);
      fetchCurrentLocation(serviceChosen, setSearchTerm, setLocation, setInputType, setLoadingLocation, setErrorMessage);
    },
    [serviceChosen, clearError, setErrorMessage]
  );

  const handleInputTypeChange = useCallback((event, newInputType) => {
    if (newInputType !== null) {
      setInputType(newInputType);
    }
  }, []);

  const handleInputChange = useCallback((event) => {
    const { name, value } = event.target;
    setLocation((prev) => ({ ...prev, [name]: value }));
  }, []);

  const debouncedFetchSuggestions = useMemo(
    () =>
      debounce(async (query, serviceChosen) => {
        if (!isSelecting.current) {
          try {
            setLoadingSuggestions(true);
            const requestId = ++latestSuggestionRequest.current; // Increment and capture the current request ID
            const suggestions = await fetchSuggestions(query, serviceChosen);
            /* Only update if this request is the latest one */
            if (requestId === latestSuggestionRequest.current) {
              setSuggestions(suggestions);
            }
          } catch (error) {
            setErrorMessage((prev) => ({ ...prev, location: error.message }));
          } finally {
            setLoadingSuggestions(false);
          }
        }
        isSelecting.current = false;
      }, Config.TypingDelay + 300),
    [setErrorMessage]
  );

  /* Cancel the debounce function when the component unmounts */
  useEffect(() => {
    return () => {
      debouncedFetchSuggestions.cancel();
    };
  }, [debouncedFetchSuggestions]);

  const debouncedValidateLocation = useMemo(
    () => debounce((inputType, location) => {
      const validationResult = validateLocationSync(inputType, location);
      const isValid = !Object.values(validationResult).some(item => !!item);
      setLocationError(validationResult);
      setLocationValid(isValid);
    }, Config.TypingDelay / 2),
    [setLocationValid]
  );

  useEffect(() => {
    debouncedValidateLocation(inputType, location);
    /* Cleanup function */
    return () => {
      debouncedValidateLocation.cancel();
    };
  }, [location, inputType, debouncedValidateLocation]);

  const handleSearchChange = useCallback(
    (event, newSearchTerm) => {
      const trimmedNewSearchTerm = newSearchTerm.trim() ? newSearchTerm: '';
      setSearchTerm(trimmedNewSearchTerm);
      if (trimmedNewSearchTerm) {
        debouncedFetchSuggestions(trimmedNewSearchTerm, serviceChosen);
      } else {
        setLocation({ lat: '', lng: '', id: 0, tz: '' });
        setSuggestions([]);
      }
    },
    [serviceChosen, debouncedFetchSuggestions]
  );

  const handleSelect = useCallback((event, value) => {
    if (!value || !value.id || value.id === 'unknown') {
      setLocation({ lat: '', lng: '', id: '', tz: '' });
      setLocationValid(false);
      setSearchTerm('');
      setSuggestions([]);
      return;
    }

    const selectedSuggestion = suggestions.find(
      (suggestion) => suggestion.id === value.id
    );
    if (selectedSuggestion) {
      isSelecting.current = true;
      setLocation({
        lat: selectedSuggestion.lat,
        lng: selectedSuggestion.lng,
        id: selectedSuggestion.id,
      });
      setSearchTerm(selectedSuggestion.display_name);
      setSuggestions([]);
    }
  }, [suggestions, setLocationValid]);

  const handleKeyDown = useCallback((event) => {
    if (event.key === 'Enter') {
      /* Prevent default 'Enter' behavior */
      event.defaultMuiPrevented = true;
      /* Select the highlighted suggestion */
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        const highlightedSuggestion = suggestions[highlightedIndex];
        if (highlightedSuggestion.id && highlightedSuggestion.id !== 'unknown') {
          isSelecting.current = true;
          setLocation({
            lat: highlightedSuggestion.lat,
            lng: highlightedSuggestion.lng,
            id: highlightedSuggestion.id,
          });
          setSearchTerm(highlightedSuggestion.display_name);
          setSuggestions([]);
        }
      }
    }
  }, [highlightedIndex, suggestions]);

  const handleHighlightChange = useCallback((event, option, reason) => {
    if (reason === 'keyboard' || reason === 'mouse') {
      const index = suggestions.findIndex((suggestion) => suggestion.id === option.id);
      setHighlightedIndex(index);
    }
  }, [suggestions]);

  const handleSnackbarClose = useCallback((event, reason) => {
    setLocation((prev) => ({ ...prev, id: '' }));
  }, [])

  return (
    <Stack direction="column" spacing={2}>
      <ToggleButtonGroup
        color="primary"
        size="small"
        value={inputType}
        exclusive
        onChange={handleInputTypeChange}
        aria-label="Input type"
        fullWidth
      >
        <ToggleButton value="address" aria-label="Search Address">
          Search Address
        </ToggleButton>
        <ToggleButton value="coordinates" aria-label="Enter Coordinates">
          Enter Coordinates
        </ToggleButton>
      </ToggleButtonGroup>

      {inputType === 'address' ? (
        <Autocomplete
          freeSolo
          clearOnEscape
          disabled={!serviceChosen}
          options={searchTerm.trim() ? suggestions : []}
          getOptionLabel={(option) => option.display_name}
          inputValue={searchTerm}
          onInputChange={handleSearchChange}
          onChange={handleSelect}
          onKeyDown={handleKeyDown}
          onHighlightChange={handleHighlightChange}
          filterOptions={(x) => x}
          autoHighlight
          loading={loadingSuggestions}
          renderOption={(props, option) => (
            <li
              {...props}
              key={option.id}
              style={!option.id || option.id === 'unknown' ? { pointerEvents: 'none', color: 'InactiveCaptionText', fontStyle: 'italic' } : {}}
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
              error={!!locationError.address || !!fieldError.address}
              helperText={locationError.address || fieldError.address}
              label="Search address"
              placeholder="Enter a place, city, county, state, or country"
              size="small"
              variant="outlined"
              fullWidth
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <InputAdornment position="start" sx={{ ml: 1, mr: -1 }}>
                    {!loadingSuggestions && !loadingLocation ? (
                      <Tooltip title="Find My Location">
                        <IconButton aria-label="gps" edge="start" onClick={handleGpsClick}>
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
      ) : (
        <div>
          <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
            <Grid item xs={12} sm={6} md={6}>
              <TextField
                required
                label="Latitude"
                placeholder="Enter the latitude in decimal degrees"
                size="small"
                variant="outlined"
                name="lat"
                value={location.lat}
                onChange={handleInputChange}
                type="number"
                inputProps={{ min: -90, max: 90 }}
                fullWidth
                error={!!locationError.lat || !!fieldError.lat}
                helperText={locationError.lat || fieldError.lat}
                InputProps={{
                  endAdornment: loadingLocation ? (
                    <InputAdornment position="end">
                      <CircularProgress size={20} sx={{ color: "action.disabled" }} />
                    </InputAdornment>
                  ) : null,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={6}>
              <TextField
                required
                label="Longitude"
                placeholder="Enter the longitude in decimal degrees"
                size="small"
                variant="outlined"
                name="lng"
                value={location.lng}
                onChange={handleInputChange}
                type="number"
                inputProps={{ min: -180, max: 180 }}
                fullWidth
                error={!!locationError.lng || !!fieldError.lng}
                helperText={locationError.lng || fieldError.lng}
                InputProps={{
                  endAdornment: loadingLocation ? (
                    <InputAdornment position="end">
                      <CircularProgress size={20} sx={{ color: "action.disabled" }} />
                    </InputAdornment>
                  ) : null,
                }}
              />
            </Grid>
          </Grid>
        </div>
      )}
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={location.id === 'unknown'}
        autoHideDuration={12000}
        onClose={handleSnackbarClose}
        sx={(theme) => ({
          boxShadow: theme.shadows[2],
        })}
      >
        <Alert severity="warning" sx={{ width: '100%', textAlign: 'left' }} onClose={handleSnackbarClose}>
          Sorry, we couldn't fetch the address, but you can use these coordinates for this location.
        </Alert>
      </Snackbar>
    </Stack>
  );
};

LocationInput.propTypes = {
  onLocationChange: PropTypes.func.isRequired,
  setErrorMessage: PropTypes.func.isRequired,
  setLocationValid: PropTypes.func.isRequired,
  fieldError: PropTypes.shape({
    address: PropTypes.string.isRequired,
    lat: PropTypes.string.isRequired,
    lng: PropTypes.string.isRequired,
  }).isRequired,
  setFieldError: PropTypes.func.isRequired,
};

export default React.memo(LocationInput);
