// src/components/Input/Star/StarHipInput.jsx
import React, { useEffect, useCallback, useRef } from 'react';
import { Box, Autocomplete, TextField, InputAdornment, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import Config from '@/Config';
import { useStarInput } from '@context/StarInputContext';
import * as actionTypes from '@context/starInputActionTypes';
import useDebouncedFetchNameSuggestions from '@hooks/useDebouncedFetchNameSuggestions';
import { HIP_MIN, HIP_MAX, HIP_OUT_OF_RANGE, HIP_NOT_FOUND } from '@utils/constants';
import { fetchAndCacheNames } from '@utils/fetchNameSuggestions';
import { constructNameZh } from '@utils/starInputUtils';

const hipStyle = { textAlign: 'left', mr: 1 };
const nameStyle = { textAlign: 'left', color: 'primary.main' };
const searchIconStyle = {
  color: "action.active",
  p: '2px',
};

const StarHipInput = ({ setErrorMessage }) => {
  const {
    searchTerm,
    suggestions,
    highlightedIndex,
    cachedNames,
    starError, starNullError,
    latestSuggestionRequest,
    isSelecting,
    lastSelectedTerm,
    starDispatch,
  } = useStarInput();
  const inputRef = useRef(null);

  /* Initialize */
  useEffect(() => {
    const fetchData = async () => {
      if (!cachedNames) {
        try {
          const data = await fetchAndCacheNames();
          starDispatch({ type: actionTypes.SET_CACHED_NAMES, payload: data });  // Cache the data
        } catch (error) {
          setErrorMessage((prev) => ({ ...prev, star: error.message }));
        }
      }
    };
    fetchData();
  }, [cachedNames, starDispatch, setErrorMessage]);

  /* Clear suggestions and reset highlightedIndex */
  useEffect(() => {
    if (!searchTerm) {
      starDispatch({ type: actionTypes.CLEAR_STAR_HIP_AND_NAME });
      starDispatch({ type: actionTypes.CLEAR_SUGGESTIONS });
      starDispatch({ type: actionTypes.CLEAR_HIGHLIGHTED_INDEX });
      lastSelectedTerm.current = '';
    }
  }, [searchTerm, lastSelectedTerm, starDispatch]);

  useEffect(() => {
    if (suggestions.length > 0) {
      if (suggestions[0].display_name === HIP_OUT_OF_RANGE) {
        starDispatch({ type: actionTypes.SET_STAR_HIP_ERROR, payload: `The Hipparcos Catalogue number must be in the range [${HIP_MIN}, ${HIP_MAX}].` });
        starDispatch({ type: actionTypes.CLEAR_SUGGESTIONS });
        starDispatch({ type: actionTypes.SET_STAR_VALID, payload: false });
        return;
      }
      if (suggestions[0].display_name === HIP_NOT_FOUND) {
        starDispatch({ type: actionTypes.SET_STAR_HIP_ERROR, payload: 'No match found.' });
        starDispatch({ type: actionTypes.CLEAR_SUGGESTIONS });
        starDispatch({ type: actionTypes.SET_STAR_VALID, payload: false });
        return;
      }
      inputRef.current.focus();
      /* Set highlightedIndex to 0 after fetching suggestions */
      if (highlightedIndex < 0) {
        starDispatch({ type: actionTypes.SET_HIGHLIGHTED_INDEX, payload: 0 });
      }
    }
  }, [suggestions, highlightedIndex, starDispatch]);

  const debouncedFetchNameSuggestions = useDebouncedFetchNameSuggestions(
    cachedNames,
    isSelecting,
    latestSuggestionRequest,
    actionTypes,
    starDispatch,
    setErrorMessage,
    Config.TypingDelay
  );

  /* Cleanup the debounced function on unmount */
  useEffect(() => {
    return () => {
      debouncedFetchNameSuggestions.cancel();
    };
  }, [debouncedFetchNameSuggestions]);

  const handleSearchChange = useCallback(
    (event, newSearchTerm) => {
      starDispatch({ type: actionTypes.SET_SEARCH_TERM, payload: newSearchTerm });
      const trimmedNewSearchTerm = newSearchTerm.trim();
      isSelecting.current = false;
      debouncedFetchNameSuggestions(trimmedNewSearchTerm);
      if (!trimmedNewSearchTerm) {
        starDispatch({ type: actionTypes.CLEAR_SEARCH_TERM });
      }
    },
    [isSelecting, starDispatch, debouncedFetchNameSuggestions]
  );

  const handleSelect = useCallback((event, value) => {
    if (!value || !value.hip || value.display_name === HIP_OUT_OF_RANGE || value.display_name === HIP_NOT_FOUND) {
      starDispatch({ type: actionTypes.CLEAR_STAR_HIP_AND_NAME });
      starDispatch({ type: actionTypes.SET_STAR_VALID, payload: false });
      starDispatch({ type: actionTypes.CLEAR_SEARCH_TERM });
      return;
    }

    const selectedSuggestion = suggestions.find(
      (suggestion) => suggestion.hip === value.hip
    );
    if (selectedSuggestion) {
      isSelecting.current = true;
      starDispatch({ type: actionTypes.SET_STAR_HIP, payload: selectedSuggestion.hip });
      starDispatch({ type: actionTypes.SET_STAR_NAME, payload: selectedSuggestion.name });
      starDispatch({ type: actionTypes.SET_STAR_NAME_ZH, payload: constructNameZh(selectedSuggestion) });
      starDispatch({ type: actionTypes.SET_SEARCH_TERM, payload: selectedSuggestion.display_name });
      starDispatch({ type: actionTypes.CLEAR_SUGGESTIONS });
      lastSelectedTerm.current = selectedSuggestion.display_name;
    }
  }, [suggestions, isSelecting, lastSelectedTerm, starDispatch]);

  const handleKeyDown = useCallback((event) => {
    if (event.key === 'Enter') {
      /* Prevent default 'Enter' behavior */
      event.defaultMuiPrevented = true;

      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        /* Select the highlighted suggestion */
        const highlightedSuggestion = suggestions[highlightedIndex];
        if (highlightedSuggestion.hip && highlightedSuggestion.display_name !== HIP_OUT_OF_RANGE) {
          isSelecting.current = true;
          starDispatch({ type: actionTypes.SET_STAR_HIP, payload: highlightedSuggestion.hip });
          starDispatch({ type: actionTypes.SET_STAR_NAME, payload: highlightedSuggestion.name });
          starDispatch({ type: actionTypes.SET_STAR_NAME_ZH, payload: constructNameZh(highlightedSuggestion) });
          starDispatch({ type: actionTypes.SET_SEARCH_TERM, payload: highlightedSuggestion.display_name });
          starDispatch({ type: actionTypes.CLEAR_SUGGESTIONS });
          lastSelectedTerm.current = highlightedSuggestion.display_name;
        }
      } else if (searchTerm !== lastSelectedTerm.current && searchTerm && suggestions.length === 0) {
        /* If failed to fetch suggestions due to any unknown reasons last time, fetch again */
        isSelecting.current = false;
        debouncedFetchNameSuggestions(searchTerm.trim());
      }
    }
  }, [searchTerm, suggestions, highlightedIndex, isSelecting, lastSelectedTerm, starDispatch, debouncedFetchNameSuggestions]);

  const handleHighlightChange = useCallback((event, option, reason) => {
    if (reason === 'keyboard' || reason === 'mouse') {
      const index = suggestions.findIndex((suggestion) => suggestion.hip === option.hip);
      starDispatch({ type: actionTypes.SET_HIGHLIGHTED_INDEX, payload: index });
    }
  }, [suggestions, starDispatch]);

  const handleBlur = useCallback(() => {
    if (searchTerm !== lastSelectedTerm.current) {
      if (
        searchTerm && suggestions.length > 0 &&
        suggestions[0].hip === searchTerm &&
        suggestions[0].display_name !== HIP_OUT_OF_RANGE &&  // redundant, suggestions have been cleared already
        suggestions[0].display_name !== HIP_NOT_FOUND  // redundant, suggestions have been cleared already
      ) {
        /* If the search term is a valid Hipparcos Catalogue number, set it */
        isSelecting.current = true;
        starDispatch({ type: actionTypes.SET_STAR_HIP, payload: suggestions[0].hip });
        starDispatch({ type: actionTypes.SET_STAR_NAME, payload: suggestions[0].name });
        starDispatch({ type: actionTypes.SET_STAR_NAME_ZH, payload: constructNameZh(suggestions[0]) });
        lastSelectedTerm.current = searchTerm;
      } else if (searchTerm) {
        if (suggestions.length > 0) {
          /* If no option has been selected, warn */
          starDispatch({ type: actionTypes.SET_STAR_HIP_ERROR, payload: 'Please select a star from the suggestions.' });
          starDispatch({ type: actionTypes.SET_STAR_VALID, payload: false });
        } else {
          /* If failed to fetch suggestions due to any unknown reasons last time, fetch again */
          isSelecting.current = false;
          debouncedFetchNameSuggestions(searchTerm.trim());
        }
      }
    }
  }, [searchTerm, lastSelectedTerm, suggestions, isSelecting, starDispatch, debouncedFetchNameSuggestions]);

  return (
    <Autocomplete
      freeSolo
      clearOnEscape
      autoHighlight
      disabled={!cachedNames}
      options={searchTerm.trim() ? suggestions : []}
      getOptionLabel={(option) => option.hip || option.display_name}
      inputValue={searchTerm}
      onInputChange={handleSearchChange}
      onChange={handleSelect}
      onKeyDown={handleKeyDown}
      onHighlightChange={handleHighlightChange}
      onBlur={handleBlur}
      filterOptions={(x) => x}
      loading={!cachedNames}
      renderOption={(props, option) => (
        <li
          {...props}
          key={option.hip}
          style={!option.hip || option.display_name === HIP_NOT_FOUND ? { pointerEvents: 'none', color: 'InactiveCaptionText', fontStyle: 'italic' } : {}}
        >
          <Box display="flex" alignItems="start" flexWrap="wrap">
            <Typography sx={hipStyle}>
              {option.hip}
            </Typography>
            {option.name && (
              <Typography sx={nameStyle}>
                {option.name_zh
                ? `(${option.name}/${option.name_zh})`
                : `(${option.name})`
                }
              </Typography>
            )}
          </Box>
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          required
          label="Search Hipparcos Catalogue number"
          placeholder="Enter a number or a name"
          size="small"
          variant="outlined"
          fullWidth
          error={!!starError.hip || !!starNullError.hip}
          helperText={starError.hip || starNullError.hip}
          inputRef={inputRef}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start" sx={{ ml: 0.5, mr: 0 }}>
                <SearchIcon size={20} sx={searchIconStyle} />
              </InputAdornment>
            ),
          }}
          InputLabelProps={{ shrink: true }}
          sx={{ marginTop: 2 }}
        />
      )}
    />
  );
};

export default React.memo(StarHipInput);
