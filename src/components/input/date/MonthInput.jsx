// src/components/input/date/MonthInput.jsx
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { styled } from '@mui/material/styles';
import { TextField, MenuItem } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import { useDateInput } from '@context/DateInputContext';

const MONTH_ID = 'month-select';
const MONTH_NAME = 'month';

const menuStyle = { pl: 2.5, py: 0.8, minHeight: 'auto', fontSize: '1rem' };

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
  const { i18n, t } = useTranslation('date');
  const langCode = i18n.resolvedLanguage || i18n.language;
  const { date, flag, dateFetching, dateError, dateNullError } = useDateInput();

  const monthError = dateError.month || dateNullError.month;

  const nullItem = useMemo(
    () => (
      <MenuItem
        dense
        key="none"
        value=""
        sx={{ color: 'text.secondary', ...menuStyle }}
      >
        {`— ${t('select_month')} —`}
      </MenuItem>
    ),
    [t],
  );

  const monthItems = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => {
        const id = i + 1;
        const tempDate = new Date(2000, i, 1); // Only used to grab the month string
        const name = new Intl.DateTimeFormat(langCode, {
          month: 'long',
        }).format(tempDate);
        return (
          <MenuItem
            dense
            key={name}
            value={id.toString()}
            disabled={id < min || id > max}
            sx={menuStyle}
          >
            {name}
          </MenuItem>
        );
      }),
    [langCode, min, max],
  );

  return (
    <StyledTextField
      select
      required
      autoComplete="off"
      variant="outlined"
      size="small"
      // id={MONTH_ID} // not working, use slotProps
      label={t('month')}
      name={MONTH_NAME}
      value={date.month}
      onChange={onChange}
      disabled={!!flag}
      error={!!monthError}
      helperText={monthError ? t(monthError) : ''}
      sx={{ textAlign: 'left' }}
      slotProps={{
        htmlInput: { id: MONTH_ID },
        inputLabel: { htmlFor: MONTH_ID },
        select: {
          MenuProps: {
            disableScrollLock: true,
            PaperProps: {
              sx: {
                maxHeight: { xs: 300, sm: 500 },
              },
            },
          },
        },
        input: {
          endAdornment: date.year && dateFetching && loadingAdornment,
        },
      }}
      fullWidth
    >
      {nullItem}
      {monthItems}
    </StyledTextField>
  );
};

export default memo(MonthInput);
