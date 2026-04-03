// src/hooks/useFetchDate.js
import { useEffect } from 'react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import * as actionTypes from '@context/dateInputActionTypes';
import config from '@utils/config';
import {
  EPH_RANGE,
  SERVER_ERR_PREFIX,
  EPH_RANGE_ERR_PREFIX,
} from '@utils/constants';
import { dateToStr } from '@utils/dateUtils';
import { validateYearSync } from '@utils/dateInputUtils';
import fetchDate from '@utils/fetchDate';
import { getIsDevMode } from '@utils/devMode';

const QUERY_KEY = 'date';

/** dev: 5 minutes; prod: 1 hour */
const STALE_MS = getIsDevMode() ? 5 * 60_000 : 60 * 60_000;
/** 1 hour */
const GC_MS = 60 * 60_000;

const EPH_RANGE_ERR_G =
  EPH_RANGE_ERR_PREFIX +
  `${dateToStr({ dateArr: EPH_RANGE.min })}/${dateToStr({ dateArr: EPH_RANGE.max })} ` +
  '(Gregorian)';

/**
 * Calls `fetchDate` to fetch the equinox/solstice date.
 * - Skips fetching if the input is cleared
 * - If only `tz` is empty, ignores it since `tz` can be determined by the server
 * - Updates `date` on status change
 * - Clears `errorMessage.server`
 * Uses TanStack Query:
 * - Pauses while offline and resume/refetch when connectivity returns
 * - Automatic caching
 * - Prevents multiple identical requests
 * - Retries on error (delay with exponential backoff)
 * - Syncs `dateFetching`
 * @param {string} year
 * @param {Flag} flag
 * @param {string} lat
 * @param {string} lng
 * @param {string} tz
 * @param {ReactDispatch} dispatch
 * @param {ReactSetState<ErrorObj>} setErrorMessage
 */
const useFetchDate = (
  year,
  flag,
  lat,
  lng,
  tz,
  dispatch,
  setErrorMessage,
) => {
  const isYearValid = validateYearSync(year);
  const isEnabled = !!flag && !!year && !!lat && !!lng && isYearValid;
  const { data, error, isFetching } = useQuery({
    queryKey: [QUERY_KEY, year, flag, lat, lng, tz],
    queryFn: () => fetchDate(year, flag, lat, lng, tz),
    enabled: isEnabled,
    networkMode: 'online',
    staleTime: STALE_MS,
    gcTime: GC_MS,
    retry: (failureCount, error) => {
      if (axios.isCancel(error)) return false;
      return failureCount < config.MAX_RETRIES;
    },
    retryDelay: (attemptIndex) =>
      Math.min(config.RETRY_DELAY * 2 ** attemptIndex, config.RETRY_DELAY_MAX),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    /* Show the error if out of range */
    if (flag && !isYearValid) {
      dispatch({
        type: actionTypes.SET_GENERAL_DATE_ERROR,
        payload: EPH_RANGE_ERR_G,
      });
    }
  }, [isYearValid, flag, dispatch]);

  useEffect(() => {
    /* Sync loading state */
    dispatch({
      type: isFetching
        ? actionTypes.SET_DATE_FETCHING_ON
        : actionTypes.SET_DATE_FETCHING_OFF,
    });
  }, [isFetching, dispatch]);

  useEffect(() => {
    if (error) {
      let msg = error.message;
      if (msg.startsWith(SERVER_ERR_PREFIX)) {
        /* Show server errors */
        msg = msg.substring(SERVER_ERR_PREFIX.length).trim();
        setErrorMessage((prev) => ({ ...prev, server: msg }));
      } else {
        /* Show other errors and set invalid */
        setErrorMessage((prev) => ({ ...prev, date: msg }));
        dispatch({ type: actionTypes.SET_DATE_VALID, payload: false });
      }
    } else if (data) {
      /* Update state and skip any following validation */
      dispatch({ type: actionTypes.SET_DATE, payload: data });
      dispatch({ type: actionTypes.SET_DATE_VALID, payload: true });
      setErrorMessage((prev) => ({ ...prev, server: '' }));
    }
  }, [data, error, dispatch, setErrorMessage]);
};

export default useFetchDate;
