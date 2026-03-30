// src/components/Input/Star/StarHipInput.jsx
import {
  memo,
  useState,
  useEffect,
  useCallback,
  useRef,
  useDeferredValue,
} from 'react';
import {
  Box,
  Autocomplete,
  InputAdornment,
  CircularProgress,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useHome } from '@context/HomeContext';
import { useStarInput } from '@context/StarInputContext';
import * as actionTypes from '@context/starInputActionTypes';
import useFetchHipList from '@hooks/useFetchHipList';
import useDebouncedFetchNameSuggestions from '@hooks/useDebouncedFetchNameSuggestions';
import { constructNameZh, clearStarError } from '@utils/starInputUtils';
import { getIsDevMode } from '@utils/devMode';
import CustomTextField from '@components/UI/CustomTextField';

const INPUT_LABEL = 'Search Hipparcos Catalogue number';
const SELECT_WARN = "You haven't select a star from the results.";
const PLACEHOLDER = 'Enter a number or a name';
const LOADING_TEXT = 'Loading data...';
const NO_DATA_TEXT = 'Data not loaded';

const hipStyle = { textAlign: 'left', mr: 1 };
const nameStyle = { textAlign: 'left', color: 'primary.main' };

const searchIcon = (
  <SearchIcon
    fontSize="small"
    sx={(theme) => ({
      color: theme.palette.action.active,
      ...theme.applyStyles('dark', {
        color: theme.palette.text.secondary,
      }),
    })}
  />
);

const circularProgress = (
  <CircularProgress size={20} sx={{ color: 'action.disabled', mr: 1 }} />
);

