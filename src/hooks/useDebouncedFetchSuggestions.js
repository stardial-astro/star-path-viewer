// src/hooks/useDebouncedFetchSuggestions.js
import { useMemo } from 'react';
import fetchSuggestions from '@utils/fetchSuggestions';
import debounce from 'lodash/debounce';

const useDebouncedFetchSuggestions = (
  serviceChosen,
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
              dispatch({ type: actionTypes.SET_SUGGESTIONS_LOADING_ON });
              const requestId = ++latestSuggestionRequest.current;  // Increment and capture the current request ID

              const suggestions = await fetchSuggestions(query, serviceChosen);

              /* Only update if this request is the latest one */
              if (requestId === latestSuggestionRequest.current) {
                dispatch({ type: actionTypes.SET_SUGGESTIONS, payload: suggestions });
              }
            } catch (error) {
              setErrorMessage((prev) => ({ ...prev, location: error.message }));
            } finally {
              dispatch({ type: actionTypes.SET_SUGGESTIONS_LOADING_OFF });
            }
          }
          isSelecting.current = false;
        },
        typingDelay
      ),
    [serviceChosen, isSelecting, latestSuggestionRequest, actionTypes, dispatch, setErrorMessage, typingDelay]
  );
};

export default useDebouncedFetchSuggestions;
