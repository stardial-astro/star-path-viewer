// src/components/Input/Date/MonthInput.jsx
import { memo, useMemo } from 'react';
import { styled } from '@mui/material/styles';
import { TextField, MenuItem } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import { useDateInput } from '@context/DateInputContext';
import { MONTHS } from '@utils/constants';

const MONTH_ID = 'month-select';
const MONTH_LABEL = 'Month';
const MONTH_NAME = MONTH_LABEL.toLowerCase();
const MONTH_NULL_TEXT = '— Select a month —';

const nullItem = (
  <MenuItem key="none" value="" sx={{ color: 'action.active' }}>
    {MONTH_NULL_TEXT}
  </MenuItem>
);

const loadingAdornment = (
  <InputAdornment position="end" sx={{ mr: 2 }}>
    <CircularProgress size={20} sx={{ color: 'action.disabled' }} />
  </InputAdornment>
);

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-root.Mui-disabled': {
    backgroundColor: theme.palette.action.hover,
  },
}));

/**
 * @param {object} param
 * @param {number} param.min
 * @param {number} param.max
 * @param {(event: ReactChangeEvent | ChangeEvent) => void} param.onChange
 */
const MonthInput = ({ min, max, onChange }) => {
  const { date, flag, dateFetching, dateError, dateNullError } = useDateInput();
  const monthItems = useMemo(
    () =>
      MONTHS.slice(1).map((month) => (
        <MenuItem
          key={month.name}
          value={month.id.toString()}
          disabled={month.id < min || month.id > max}
        >
          {month.name}
        </MenuItem>
      )),
    [min, max],
  );

  return (
    <StyledTextField
      select
      required
      autoComplete="off"
      variant="outlined"
      size="small"
      // id={MONTH_ID} // not working, use slotProps
      label={MONTH_LABEL}
      name={MONTH_NAME}
      value={date.month}
      onChange={onChange}
      disabled={!!flag}
      error={!!dateError.month || !!dateError.general || !!dateNullError.month}
      helperText={dateError.month || dateNullError.month}
      slotProps={{
        input: {
          endAdornment: date.year && dateFetching && loadingAdornment,
        },
        htmlInput: { id: MONTH_ID },
        inputLabel: { htmlFor: MONTH_ID },
      }}
      fullWidth
    >
      {nullItem}
      {monthItems}
    </StyledTextField>
  );
};

export default memo(MonthInput);
