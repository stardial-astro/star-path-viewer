// src/components/Input/Date/DateInput.js
import React, { useEffect, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Stack, Typography } from '@mui/material';
import Config from '../../../Config';
import { useDateInput } from '../../../context/DateInputContext';
import * as actionTypes from '../../../context/dateInputActionTypes';
import useDebouncedFetchDate from '../../../hooks/useDebouncedFetchDate';
import { adjustDate, validateDateSync, clearDateError } from '../../../utils/dateInputUtils';
import CalendarToggle from './CalendarToggle';
import DateFields from './DateFields';
import QuickEntryAccordion from './QuickEntryAccordion';
import debounce from 'lodash/debounce';

const DateInput = ({ setErrorMessage, location }) => {
  // console.log('Rendering DateInput');
  const {
    date,
    flag,  // 've', 'ss', 'ae', 'ws'
    cal,  // '': Gregorian, 'j': Julian
    dateAdjusting,
    dateFetching,
    dateError,
    abortControllerRef,
    queryDateFromRef,  // 'click', 'change'
    latestDateRequest,
    dateDispatch,
  } = useDateInput();
  // const dateRef = useRef(date);
  // const flagRef = useRef(flag);
  const locationRef = useRef(location);

  /* Initialize */
  useEffect(() => {
    clearDateError(dateDispatch, setErrorMessage);
    dateDispatch({ type: actionTypes.CLEAR_DATE_NULL_ERROR });
    // const initialDate = {
    //   year: now.getFullYear().toString(),
    //   month: (now.getMonth() + 1).toString(),
    //   day: now.getDate().toString(),
    // };
    // dateDispatch({ type: actionTypes.SET_DATE, payload: initialDate });
    // dateRef.current = initialDate;
  }, [dateDispatch, setErrorMessage]);

  /* Reset error when user starts typing */
  useEffect(() => {
    clearDateError(dateDispatch, setErrorMessage);
    // if (date.year && date.month && date.day) {
    //   dateDispatch({ type: actionTypes.SET_DATE_VALID, payload: true });
    // }
  }, [date, flag, cal, dateDispatch, setErrorMessage]);

  useEffect(() => {
    dateDispatch({ type: actionTypes.CLEAR_YEAR_NULL_ERROR });
  }, [date.year, flag, cal, dateDispatch]);

  useEffect(() => {
    dateDispatch({ type: actionTypes.CLEAR_MONTH_NULL_ERROR });
  }, [date.month, flag, cal, dateDispatch]);

  useEffect(() => {
    dateDispatch({ type: actionTypes.CLEAR_DAY_NULL_ERROR });
  }, [date.day, flag, cal, dateDispatch]);

  // useEffect(() => {
  //   dateRef.current = date;
  // }, [date]);

  // useEffect(() => {
  //   flagRef.current = flag;
  // }, [flag]);

  useEffect(() => {
    if (
      locationRef.current.lat !== location.lat ||
      locationRef.current.lng !== location.lng ||
      locationRef.current.tz !== location.tz
    ) {
      if (flag) {
        queryDateFromRef.current = 'change';
        dateDispatch({ type: actionTypes.SET_DATE_FETCHING_ON });
      }
      locationRef.current = location;
    }
  }, [location, flag, queryDateFromRef, dateDispatch]);

  const debouncedFetchDate = useDebouncedFetchDate(
    abortControllerRef,
    latestDateRequest,
    queryDateFromRef,
    dateDispatch,
    setErrorMessage,
    Config.TypingDelay
  );

  const debouncedFetchDateDelayed = useDebouncedFetchDate(
    abortControllerRef,
    latestDateRequest,
    queryDateFromRef,
    dateDispatch,
    setErrorMessage,
    Config.TypingDelay + 300
  );

  const debouncedAdjustDate = useMemo(
    () => debounce(adjustDate, Config.TypingDelay),
    []
  );

  const debouncedValidateDate = useMemo(
    () =>
      debounce((date, flag, cal) => {
        const validationResult = validateDateSync(date, flag, cal);
        const isValid = !Object.values(validationResult).some((item) => !!item);
        dateDispatch({ type: actionTypes.SET_DATE_ERROR, payload: validationResult });
        if (!flag || (date.year && locationRef.current.lat && locationRef.current.lng)) {
          dateDispatch({ type: actionTypes.SET_DATE_VALID, payload: isValid });
        }
      }, Config.TypingDelay),
    [dateDispatch]
  );

  useEffect(() => {
    if (dateFetching) {  // Start fetching
      if (queryDateFromRef.current === 'click') {
        debouncedFetchDate(date, flag, locationRef);
      } else {
        debouncedFetchDateDelayed(date, flag, locationRef);
      }
    }
    /* Cleanup function */
    return () => {
      debouncedFetchDate.cancel();
      debouncedFetchDateDelayed.cancel();
    };
  }, [date, flag, dateFetching, queryDateFromRef, debouncedFetchDate, debouncedFetchDateDelayed]);

  useEffect(() => {
    if (dateAdjusting) {  // Start adjusting
      debouncedAdjustDate(date, cal, dateDispatch);
    }
    /* Cleanup function */
    return () => {
      debouncedAdjustDate.cancel();
    };
  }, [date, cal, dateAdjusting, debouncedAdjustDate, dateDispatch]);

  useEffect(() => {
    if (!dateAdjusting && !dateFetching && !abortControllerRef.current) {
      debouncedValidateDate(date, flag, cal);
    }
    /* Cleanup function */
    return () => {
      debouncedValidateDate.cancel();
    };
  }, [date, flag, cal, dateAdjusting, dateFetching, abortControllerRef, debouncedValidateDate]);

  return (
    <Stack direction="column">
      <div>
        <CalendarToggle />
        <DateFields />

        {dateError.general && (
          <Typography color="error" variant="body2" sx={{ marginTop: '4px', marginX: '14px', fontSize: 'caption.fontSize', textAlign: 'left' }}>
            {dateError.general}
          </Typography>
        )}
      </div>

      <div>
        <QuickEntryAccordion />
      </div>
    </Stack>
  );
};

DateInput.propTypes = {
  setErrorMessage: PropTypes.func.isRequired,
  location: PropTypes.shape({
    lat: PropTypes.string.isRequired,
    lng: PropTypes.string.isRequired,
  }).isRequired,
};

export default React.memo(DateInput);
