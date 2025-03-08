// src/hooks/useDebouncedFetchDate.js
import { useMemo } from 'react';
import { fetchDate } from '@utils/dateInputUtils';
import debounce from 'lodash/debounce';

const useDebouncedFetchDate = (
  abortControllerRef,
  latestDateRequest,
  queryDateFromRef,
  dateDispatch,
  setErrorMessage,
  typingDelay
) => {
  return useMemo(
    () =>
      debounce(
        async (date, flag, locationRef) => {
          // console.log("Last controller: ", abortControllerRef.current?.signal);
          if (abortControllerRef.current) {
            // console.log("Aborting...");
            abortControllerRef.current.abort();  // Cancel the previous request
          }
          const controller = new AbortController();
          // console.log("New controller: ", controller?.signal);
          abortControllerRef.current = controller;
          const requestId = ++latestDateRequest.current;  // Increment and capture the current request ID

          await fetchDate(
            date,
            flag,
            locationRef,
            dateDispatch,
            setErrorMessage,
            controller.signal,
            abortControllerRef,
            requestId,
            latestDateRequest
          );

          queryDateFromRef.current = '';
        },
        typingDelay
      ),
    [abortControllerRef, latestDateRequest, queryDateFromRef, dateDispatch, setErrorMessage, typingDelay]
  );
};

export default useDebouncedFetchDate;
