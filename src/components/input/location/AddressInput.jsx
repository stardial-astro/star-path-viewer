// src/components/input/location/AddressInput.jsx
import {
  memo,
  useState,
  useEffect,
  useCallback,
  useRef,
  useEffectEvent,
} from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Stack,
  Autocomplete,
  InputAdornment,
  CircularProgress,
  Typography,
  Tooltip,
  Chip,
} from '@mui/material';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import { useHome } from '@context/HomeContext';
import { useLocationInput } from '@context/LocationInputContext';
import { useDateInput } from '@context/DateInputContext';
import * as actionTypes from '@context/locationInputActionTypes';
import useFetchAddresses from '@/hooks/useFetchAddresses';
import useDebounce from '@hooks/useDebounce';
import config from '@utils/config';
import { LOC_INPUT_TYPES, LOC_UNKNOWN, LOC_UNKNOWN_ID } from '@utils/constants';
import fetchGps from '@/utils/fetchGps';
import { clearLocationError } from '@utils/locationInputUtils';
import { getIsDevMode } from '@utils/devMode';
import CustomTextField from '@components/ui/CustomTextField';
import CustomIconButton from '@/components/ui/CustomIconButton';

const GPS_LABEL = 'GPS';

const gpsIcon = (
  <GpsFixedIcon
    fontSize="small"
    sx={{
      cursor: 'pointer',
    }}
  />
);

const circularProgress = (
  <CircularProgress size={20} sx={{ color: 'action.disabled', mr: 1 }} />
);

