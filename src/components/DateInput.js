// src/components/DateInput.js
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Box, Stack, Grid, TextField, MenuItem, RadioGroup, Radio, FormControl, Typography, Accordion, AccordionSummary, AccordionDetails, InputAdornment, CircularProgress } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { MONTHS, EPH_DATE_MIN, EPH_DATE_MAX, EPH_DATE_MIN_JULIAN, EPH_DATE_MAX_JULIAN, EQX_SOL_NAMES } from '../utils/constants';
import { dateToStr } from '../utils/dateUtils';
import Config from '../Config';
import CustomToggleButton from './ui/CustomToggleButton';
import CustomFormControlLabel from './ui/CustomFormControlLabel';
import debounce from 'lodash/debounce';
import { fetchEquinoxSolstice } from '../utils/fetchEquinoxSolstice';

/* Get the date for the equinox/solstice of the given year */
const fetchDate = async (date, flag, locationRef, setDate, setFetching, setErrorMessage, setDateValid, signal, abortControllerRef, requestId, latestRequest) => {
  // console.log('Fetching date...', date.year, locationRef.current, flag);
  // const date = dateRef.current;
  // const flag = flagRef.current;
  const location = locationRef.current;
  if (!flag || !date.year || !location.lat || !location.lng || !location.tz) {
    setFetching(false);
    abortControllerRef.current = null;
    return;
  }

  const year = parseInt(date.year);

  if (year <= EPH_DATE_MIN[0] || year >= EPH_DATE_MAX[0]) {
    setFetching(false);
    abortControllerRef.current = null;
    return;
  }

  try {
    const { month: newMonth, day: newDay } = await fetchEquinoxSolstice(location.lat, location.lng, location.tz, year, flag, signal);
    if (requestId === latestRequest.current) {
      if (!newMonth || !newDay) {
        setErrorMessage((prev) => ({ ...prev, date: 'Unable to fetch the date.' }));
        setFetching(false);
        abortControllerRef.current = null;
        return;
      }
      
      const month = newMonth;
      const day = newDay;
      /* Reset month and day if needed */
      const newDate = {
        ...date,
        month: month.toString(),
        day: day.toString(),
      };
      setDate(newDate);
      setFetching(false);
      setDateValid(true);
      abortControllerRef.current = null;
    }
  } catch (error) {
    if (error.name !== 'CanceledError' && requestId === latestRequest.current) {
      setErrorMessage((prev) => ({ ...prev, date: error.message }));
      setFetching(false);
      abortControllerRef.current = null;
    }
    // else {
    //   console.log(`Request for ${date.year}-${flag} canceled.`);
    // }
  }
};

/* Adjust the date */
const adjustDate = (date, cal, setDate, setDisabledMonths, setLastDay, setAdjusting) => {
  // console.log('Adjusting...', date);
  // const date = dateRef.current;
  if (!date.year) {
    setAdjusting(false);
    return;
  }

  const year = parseInt(date.year);
  let month = parseInt(date.month) || 1;
  let day = parseInt(date.day) || 1;

  const ephDateMin = cal === 'j' ? EPH_DATE_MIN_JULIAN : EPH_DATE_MIN;
  const ephDateMax = cal === 'j' ? EPH_DATE_MAX_JULIAN : EPH_DATE_MAX;
  const newDisabledMonths = {};
  let dayMin = 1;
  let dayMax = 31;

  /* Reset the last day of a month */
  if (month === 2) {
    dayMax = (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) ? 29 : 28;
  } else if ([4, 6, 9, 11].includes(month)) {
    dayMax = 30;
  }

  /* Enable all month options */
  Object.keys(newDisabledMonths).forEach((key) => {
    newDisabledMonths[key] = false;
  });

  if (year === ephDateMin[0]) {
    /* Disable the month options before ephDateMin */
    for (let i = ephDateMin[1] - 1; i >= 1; i--) {
      newDisabledMonths[i] = true;
    }

    if (date.month && month <= ephDateMin[1]) {
      month = ephDateMin[1];
      dayMin = ephDateMin[2];
    }
  } else if (year === ephDateMax[0]) {
    /* Disable the month options after ephDateMax */
    for (let i = ephDateMax[1] + 1; i <= 12; i++) {
      newDisabledMonths[i] = true;
    }

    if (date.month && month >= ephDateMax[1]) {
      month = ephDateMax[1];
      dayMax = ephDateMax[2];
    } else if (month === ephDateMax[1]) {
      dayMax = ephDateMax[2];
    }
  }

  if (date.day && day < dayMin) {
    day = dayMin;
  }
  if (date.day && day > dayMax) {
    day = dayMax;
  }

  setDisabledMonths(newDisabledMonths);
  setLastDay(dayMax);

  /* Reset month and day if needed */
  if (month.toString() !== date.month || day.toString() !== date.day) {
    const newDate = {
      ...date,
      month: date.month ? month.toString() : '',
      day: date.day ? day.toString() : '',
    };
    setDate(newDate);
    // onDateChange(newDate);
  }
  setAdjusting(false);
};

