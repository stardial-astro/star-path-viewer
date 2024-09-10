// src/components/Input/Date/CalendarToggle.js
import React, { useCallback } from 'react';
import { FormControl, RadioGroup, Radio } from '@mui/material';
import { useDateInput } from '../../../context/DateInputContext';
import * as actionTypes from '../../../context/dateInputActionTypes';
import CustomFormControlLabel from '../../UI/CustomFormControlLabel';
import { GREGORIAN, JULIAN } from '../../../utils/constants';

const CalendarToggle = () => {
  const {
    flag,  // 've', 'ss', 'ae', 'ws'
    cal,  // '': Gregorian, 'j': Julian
    dateDispatch,
  } = useDateInput();

  const handleCalChange = useCallback((event) => {
    /* Keep the date values */
    dateDispatch({ type: actionTypes.SET_CAL, payload: event.target.value });
    dateDispatch({ type: actionTypes.SET_DATE_ADJUSTING_ON });
  }, [dateDispatch]);

  return (
    <FormControl>
      <RadioGroup
        row
        sx={{ mt: -1, mb: 1, justifyContent: 'space-around' }}
        value={cal}
        onChange={handleCalChange}
      >
        <CustomFormControlLabel
          size="small"
          name="Gregorian"
          value=""
          control={<Radio />}
          label="Gregorian Calendar"
          checked={cal === GREGORIAN}
        />
        <CustomFormControlLabel
          size="small"
          name="Julian"
          value={JULIAN}
          control={<Radio disabled={!!flag} />}
          label="Julian Calendar"
          checked={cal === JULIAN}
        />
      </RadioGroup>
    </FormControl>
  );
};

export default React.memo(CalendarToggle);