const AddressInput = () => {
  // console.log('Rendering AddressInput');
  const { t } = useTranslation('location');
  const { offlineState, errorMessage, setErrorMessage } = useHome();
  const {
    setSkipTz,
    searchTerm,
    suggestions,
    gpsLoading,
    suggestionsLoading,
    locationError,
    locationNullError,
    geoService,
    locationInputTypeRef,
    resetLocationValues,
    locationDispatch,
  } = useLocationInput();
  const { flag } = useDateInput();

  /** @param {string} key */
  const te = (key) => (key ? t(key) : '');
  const tAddressError = te(locationError.address || locationNullError.address);

  const [open, setOpen] = useState(false);
  /* For refetching */
  const [refreshCount, setRefreshCount] = useState(0);
  /* Whether to skip fetching suggestions */
  const [skipFetch, setSkipFetch] = useState(true);
  /** Last selected trimmed display name, which is also set as the search term. */
  const lastSelectedTermRef = useRef('');
  /** @type {ReactRef<HTMLInputElement | null>} */
  const inputRef = useRef(null);

  /* Increase delay when chars < 3 */
  const dynamicDelay =
    config.TYPING_DELAY +
    (searchTerm.length > 0 && searchTerm.length < 3 ? 300 : 0);
  const debouncedSearchTerm = useDebounce(searchTerm, dynamicDelay);

  const onInit = useEffectEvent(() => {
    /* Clear errors */
    clearLocationError(locationDispatch, setErrorMessage);
    /* Clear null errors if no flag */
    if (!flag) {
      locationDispatch({ type: actionTypes.CLEAR_ADDRESS_NULL_ERROR });
      /* Reset validity */
      locationDispatch({ type: actionTypes.SET_LOCATION_VALID, payload: true });
    }
    /* Clear location and suggestions */
    resetLocationValues();
    /* Clearing debounced searchTerm also clears lastSelectedTermRef below */
  });

  /* Initialize */
  useEffect(() => {
    onInit();
  }, []);

  /* Clear errors & null errors when user starts typing in search bar; reset validity */
  useEffect(() => {
    clearLocationError(locationDispatch, setErrorMessage);
    if (searchTerm) {
      locationDispatch({ type: actionTypes.CLEAR_ADDRESS_NULL_ERROR });
      locationDispatch({ type: actionTypes.CLEAR_LOCATION_NULL_ERROR });
    }
    /* Reset validity */
    locationDispatch({ type: actionTypes.SET_LOCATION_VALID, payload: true });
  }, [searchTerm, locationDispatch, setErrorMessage]);

  /* Clear suggestions and lastSelectedTermRef if debounced searchTerm is cleared */
  useEffect(() => {
    if (!debouncedSearchTerm) {
      lastSelectedTermRef.current = '';
      locationDispatch({ type: actionTypes.CLEAR_SUGGESTIONS });
      if (locationInputTypeRef.current === LOC_INPUT_TYPES.addr) {
        /* When in address mode, also clear location */
        locationDispatch({ type: actionTypes.CLEAR_LOCATION });
      } else {
        /* When in coordinate mode, only clear id */
        locationDispatch({ type: actionTypes.SET_ID, payload: '' });
      }
    }
  }, [debouncedSearchTerm, locationInputTypeRef, locationDispatch]);

  /* Fetch suggestions on debounced searchTerm change */
  useFetchAddresses(
    debouncedSearchTerm,
    geoService,
    refreshCount,
    skipFetch,
    gpsLoading,
    locationDispatch,
    setErrorMessage,
  );

  /* Watch fetched suggestions and focus */
  useEffect(() => {
    /* If empty, skip */
    if (suggestions.length === 0) return;
    /* If have multiple options, focus and open options */
    if (suggestions.length > 1) inputRef.current?.focus();
  }, [suggestions, locationDispatch]);

  /**
   * Helper function to select the option.
   * - Sets `location` and `searchTerm`
   * - Updates `lastSelectedTermRef`
   * @type {(option: AddressItem) => void}
   */
  const selectOption = useCallback(
    (option) => {
      /* Skip if reverse geocoding failed (should already toggled to coordinate mode) */
      if (option.id === LOC_UNKNOWN_ID) return;
      /* If option is invalid, clear */
      if (!option.id) {
        locationDispatch({ type: actionTypes.CLEAR_SEARCH_TERM });
        locationDispatch({ type: actionTypes.CLEAR_LOCATION });
        locationDispatch({
          type: actionTypes.SET_LOCATION_VALID,
          payload: false,
        });
        locationDispatch({ type: actionTypes.CLEAR_SUGGESTIONS });
        return;
      }
      /* If valid, select this option */
      locationDispatch({
        type: actionTypes.SET_LOCATION,
        payload: {
          lat: option.lat,
          lng: option.lng,
          id: option.id,
        },
      });
      lastSelectedTermRef.current = option.display_name.trim();
      locationDispatch({
        type: actionTypes.SET_SEARCH_TERM,
        payload: option.display_name,
      });
      locationDispatch({ type: actionTypes.SET_LOCATION_VALID, payload: true });
      getIsDevMode() && console.debug('[Selected location]', option);
    },
    [locationDispatch],
  );

  /**
   * Fetches geolocation when GPS button is clicked.
   * - Takes over the searching
   * - Updates `lastSelectedTermRef`
   */
  const handleGpsClick = useCallback(async () => {
    /* Skip fetching if offline or no service defined */
    if (offlineState.dialogOpen || offlineState.dismissed || !geoService) {
      return null;
    }
    /* Do not fetch suggestions */
    setSkipFetch(true);
    /* Do not fetch tz using API */
    setSkipTz(true);
    /* Clear errors & null errors and suggestions */
    clearLocationError(locationDispatch, setErrorMessage);
    locationDispatch({ type: actionTypes.CLEAR_ADDRESS_NULL_ERROR });
    locationDispatch({ type: actionTypes.CLEAR_LOCATION_NULL_ERROR });
    locationDispatch({ type: actionTypes.CLEAR_SUGGESTIONS });
    /* Reset validity */
    locationDispatch({ type: actionTypes.SET_LOCATION_VALID, payload: true });
    /* Fetch geolocation and update location & searchTerm */
    const err = await fetchGps(
      geoService,
      lastSelectedTermRef,
      locationDispatch,
    );
    if (err) {
      setErrorMessage((prev) => ({ ...prev, location: err.message }));
    }
  }, [offlineState, geoService, setSkipTz, locationDispatch, setErrorMessage]);

  /**
   * Updates when `onInputChange` fires.
   * - `reason`: `'input'`, `'reset'`, `'clear'`, `'blur'`, `'selectOption'`, `'removeOption'`
   * - Only updates if user is actually typing (`reason` is not 'reset')
   *   and is not loading GPS
   * - Only fetches suggestions if user is typing and `value` is non-blank
   * @type {(event: ReactSyntheticEvent, value: string, reason: string) => void}
   */
  const handleInputChange = useCallback(
    (event, value, reason) => {
      /* Skip if triggered by programmatic change (select or hit Enter before fetching)
       * or GPS is loading (setting GPS result doesn't trigger this)
       */
      if ((reason !== 'input' && reason !== 'clear') || gpsLoading) return;
      /* Reset lastSelectedTermRef when typing */
      lastSelectedTermRef.current = '';
      /* Update searchTerm only when value is non-blank */
      if (value.trim()) {
        /* Ready to fetch suggestions */
        setSkipFetch(false);
        locationDispatch({
          type: actionTypes.SET_SEARCH_TERM,
          payload: value,
        });
      } else {
        /* Clear searchTerm and suggestions if value is blank */
        locationDispatch({ type: actionTypes.CLEAR_SEARCH_TERM });
        locationDispatch({ type: actionTypes.CLEAR_SUGGESTIONS });
      }
    },
    [gpsLoading, locationDispatch],
  );

  /**
   * Selects the option when `onChange` fires.
   * - `reason`: `'createOption'`, `'selectOption'`, `'removeOption'`, `'blur'`, `'clear'`
   * - If presses Enter but no data returned yet, `value` is a string, skips
   * - Set `location` and `searchTerm`
   * - Skips fetching suggestions
   * - Updates `lastSelectedTermRef`
   * - Clears suggestions
   * @type {(event: ReactSyntheticEvent, value: string | AddressItem | null, reason: string) => void}
   */
  const handleSelect = useCallback(
    (event, value, reason) => {
      /* Skip if not triggered by selecting an option */
      if (reason !== 'selectOption' || typeof value === 'string' || !value)
        return;
      /* Do not fetch suggestions */
      setSkipFetch(true);
      /* Ready to fetch tz */
      setSkipTz(false);
      selectOption(value);
      locationDispatch({ type: actionTypes.CLEAR_SUGGESTIONS });
    },
    [setSkipTz, selectOption, locationDispatch],
  );

  /** @type {(event: any) => void} */
  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === 'Enter') {
        /* If fetching or no results, prevent the default 'select' behavior */
        if (gpsLoading || suggestionsLoading || suggestions.length === 0) {
          event.defaultMuiPrevented = true;
        }
      }
    },
    [suggestions, gpsLoading, suggestionsLoading],
  );

  /** @type {() => void} */
  const handleBlur = useCallback(() => {
    const trimmedSearchTerm = searchTerm.trim();
    /* If fetching, searchTerm is blank, or selected, skip and close */
    if (
      gpsLoading ||
      suggestionsLoading ||
      !trimmedSearchTerm ||
      trimmedSearchTerm === lastSelectedTermRef.current ||
      /* Reverse geocoding failed (should already toggled to coordinate mode) */
      (suggestions.length > 0 && suggestions[0].display_name === LOC_UNKNOWN)
    ) {
      setOpen(false);
      return;
    }
    /* When loosing focus, auto-select or warn */
    if (suggestions.length > 0 && suggestions[0].display_name === searchTerm) {
      /* If the search term itself is a valid address, select this option and close */
      selectOption(suggestions[0]);
      setOpen(false);
    } else if (suggestions.length > 0) {
      /* If none has been selected, warn and set invalid */
      locationDispatch({
        type: actionTypes.SET_ADDRESS_ERROR,
        payload: 'errors:have_not_select_location',
      });
      locationDispatch({
        type: actionTypes.SET_LOCATION_VALID,
        payload: false,
      });
    } else if (
      !locationError.address &&
      !errorMessage.location &&
      !gpsLoading
    ) {
      // TODO: this should not happen
      /* If searchTerm is not empty but nothing returned yet for this new search
       * and not querying GPS, fetch again
       */
      lastSelectedTermRef.current = '';
      setSkipFetch(false);
      setRefreshCount((prev) => prev + 1);
      getIsDevMode() && console.debug('⚠️ Refetching locations...');
    }
  }, [
    searchTerm,
    suggestions,
    gpsLoading,
    suggestionsLoading,
    locationError,
    errorMessage,
    selectOption,
    locationDispatch,
  ]);

  /** @type {(event: ReactSyntheticEvent, reason: string) => void} */
  const handleClose = (event, reason) => {
    if (reason === 'blur') return;
    setOpen(false);
  };

  return (
    <Autocomplete
      freeSolo
      clearOnEscape
      autoHighlight
      openOnFocus
      disabled={!geoService}
      options={suggestions}
      getOptionLabel={(option) =>
        typeof option === 'string' ? option : option.display_name
      }
      inputValue={searchTerm}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      forcePopupIcon={suggestions.length > 0}
      open={open}
      onOpen={() => setOpen(true)}
      onClose={handleClose}
      onInputChange={handleInputChange}
      onChange={handleSelect}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      blurOnSelect="touch" // disable for mobile devices to hide the virtual keyboard
      filterOptions={(x) => x} // bypass MUI's internal filtering logic
      loading={suggestionsLoading}
      renderOption={({ key, ...props }, option) => (
        <li key={key} {...props}>
          <Stack
            direction="row"
            spacing={1}
            sx={{ width: '100%', justifyContent: 'space-between' }}
          >
            <Typography>{option.display_name}</Typography>
            <Box>
              {option.addresstype ? (
                <Chip
                  label={option.addresstype}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              ) : (
                ''
              )}
            </Box>
          </Stack>
        </li>
      )}
      renderInput={(params) => (
        <CustomTextField
          {...params}
          label={t('search_address')}
          placeholder={
            !geoService && !errorMessage.location
              ? t('checking_geocoding_service')
              : !geoService
                ? t('errors:unknown_service')
                : t('enter_a_place')
          }
          inputRef={inputRef}
          error={!!tAddressError}
          helperText={tAddressError}
          startAdornment={
            <InputAdornment position="start" sx={{ ml: 0.5, mr: -0.4 }}>
              {geoService && !suggestionsLoading && !gpsLoading ? (
                <Tooltip
                  describeChild
                  title={t('find_my_location')}
                  enterTouchDelay={0}
                  leaveTouchDelay={2000}
                >
                  <span>
                    <CustomIconButton
                      aria-label={GPS_LABEL}
                      edge="start"
                      onClick={handleGpsClick}
                      sx={{ py: 0.5 }}
                    >
                      {gpsIcon}
                    </CustomIconButton>
                  </span>
                </Tooltip>
              ) : (
                circularProgress
              )}
            </InputAdornment>
          }
        />
      )}
    />
  );
};

export default memo(AddressInput);
