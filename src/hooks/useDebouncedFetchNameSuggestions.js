// src/hooks/useDebouncedFetchNameSuggestions.js
import { useMemo } from 'react';
import { fetchNameSuggestions } from '@utils/fetchNameSuggestions';
// import debounce from 'lodash/debounce';
import debounce from 'lodash-es/debounce';

const useDebouncedFetchNameSuggestions = (
  cachedNames,
  isSelecting,
  latestSuggestionRequest,
  actionTypes,
  dispatch,
  setErrorMessage,
  typingDelay
) => {
  return useMemo(
    () =>
      debounce(
        async (query) => {
          if (query && !isSelecting.current) {
            try {
              const requestId = ++latestSuggestionRequest.current;  // Increment and capture the current request ID

              const suggestions = await fetchNameSuggestions(query, cachedNames, dispatch);

              /* Only update if this request is the latest one */
              if (requestId === latestSuggestionRequest.current) {
                dispatch({ type: actionTypes.SET_SUGGESTIONS, payload: suggestions });
              }
            } catch (error) {
              setErrorMessage((prev) => ({ ...prev, star: error.message }));
            }
          }
          isSelecting.current = false;
        },
        typingDelay
      ),
    [cachedNames, isSelecting, latestSuggestionRequest, actionTypes, dispatch, setErrorMessage, typingDelay]
  );
};

export default useDebouncedFetchNameSuggestions;
