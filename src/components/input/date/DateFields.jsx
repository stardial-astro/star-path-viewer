// src/components/input/date/DateFields.jsx
import {
  memo,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  useDeferredValue,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Grid } from '@mui/material';
import { useHome } from '@context/HomeContext';
import { useDateInput } from '@context/DateInputContext';
import { useLocationInput } from '@context/LocationInputContext';
import * as actionTypes from '@context/dateInputActionTypes';
import useDebounce from '@hooks/useDebounce';
import useFetchDate from '@/hooks/useFetchDate';
import config from '@utils/config';
import { EPH_RANGE, CALS } from '@utils/constants';
import { clampDateSync, clearDateError } from '@utils/dateInputUtils';
import CustomNumberField from '@components/ui/CustomNumberField';
import MonthInput from './MonthInput';

const YEAR_ID = 'year-input';
const DAY_ID = 'day-input';
const YEAR_NAME = 'year';
const DAY_NAME = 'day';
const YEAR_PLACEHOLDER = '±YYYY';
const DAY_PLACEHOLDER = 'DD';

const YEAR_MIN = EPH_RANGE.min[0];
const YEAR_MAX = EPH_RANGE.max[0];

const disabledStyle = {
  '& .MuiInputBase-root.Mui-disabled': {
    backgroundColor: 'action.hover',
  },
};

const DateFields = () => {
  // console.log('Rendering DateFields');
  const { t } = useTranslation('date');
  const { setErrorMessage } = useHome();
  const {
    date,
    flag,
    cal,
    dateFetching,
    dateError,
    dateNullError,
    dateDispatch,
  } = useDateInput();
  const { location } = useLocationInput();

  const yearError = dateError.year || dateNullError.year;
  const dayError = dateError.day || dateNullError.day;

  const isUserEditRef = useRef(false);

  /* Increase delay when flag is set */
  const dynamicDelay = flag
    ? config.TYPING_DELAY + 300
    : config.TYPING_DELAY / 2;
  const debouncedYear = useDebounce(date.year, dynamicDelay);
  const debouncedDay = useDebounce(date.day, config.TYPING_DELAY / 2);
  const debouncedFlag = useDebounce(flag, config.TYPING_DELAY / 2);
  const debouncedLat = useDebounce(location.lat, config.TYPING_DELAY + 300);
  const debouncedLng = useDebounce(location.lng, config.TYPING_DELAY + 300);

  const deferredCal = useDeferredValue(cal, CALS.gregorian);

  const { correctedDate, dateParams, hasCorrection } = useMemo(
    () =>
      clampDateSync(
        { year: debouncedYear, month: date.month, day: debouncedDay },
        deferredCal,
      ),
    [debouncedYear, date.month, debouncedDay, deferredCal],
  );

  /* Clear errors & null errors in each field when user starts typing date; reset validity */
  useEffect(() => {
    clearDateError(dateDispatch, setErrorMessage);
    if (date.year) {
      dateDispatch({ type: actionTypes.CLEAR_YEAR_NULL_ERROR });
    }
    /* Reset validity */
    dateDispatch({ type: actionTypes.SET_DATE_VALID, payload: true });
  }, [date.year, dateDispatch, setErrorMessage]);

  useEffect(() => {
    clearDateError(dateDispatch, setErrorMessage);
    if (date.month) {
      dateDispatch({ type: actionTypes.CLEAR_MONTH_NULL_ERROR });
    }
    /* Reset validity */
    dateDispatch({ type: actionTypes.SET_DATE_VALID, payload: true });
  }, [date.month, dateDispatch, setErrorMessage]);

  useEffect(() => {
    clearDateError(dateDispatch, setErrorMessage);
    if (date.day) {
      dateDispatch({ type: actionTypes.CLEAR_DAY_NULL_ERROR });
    }
    /* Reset validity */
    dateDispatch({ type: actionTypes.SET_DATE_VALID, payload: true });
  }, [date.day, dateDispatch, setErrorMessage]);

  /* Clamp date on change */
  useEffect(() => {
    if (!isUserEditRef.current || flag) return;
    isUserEditRef.current = false;
    if (hasCorrection) {
      dateDispatch({ type: actionTypes.SET_DATE, payload: correctedDate });
    }
  }, [flag, hasCorrection, correctedDate, dateDispatch]);

  /* Fetch date on debounced input change */
  useFetchDate(
    debouncedYear,
    debouncedFlag,
    debouncedLat,
    debouncedLng,
    location.tz,
    dateDispatch,
    setErrorMessage,
  );

  /** @type {(event: ReactChangeEvent | ChangeEvent) => void} */
  const handleInputChange = useCallback(
    (event) => {
      const { name, value } = event.target;
      isUserEditRef.current = true;
      // dateDispatch({
      //   type: actionTypes.SET_DATE,
      //   payload: { ...date, [name]: value },
      // });
      switch (name) {
        case 'year':
          dateDispatch({ type: actionTypes.SET_YEAR, payload: value });
          break;
        case 'month':
          dateDispatch({ type: actionTypes.SET_MONTH, payload: value });
          break;
        case 'day':
          dateDispatch({ type: actionTypes.SET_DAY, payload: value });
          break;
        default:
          return;
      }
    },
    [dateDispatch],
  );

  return (
    <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
      <Grid size={{ xs: 12, sm: 4 }}>
        <CustomNumberField
          id={YEAR_ID}
          label={t('year')}
          placeholder={`${YEAR_PLACEHOLDER} (${t('year_zero_is')})`}
          name={YEAR_NAME}
          value={date.year}
          onChange={handleInputChange}
          intOnly={true}
          min={YEAR_MIN}
          max={YEAR_MAX}
          allowOutOfRange={false}
          error={!!yearError || !!dateError.general}
          helperText={yearError ? t(yearError) : ''}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <MonthInput
          min={dateParams.monthMin}
          max={dateParams.monthMax}
          onChange={handleInputChange}
        />
      </Grid>
      <Grid size="grow">
        <CustomNumberField
          id={DAY_ID}
          label={t('day')}
          placeholder={DAY_PLACEHOLDER}
          name={DAY_NAME}
          value={date.day}
          onChange={handleInputChange}
          intOnly={true}
          min={dateParams.dayMin}
          max={dateParams.dayMax}
          allowOutOfRange={false}
          disabled={!!flag}
          loading={date.year && dateFetching}
          error={!!dayError}
          helperText={dayError ? t(dayError) : ''}
          sx={disabledStyle}
        />
      </Grid>
    </Grid>
  );
};

export default memo(DateFields);
