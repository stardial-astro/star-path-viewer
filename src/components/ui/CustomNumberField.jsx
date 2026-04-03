// src/components/ui/CustomNumberField.jsx
import { useId, useCallback } from 'react';
import { NumberField } from '@base-ui/react/number-field';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import CircularProgress from '@mui/material/CircularProgress';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import isMobile from '@utils/isMobile';

const focusStyle = {
  pr: 0,
  '&.Mui-focused .MuiInputAdornment-root': {
    visibility: 'visible',
  },
};

const adornmentStyle = isMobile
  ? focusStyle
  : {
      ...focusStyle,
      '&:hover .MuiInputAdornment-root': {
        visibility: 'visible',
      },
    };

const endAdornmentStyle = {
  visibility: 'hidden', // Hide by default
  maxHeight: 'unset',
  alignSelf: 'stretch',
  borderLeft: '1px solid',
  borderColor: 'divider',
  ml: 0,
  '& button': {
    py: 0,
    flex: 1,
    borderRadius: 0.5,
  },
};

const loadingAdornment = (
  <InputAdornment position="end" sx={{ mr: 2 }}>
    <CircularProgress size={20} sx={{ color: 'action.disabled' }} />
  </InputAdornment>
);

const ArrowsAdornment = () => (
  <InputAdornment
    position="end"
    sx={{ flexDirection: 'column', ...endAdornmentStyle }}
  >
    <NumberField.Increment
      render={<IconButton size="small" aria-label="Increase" />}
    >
      <KeyboardArrowUpIcon
        fontSize="small"
        sx={{ transform: 'translateY(2px)' }}
      />
    </NumberField.Increment>

    <NumberField.Decrement
      render={<IconButton size="small" aria-label="Decrease" />}
    >
      <KeyboardArrowDownIcon
        fontSize="small"
        sx={{ transform: 'translateY(-2px)' }}
      />
    </NumberField.Decrement>
  </InputAdornment>
);

/** @param {*} props */
const CustomNumberField = ({
  id: idProp,
  label,
  placeholder,
  name,
  value,
  onChange,
  intOnly = false,
  min,
  max,
  allowOutOfRange = false,
  disabled = false,
  required = true,
  fullWidth = true,
  size = 'small',
  variant = 'outlined',
  loading = false,
  error,
  helperText,
  sx,
  InputProps,
  ...other
}) => {
  let id = useId();
  if (idProp) id = idProp;

  /** @type {(value: number | null, eventDetails: NumberEventDetails) => void} */
  const handleValueChange = useCallback(
    (value) => {
      const newValue = value === null ? '' : value.toString();
      if (onChange && name) {
        onChange({ target: { name, value: newValue } });
      }
    },
    [onChange, name],
  );

  return (
    <NumberField.Root
      {...other}
      name={name}
      value={value ? parseFloat(value) : null}
      onValueChange={handleValueChange}
      required={required}
      min={min}
      max={max}
      allowOutOfRange={allowOutOfRange}
      disabled={disabled}
      format={{
        useGrouping: false,
        maximumFractionDigits: intOnly ? 0 : undefined, // default is 3
      }}
      render={(props, state) => (
        <FormControl
          ref={props.ref}
          size={size}
          variant={variant}
          required={state.required}
          disabled={state.disabled}
          error={error}
          fullWidth={fullWidth}
          sx={sx}
        >
          {props.children}
        </FormControl>
      )}
    >
      <InputLabel htmlFor={id}>{label}</InputLabel>
      <NumberField.Input
        id={id}
        render={(props, state) => {
          return (
            <OutlinedInput
              label={label}
              inputRef={props.ref}
              placeholder={placeholder}
              autoComplete="off"
              value={state.inputValue} // state.inputValue: string
              onBlur={props.onBlur}
              onChange={props.onChange}
              onKeyUp={props.onKeyUp}
              onKeyDown={props.onKeyDown}
              onFocus={props.onFocus}
              {...InputProps} // Pass InputProps to OutlinedInput
              slotProps={{
                input: props,
              }}
              endAdornment={
                loading ? (
                  loadingAdornment
                ) : isMobile ? undefined : (
                  <ArrowsAdornment />
                )
              }
              sx={loading ? { pr: 0.5 } : adornmentStyle}
            />
          );
        }}
      />
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </NumberField.Root>
  );
};

export default CustomNumberField;
