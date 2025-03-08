// src/components/Input/Date/DateFields.jsx
import React, { useCallback } from 'react';
import { Grid, TextField, MenuItem, InputAdornment, CircularProgress } from '@mui/material';
import { useDateInput } from '@context/DateInputContext';
import * as actionTypes from '@context/dateInputActionTypes';
import { MONTHS, QUERY_FROM_CHANGE } from '@utils/constants';

const DateFields = () => {
  const {
    date,
    flag,  // 've', 'ss', 'ae', 'ws'
    disabledMonths,
    lastDay,
    dateFetching,
    dateError, dateNullError,
    queryDateFromRef,
    dateDispatch,
  } = useDateInput();

  const handleInputChange = useCallback((event) => {
    const { name, value } = event.target;
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
    if (!flag) {
      dateDispatch({ type: actionTypes.SET_DATE_ADJUSTING_ON });
    } else {
      queryDateFromRef.current = QUERY_FROM_CHANGE;
      dateDispatch({ type: actionTypes.SET_DATE_FETCHING_ON });
    }
  }, [flag, dateDispatch, queryDateFromRef]);

  return (
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
          onWheel={(event) => event.target.blur()}
          fullWidth
          error={!!dateError.year || !!dateError.general || !!dateNullError.year}
          helperText={dateError.year || dateNullError.year}
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
          error={!!dateError.month || !!dateError.general || !!dateNullError.month}
          helperText={dateError.month || dateNullError.month}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: !flag ? null : '#f5f5f5',
            },
          }}
          InputProps={{
            endAdornment: date.year && dateFetching ? (
              <InputAdornment position="end" sx={{ mr: 2 }}>
                <CircularProgress size={20} sx={{ color: 'action.disabled' }} />
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
          onWheel={(event) => event.target.blur()}
          inputProps={{ min: 1, max: lastDay }}
          disabled={!!flag}
          fullWidth
          error={!!dateError.day || !!dateError.general || !!dateNullError.day}
          helperText={dateError.day || dateNullError.day}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: !flag ? null : '#f5f5f5',
            },
          }}
          InputProps={{
            endAdornment: date.year && dateFetching ? (
              <InputAdornment position="end">
                <CircularProgress size={20} sx={{ color: 'action.disabled' }} />
              </InputAdornment>
            ) : null,
          }}
        />
      </Grid>
    </Grid>
  );
};

export default React.memo(DateFields);
