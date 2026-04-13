// src/components/input/date/CalendarToggle.jsx
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FormControl, RadioGroup, Radio, Tooltip } from '@mui/material';
import { useDateInput } from '@context/DateInputContext';
import * as actionTypes from '@context/dateInputActionTypes';
import { EPH_RANGE, EPH_RANGE_JULIAN, CALS } from '@utils/constants';
import { dateToStr } from '@utils/dateUtils';
import CustomFormControlLabel from '@components/ui/CustomFormControlLabel';

const CAL_GROUP_NAME = 'calender-radio-group';

const G_NAME = 'gregorian';
const J_NAME = 'julian';

const CalendarToggle = () => {
  // console.log('Rendering CalendarToggle');
  const { t } = useTranslation('date');
  const { flag, cal, dateDispatch } = useDateInput();

  /* When toggles calendar, KEEP the date values */

  /** @type {(event: ReactChangeEvent, value: string) => void} */
  const handleCalChange = useCallback(
    (event, value) => {
      dateDispatch({ type: actionTypes.SET_CAL, payload: value });
    },
    [dateDispatch],
  );

  return (
    <FormControl>
      <RadioGroup
        row
        name={CAL_GROUP_NAME}
        value={cal}
        sx={{ mt: -1, mb: 1, justifyContent: 'space-around' }}
        onChange={handleCalChange}
      >
        <Tooltip
          title={
            `${t('ephemeris_range')}: ` +
            `${dateToStr({ dateArr: EPH_RANGE.min })}/${dateToStr({ dateArr: EPH_RANGE.max })}`
          }
          enterDelay={1000}
          enterNextDelay={500}
        >
          <div>
            <CustomFormControlLabel
              name={G_NAME}
              label={t('gregorian')}
              value={CALS.gregorian}
              control={<Radio />}
              checked={cal === CALS.gregorian}
            />
          </div>
        </Tooltip>
        <Tooltip
          title={
            `${t('ephemeris_range')}: ` +
            `${dateToStr({ dateArr: EPH_RANGE_JULIAN.min })}/${dateToStr({ dateArr: EPH_RANGE_JULIAN.max })}`
          }
          enterDelay={1000}
          enterNextDelay={500}
        >
          <div>
            <CustomFormControlLabel
              name={J_NAME}
              label={t('julian')}
              value={CALS.julian}
              control={<Radio disabled={!!flag} />}
              checked={cal === CALS.julian}
            />
          </div>
        </Tooltip>
      </RadioGroup>
    </FormControl>
  );
};

export default memo(CalendarToggle);
