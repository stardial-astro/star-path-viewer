// src/components/input/date/CalendarToggle.jsx
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FormControl, RadioGroup, Radio, Tooltip } from '@mui/material';
import { useDateInput } from '@context/DateInputContext';
import * as actionTypes from '@context/dateInputActionTypes';
import isMobile from '@utils/isMobile';
import { EPH_RANGE, EPH_RANGE_JULIAN, CALS } from '@utils/constants';
import { dateToStr } from '@utils/dateUtils';
import CustomFormControlLabel from '@components/ui/CustomFormControlLabel';

const CAL_GROUP_NAME = 'calender-radio-group';

const G_NAME = 'gregorian';
const J_NAME = 'julian';

const tooltipSlotProps = {
  popper: {
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [0, -8],
        },
      },
    ],
  },
  tooltip: {
    sx: {
      whiteSpace: 'nowrap',
      padding: '8px 12px',
    },
  },
};

/** @param {*} param */
const TooltipWrapper = ({ children, ...props }) =>
  isMobile ? (
    children
  ) : (
    <Tooltip
      describeChild
      placement="top"
      disableFocusListener
      enterDelay={800}
      enterNextDelay={500}
      enterTouchDelay={800}
      leaveTouchDelay={1500}
      slotProps={tooltipSlotProps}
      {...props}
    >
      <span>{children}</span>
    </Tooltip>
  );

const CalendarToggle = () => {
  // console.log('Rendering CalendarToggle');
  const { i18n, t } = useTranslation('date');
  const isZh = i18n.language.startsWith('zh');
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
        sx={{
          justifyContent: 'space-around',
          mt: -1,
          mb: 1,
          // columnGap: { xs: 2, sm: 4, md: 6 },
          ml: isZh ? 2 : 0,
        }}
        onChange={handleCalChange}
      >
        <TooltipWrapper
          title={
            `${t('ephemeris_range')}: ` +
            `${dateToStr({ dateArr: EPH_RANGE.min })}/${dateToStr({ dateArr: EPH_RANGE.max })}`
          }
        >
          <CustomFormControlLabel
            name={G_NAME}
            label={t('gregorian')}
            value={CALS.gregorian}
            control={<Radio />}
            checked={cal === CALS.gregorian}
          />
        </TooltipWrapper>
        <TooltipWrapper
          title={
            `${t('ephemeris_range')}: ` +
            `${dateToStr({ dateArr: EPH_RANGE_JULIAN.min })}/${dateToStr({ dateArr: EPH_RANGE_JULIAN.max })}`
          }
        >
          <CustomFormControlLabel
            name={J_NAME}
            label={t('julian')}
            value={CALS.julian}
            control={<Radio disabled={!!flag} />}
            checked={cal === CALS.julian}
          />
        </TooltipWrapper>
      </RadioGroup>
    </FormControl>
  );
};

export default memo(CalendarToggle);