/* Validate the date */
const validateDateSync = (date, flag, cal) => {
  // console.log('Validating...', date);
  let newDateError = { general: '', year: '', month: '', day: '' };
  const ephDateMin = cal === 'j' ? EPH_DATE_MIN_JULIAN : EPH_DATE_MIN;
  const ephDateMax = cal === 'j' ? EPH_DATE_MAX_JULIAN : EPH_DATE_MAX;

  for (let key of ['year', 'month', 'day']) {
    if (!/^-?\d*$/.test(date[key])) {
      return { ...newDateError, [key]: `The ${key} must be an integer.` };
    }
  }

  if (date.year) {
    const year = parseInt(date.year);
    const month = parseInt(date.month);
    const day = parseInt(date.day);

    if (
      (year < ephDateMin[0] ||
        (year === ephDateMin[0] && (flag ||
          month < ephDateMin[1] || (month === ephDateMin[1] && day < ephDateMin[2])))) ||
      (year > ephDateMax[0] ||
        (year === ephDateMax[0] && (flag ||
          month > ephDateMax[1] || (month === ephDateMax[1] && day > ephDateMax[2]))))
    ) {
      return { ...newDateError, general: `Out of the ephemeris date range: ${dateToStr({ date: ephDateMin })} \u2013 ${dateToStr({ date: ephDateMax })} (${cal === 'j' ? 'Julian' : 'Gregorian'})` };
    }
  }

  return newDateError;
};