const StarHipInput = () => {
  // console.log('Rendering StarHipInput');
  const { errorMessage, setErrorMessage } = useHome();
  const {
    starHip,
    searchTerm,
    suggestions,
    hipList,
    setHipList,
    starError,
    starNullError,
    resetStarValues,
    starDispatch,
  } = useStarInput();

  const [open, setOpen] = useState(false);
  /* For refetching */
  const [refreshCount, setRefreshCount] = useState(0);
  /* Whether to skip fetching suggestions */
  const [skipFetch, setSkipFetch] = useState(true);
  const lastSelectedTermRef = useRef('');
  /** @type {ReactRef<HTMLInputElement | null>} */
  const inputRef = useRef(null);

  const deferredSearchTerm = useDeferredValue(searchTerm);

  const isLoading = !hipList && !errorMessage.star;

  /* Validate HIP during the render phase (skip if HIP is empty) */
  // const { isValid, invalidError } = useMemo(
  //   () =>
  //     !starHip
  //       ? {
  //           isValid: true,
  //           invalidError: { name: '', hip: '', ra: '', dec: '' },
  //         }
  //       : validateStarHipSync(starHip),
  //   [starHip],
  // );

  /* Update validation results */
  // useEffect(() => {
  //   starDispatch({ type: actionTypes.SET_STAR_VALID, payload: isValid });
  //   starDispatch({ type: actionTypes.SET_STAR_ERROR, payload: invalidError });
  // }, [isValid, invalidError, starDispatch]);

  /* Initialize */
  useEffect(() => {
    /* Clear errors & null errors */
    clearStarError(starDispatch, setErrorMessage);
    starDispatch({ type: actionTypes.CLEAR_STAR_NULL_ERROR });
  }, [resetStarValues, starDispatch, setErrorMessage]);

  useFetchHipList(hipList, setHipList, setErrorMessage);

  /* Clear errors & null errors when user starts typing in HIP search bar */
  useEffect(() => {
    clearStarError(starDispatch, setErrorMessage);
    if (starHip) {
      starDispatch({ type: actionTypes.CLEAR_STAR_HIP_NULL_ERROR });
    }
  }, [starHip, searchTerm, starDispatch, setErrorMessage]);

  /* Clear name, HIP, suggestions, RA/Dec, lastSelectedTermRef and resets validity
   * if deferred searchTerm is cleared
   */
  useEffect(() => {
    if (!deferredSearchTerm) {
      lastSelectedTermRef.current = '';
      resetStarValues();
    }
  }, [deferredSearchTerm, resetStarValues, starDispatch]);

  /* Fetch suggestions on deferred searchTerm change */
  useDebouncedFetchNameSuggestions(
    deferredSearchTerm,
    refreshCount,
    skipFetch,
    hipList,
    setHipList,
    starDispatch,
    setErrorMessage,
  );

  /* Watch fetched suggestions and focus */
  useEffect(() => {
    /* If empty, skip */
    if (suggestions.length === 0) return;
    /* If have multiple options, focus and open options */
    if (suggestions.length > 1) inputRef.current?.focus(); // TODO
  }, [suggestions, starDispatch]);

  /**
   * Helper function to select the option.
   * - Sets `starHip`, `starName`, `starHipZh`, and and `searchTerm`
   * - Updates `lastSelectedTermRef`
   * @type {(option: StarItem) => void}
   */
  const selectOption = useCallback(
    (option) => {
      /* If option is invalid, clear */
      if (!option.hip) {
        starDispatch({ type: actionTypes.CLEAR_SEARCH_TERM });
        starDispatch({ type: actionTypes.CLEAR_STAR_HIP_AND_NAME });
        starDispatch({ type: actionTypes.SET_STAR_VALID, payload: false });
        starDispatch({ type: actionTypes.CLEAR_SUGGESTIONS });
        return;
      }
      /* If valid, select this option */
      starDispatch({ type: actionTypes.SET_STAR_HIP, payload: option.hip });
      starDispatch({ type: actionTypes.SET_STAR_NAME, payload: option.name });
      starDispatch({
        type: actionTypes.SET_STAR_NAME_ZH,
        payload: constructNameZh(option),
      });
      lastSelectedTermRef.current = option.display_name;
      starDispatch({
        type: actionTypes.SET_SEARCH_TERM,
        payload: option.display_name,
      });
      getIsDevMode() && console.debug('[Selected star]', option);
    },
    [starDispatch],
  );

  /**
   * Updates when `onInputChange` fires.
   * - `reason`: `'input'`, `'reset'`, `'clear'`, `'blur'`, `'selectOption'`, `'removeOption'`
   * - Only updates if user is actually typing (`reason` is not 'reset')
   * - Only fetches suggestions if user is typing and `value` is non-blank
   * @type {(event: ReactSyntheticEvent, value: string, reason: string) => void}
   */
  const handleInputChange = useCallback(
    (event, value, reason) => {
      /* Skip if triggered by programmatic change (select or hit Enter before fetching) */
      if (reason !== 'input' && reason !== 'clear') return;
      /* Clear suggestions and lastSelectedTermRef before fetching */
      lastSelectedTermRef.current = '';
      starDispatch({ type: actionTypes.CLEAR_SUGGESTIONS });
      /* Update searchTerm only when value is non-blank */
      if (value.trim()) {
        /* Ready to fetch suggestions */
        setSkipFetch(false);
        starDispatch({
          type: actionTypes.SET_SEARCH_TERM,
          payload: value,
        });
      } else {
        /* Clear searchTerm if value is blank */
        starDispatch({ type: actionTypes.CLEAR_SEARCH_TERM });
      }
    },
    [starDispatch],
  );

  /**
   * Selects the option when `onChange` fires.
   * - `reason`: `'createOption'`, `'selectOption'`, `'removeOption'`, `'blur'`, `'clear'`
   * - If presses Enter but no data returned yet, `value` is a string, skips
   * - Set `location` and `searchTerm`
   * - Skips fetching suggestions
   * - Updates `lastSelectedTermRef`
   * - Clears suggestions
   * @type {(event: ReactSyntheticEvent, value: string | StarItem | null, reason: string) => void}
   */
  const handleSelect = useCallback(
    (event, value, reason) => {
      /* Skip if not triggered by selecting an option */
      if (reason !== 'selectOption' || typeof value === 'string' || !value)
        return;
      /* Do not fetch suggestions */
      setSkipFetch(true);
      selectOption(value);
      starDispatch({ type: actionTypes.CLEAR_SUGGESTIONS });
    },
    [selectOption, starDispatch],
  );

  /** @type {(event: any) => void} */
  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === 'Enter') {
        /* If no cached data or no results, prevent the default 'select' behavior */
        if (!hipList || suggestions.length === 0) {
          event.defaultMuiPrevented = true;
        }
      }
    },
    [hipList, suggestions],
  );

  /** @type {() => void} */
  const handleBlur = useCallback(() => {
    /* If no cached data, searchTerm is empty, or selected, skip and close */
    if (!hipList || !searchTerm || searchTerm === lastSelectedTermRef.current) {
      setOpen(false);
      return;
    }
    /* When loosing focus, auto-select or warn */
    if (suggestions.length > 0 && suggestions[0].hip === searchTerm) {
      /* If the search term itself is a valid HIP, select this option and close */
      selectOption(suggestions[0]);
      setOpen(false);
    } else if (suggestions.length > 0) {
      /* If none has been selected, warn and set invalid */
      starDispatch({
        type: actionTypes.SET_STAR_HIP_ERROR,
        payload: SELECT_WARN,
      });
      starDispatch({ type: actionTypes.SET_STAR_VALID, payload: false });
    } else if (!starError.hip && !errorMessage.star) {
      // TODO: this should not happen
      /* If searchTerm is not empty but nothing returned yet for this new search,
       * fetch again
       */
      lastSelectedTermRef.current = '';
      setSkipFetch(false);
      setRefreshCount((prev) => prev + 1);
      getIsDevMode() && console.debug('⚠️ Refetching stars...');
    }
  }, [
    searchTerm,
    suggestions,
    hipList,
    starError,
    errorMessage,
    selectOption,
    starDispatch,
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
      disabled={!hipList}
      options={suggestions}
      getOptionLabel={(option) =>
        typeof option === 'string' ? option : option.hip || option.display_name
      }
      inputValue={searchTerm}
      isOptionEqualToValue={(option, value) => option.hip === value.hip}
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
      loading={isLoading}
      sx={{ mt: 2 }}
      renderOption={({ key, ...props }, option) => (
        <li key={key} {...props}>
          <Box display="flex" alignItems="start" flexWrap="wrap">
            <Typography sx={hipStyle}>{option.hip}</Typography>
            {option.name && (
              <Typography sx={nameStyle}>
                {option.name_zh
                  ? `(${option.name}/${option.name_zh})`
                  : `(${option.name})`}
              </Typography>
            )}
          </Box>
        </li>
      )}
      renderInput={(params) => (
        <CustomTextField
          {...params}
          label={INPUT_LABEL}
          placeholder={
            isLoading ? LOADING_TEXT : !hipList ? NO_DATA_TEXT : PLACEHOLDER
          }
          inputRef={inputRef}
          error={!!starError.hip || !!starNullError.hip}
          helperText={starError.hip || starNullError.hip}
          startAdornment={
            <InputAdornment position="start" sx={{ ml: 0.9, mr: 0 }}>
              {isLoading ? circularProgress : searchIcon}
            </InputAdornment>
          }
        />
      )}
    />
  );
};

export default memo(StarHipInput);
