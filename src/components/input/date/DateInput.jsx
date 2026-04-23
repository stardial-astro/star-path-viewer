// src/components/input/date/DateInput.jsx
import { memo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Stack } from '@mui/material';
import { useHome } from '@context/HomeContext';
import { useDateInput } from '@context/DateInputContext';
import { useLocationInput } from '@context/LocationInputContext';
import * as actionTypes from '@context/dateInputActionTypes';
import * as locationActionTypes from '@context/locationInputActionTypes';
import { clearDateError } from '@utils/dateInputUtils';
import { isToday } from '@utils/devMode';
import ErrorHelperText from '@components/ui/ErrorHelperText';
import CalendarToggle from './CalendarToggle';
import DateFields from './DateFields';
import QuickEntryAccordion from './QuickEntryAccordion';

const DateInput = () => {
  // console.log('Rendering DateInput');
  const { t } = useTranslation('date');
  const { setErrorMessage } = useHome();
  const { flag, cal, dateError, dateDispatch } = useDateInput();
  const { locationDispatch } = useLocationInput();

  /* ------------------------------------------------------------------|
   * Initialize
   * ------------------------------------------------------------------|
   */
  useEffect(() => {
    /* Clear errors & null errors */
    clearDateError(dateDispatch, setErrorMessage);
    dateDispatch({ type: actionTypes.CLEAR_DATE_NULL_ERROR });
    /* Clear date */
    dateDispatch({ type: actionTypes.CLEAR_DATE });
    /* Reset validity */
    dateDispatch({ type: actionTypes.SET_DATE_VALID, payload: true });

    /* Set today's date */
    if (isToday) {
      const now = new Date();
      const initialDate = {
        year: now.getFullYear().toString(),
        month: (now.getMonth() + 1).toString(),
        day: now.getDate().toString(),
      };
      dateDispatch({ type: actionTypes.SET_DATE, payload: initialDate });
    }
  }, [dateDispatch, setErrorMessage]);

  /* ------------------------------------------------------------------|
   * Clear errors when user starts typing
   * ------------------------------------------------------------------|
   */
  /* [DateFields] Clear errors & null errors when user starts typing date; reset validity */

  /* Clear errors when toggles flag */
  useEffect(() => {
    clearDateError(dateDispatch, setErrorMessage);
    /* Only if no flag, clear date and location null errors; reset validity */
    if (!flag) {
      dateDispatch({ type: actionTypes.CLEAR_DATE_NULL_ERROR });
      locationDispatch({ type: locationActionTypes.CLEAR_ADDRESS_NULL_ERROR });
      locationDispatch({ type: locationActionTypes.CLEAR_LOCATION_NULL_ERROR });
      /* Reset validity */
      dateDispatch({ type: actionTypes.SET_DATE_VALID, payload: true });
      locationDispatch({
        type: locationActionTypes.SET_LOCATION_VALID,
        payload: true,
      });
    }
  }, [flag, dateDispatch, locationDispatch, setErrorMessage]);

  /* Clear errors & null errors when toggles calendar; reset validity */
  useEffect(() => {
    clearDateError(dateDispatch, setErrorMessage);
    dateDispatch({ type: actionTypes.CLEAR_DATE_NULL_ERROR });
    /* Reset validity */
    dateDispatch({ type: actionTypes.SET_DATE_VALID, payload: true });
  }, [cal, dateDispatch, locationDispatch, setErrorMessage]);

  /* ------------------------------------------------------------------|
   * Update refs
   * ------------------------------------------------------------------|
   */
  /* [QuickEntryAccordion] Update flagRef when toggles */

  /* ------------------------------------------------------------------|
   * Clear stale data & set defaults on input change
   * ------------------------------------------------------------------|
   */
  /* [CalendarToggle] When toggles calendar, KEEP the date values */
  /* [QuickEntryAccordion] When toggles flag, KEEP the date values
   * > If flag is set, force to select Gregorian immediately
   */

  /* ------------------------------------------------------------------|
   * Fetch data
   * ------------------------------------------------------------------|
   */
  /* [DateFields] Fetch date on debounced input change */

  return (
    <Stack direction="column">
      <div>
        <CalendarToggle />
        <DateFields />

        {dateError.general && (
          <ErrorHelperText variant="body2">
            {t(dateError.general)}
          </ErrorHelperText>
        )}
      </div>

      <div>
        <QuickEntryAccordion />
      </div>
    </Stack>
  );
};

export default memo(DateInput);