const DateInput = ({ onDateChange, setErrorMessage, setDateValid, fieldError, setFieldError, location }) => {
  // console.log('Rendering DateInput');
  const [date, setDate] = useState({ year: '', month: '', day: '' });
  const [flag, setFlag] = useState('');
  const [cal, setCal] = useState('');  // '': Gregorian, 'j': Julian
  const [disabledMonths, setDisabledMonths] = useState({});
  const [lastDay, setLastDay] = useState(31);
  const [adjusting, setAdjusting] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [dateError, setDateError] = useState({ general: '', year: '', month: '', day: '' });
  // const dateRef = useRef(date);
  // const flagRef = useRef(flag);
  const locationRef = useRef(location);
  const abortControllerRef = useRef(null);
  const fetchingFromRef = useRef('');  // 'click', 'change'
  const latestRequest = useRef(0);

  const clearError = useCallback(() => {
    setErrorMessage((prev) => ({ ...prev, date: '' }));
    setDateError({ general: '', year: '', month: '', day: '' });
  }, [setErrorMessage]);

  /* Initialize */
  useEffect(() => {
    clearError();
    // const now = new Date();
    // const initialDate = {
    //   year: now.getFullYear().toString(),
    //   month: (now.getMonth() + 1).toString(),
    //   day: now.getDate().toString(),
    // };
    // setDate(initialDate);
    // dateRef.current = initialDate;
  }, [clearError]);

  useEffect(() => {
    if (!adjusting && !fetching) {
      onDateChange({ ...date, flag, cal });
    }
  }, [date, flag, cal, onDateChange, adjusting, fetching]);

  /* Reset error when user starts typing */
  useEffect(() => {
    clearError();
    // if (date.year && date.month && date.day) {
    //   setDateValid(true);
    // }
  }, [date, flag, cal, clearError]);

  useEffect(() => {
    setFieldError((prev) => ({ ...prev, year: '' }));
  }, [date.year, flag, cal, setFieldError]);

  useEffect(() => {
    setFieldError((prev) => ({ ...prev, month: '' }));
  }, [date.month, flag, cal, setFieldError]);

  useEffect(() => {
    setFieldError((prev) => ({ ...prev, day: '' }));
  }, [date.day, flag, cal, setFieldError]);

  // useEffect(() => {
  //   dateRef.current = date;
  // }, [date]);

  // useEffect(() => {
  //   flagRef.current = flag;
  // }, [flag]);

  useEffect(() => {
    if (locationRef.current.lat !== location.lat || locationRef.current.lng !== location.lng || locationRef.current.tz !== location.tz) {
      if (flag) {
        fetchingFromRef.current = 'change';
        setFetching(true);
      }
      locationRef.current = location;
    }
  }, [location, flag]);

  const handleCalChange = useCallback((event) => {
    /* Keep the date values */
    setCal(event.target.value);
  }, []);

  const handleFlagChange = useCallback((event, newFlag) => {
    if (flag === newFlag) {
      setFlag('');  // deselect
      // onDateChange({ ...date, flag: '' });
    } else {
      setFlag(newFlag);  // select another
      if (newFlag) {
        fetchingFromRef.current = 'click';
        setFetching(true);
        setDateValid(false);
        setCal('');  // Force to use Gregorian
        // onDateChange({ ...date, flag: newFlag, cal: '' });
      }
      // else {
      //   onDateChange({ ...date, flag: newFlag });
      // }
    }
  }, [flag, setDateValid]);

  const handleInputChange = useCallback((event) => {
    const { name, value } = event.target;
    setDate((prev) => ({ ...prev, [name]: value }));
    if (!flag) {
      setAdjusting(true);
    } else {
      fetchingFromRef.current = 'change';
      setFetching(true);
      // setDateValid(false);
    }
  }, [flag]);

  const debouncedFetchDate = useMemo(
    () => debounce(async (date, flag, locationRef, setDate, setFetching, setErrorMessage, setDateValid) => {
      // console.log("Last controller: ", abortControllerRef.current?.signal);
      if (abortControllerRef.current) {
        // console.log("Aborting...");
        abortControllerRef.current.abort();  // Cancel the previous request
      }
      const controller = new AbortController();
      // console.log("New controller: ", controller?.signal);
      abortControllerRef.current = controller;
      const requestId = ++latestRequest.current; // Increment and capture the current request ID
      await fetchDate(date, flag, locationRef, setDate, setFetching, setErrorMessage, setDateValid, controller.signal, abortControllerRef, requestId, latestRequest);
      fetchingFromRef.current = '';
    }, Config.TypingDelay),
    []
  );

  const debouncedFetchDateDelayed = useMemo(
    () => debounce(async (date, flag, locationRef, setDate, setFetching, setErrorMessage, setDateValid) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();  // Cancel the previous request
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;
      const requestId = ++latestRequest.current; // Increment and capture the current request ID
      await fetchDate(date, flag, locationRef, setDate, setFetching, setErrorMessage, setDateValid, controller.signal, abortControllerRef, requestId, latestRequest);
    }, Config.TypingDelay + 300),
    []
  );

  const debouncedAdjustDate = useMemo(
    () => debounce(adjustDate, Config.TypingDelay),
    []
  );

  const debouncedValidateDate = useMemo(
    () => debounce((date, flag, cal) => {
      const validationResult = validateDateSync(date, flag, cal);
      const isValid = !Object.values(validationResult).some(item => !!item);
      setDateError(validationResult);
      if (!flag || (date.year && locationRef.current.lat && locationRef.current.lng)) {
        setDateValid(isValid);
      }
    }, Config.TypingDelay),
    [setDateValid]
  );

  useEffect(() => {
    if (fetching) {  // start fetching
      if (fetchingFromRef.current === 'click') {
        debouncedFetchDate(date, flag, locationRef, setDate, setFetching, setErrorMessage, setDateValid);
      } else {
        debouncedFetchDateDelayed(date, flag, locationRef, setDate, setFetching, setErrorMessage, setDateValid);
      }
    }
    /* Cleanup function */
    return () => {
      debouncedFetchDate.cancel();
    };
  }, [date, flag, fetching, debouncedFetchDate, debouncedFetchDateDelayed, setErrorMessage, setDateValid]);

  useEffect(() => {
    if (adjusting) {  // start adjusting
      debouncedAdjustDate(date, cal, setDate, setDisabledMonths, setLastDay, setAdjusting);
    }
    /* Cleanup function */
    return () => {
      debouncedAdjustDate.cancel();
    };
  }, [date, cal, adjusting, debouncedAdjustDate]);

  useEffect(() => {
    if (!adjusting && !fetching && !abortControllerRef.current) {
      debouncedValidateDate(date, flag, cal);
    }
    /* Cleanup function */
    return () => {
      debouncedValidateDate.cancel();
    };
  }, [date, flag, cal, adjusting, fetching, debouncedValidateDate]);

  return (
    <Stack direction="column">
      <div>
        <FormControl>
          <RadioGroup
            row
            sx={{ marginTop: -1, marginBottom: 1, justifyContent: 'space-around' }}
            value={cal}
            onChange={handleCalChange}
          >
            <CustomFormControlLabel
              size="small"
              value=""
              control={<Radio />}
              label="Gregorian Calendar"
              checked={cal === ''}
            />
            <CustomFormControlLabel
              size="small"
              value="j"
              control={<Radio disabled={!!flag} />}
              label="Julian Calendar"
              checked={cal === 'j'}
            />
          </RadioGroup>
        </FormControl>

        <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
          <Grid item xs={12} sm={4} md={4}>
            <TextField
              required
              label="Year"
              size="small"
              variant="outlined"
              name="year"
              type="number"
              value={date.year}
              inputProps={{ min: -5000, max: 5000 }}
              onChange={handleInputChange}
              fullWidth
              error={!!dateError.year || !!fieldError.year}
              helperText={dateError.year || fieldError.year}
            />
          </Grid>
          <Grid item xs={12} sm={4} md={4}>
            <TextField
              required
              select
              label="Month"
              InputLabelProps={{ htmlFor: 'month-select' }}
              inputProps={{ id: 'month-select' }}
              size="small"
              variant="outlined"
              name="month"
              value={date.month}
              onChange={handleInputChange}
              disabled={!!flag}
              fullWidth
              error={!!dateError.month || !!fieldError.month}
              helperText={dateError.month || fieldError.month}
              sx={{
                '& .MuiOutlinedInput-root': {
                  'backgroundColor': !flag ? null : '#f5f5f5',
                },
              }}
              InputProps={{
                endAdornment: date.year && fetching ? (
                  <InputAdornment position="end" sx={{ mr: 2 }}>
                    <CircularProgress size={20} sx={{ color: "action.disabled" }} />
                  </InputAdornment>
                ) : null,
              }}
            >
              <MenuItem key="none" value="" sx={{ color: 'action.active' }}>-- Select a month --</MenuItem>
              {MONTHS.slice(1).map((month, index) => (
                <MenuItem key={index} value={(index + 1).toString()} disabled={!!disabledMonths[index + 1]}>
                  {month.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4} md={4}>
            <TextField
              required
              label="Day"
              size="small"
              variant="outlined"
              name="day"
              type="number"
              value={date.day}
              onChange={handleInputChange}
              inputProps={{ min: 1, max: lastDay }}
              disabled={!!flag}
              fullWidth
              error={!!dateError.day || !!fieldError.day}
              helperText={dateError.day || fieldError.day}
              sx={{
                '& .MuiOutlinedInput-root': {
                  'backgroundColor': !flag ? null : '#f5f5f5',
                },
              }}
              InputProps={{
                endAdornment: date.year && fetching ? (
                  <InputAdornment position="end">
                    <CircularProgress size={20} sx={{ color: "action.disabled" }} />
                  </InputAdornment>
                ) : null,
              }}
            />
          </Grid>
        </Grid>

        {dateError.general && (
          <Typography color="error" variant="body2" sx={{ marginTop: '4px', marginX: '14px', fontSize: '0.85rem', textAlign: 'left' }}>
            {dateError.general}
          </Typography>
        )}
      </div>

      <div>
        <Accordion defaultExpanded disableGutters>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: 'primary.main' }} />}
            sx={{
              minHeight: 0,
              '& .MuiAccordionSummary-content': {
                'marginY': 1,
              }
            }}
          >
            <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} alignItems="flex-start" pr={1} flexWrap="wrap">
              <Box flex="1 0 auto" textAlign="left" mr={1}>
                <Typography color="primary" variant="body1">
                  Quick Entry
                </Typography>
              </Box>
              {/* {date.year && fetching && (
                <Box display="flex" alignItems="center" textAlign="left" flexWrap="wrap">
                  <Typography color="action.active" variant="body1">
                    &gt; Quering the {EQX_SOL_NAMES[flag]} of this year at this location ...
                  </Typography>
                </Box>
              )} */}
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ paddingX: 1.5, paddingTop: 0, paddingBottom: 1.5 }}>
            <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
              {Object.entries(EQX_SOL_NAMES).map(([key, value]) => (
                <Grid item xs={12} sm={6} md={3} key={key}>
                  <CustomToggleButton
                    color="primary"
                    size="small"
                    aria-label={value}
                    value={key}
                    selected={flag === key}
                    onChange={handleFlagChange}
                    fullWidth
                  >
                    {value}
                  </CustomToggleButton>
                </Grid>
              ))}
            </Grid>
          </AccordionDetails>
        </Accordion>
      </div>
    </Stack>
  );
};

DateInput.propTypes = {
  onDateChange: PropTypes.func.isRequired,
  setErrorMessage: PropTypes.func.isRequired,
  setDateValid: PropTypes.func.isRequired,
  fieldError: PropTypes.shape({
    year: PropTypes.string.isRequired,
    month: PropTypes.string.isRequired,
    day: PropTypes.string.isRequired,
  }).isRequired,
  setFieldError: PropTypes.func.isRequired,
  location: PropTypes.shape({
    lat: PropTypes.string.isRequired,
    lng: PropTypes.string.isRequired,
  }).isRequired,
};

export default React.memo(DateInput);
