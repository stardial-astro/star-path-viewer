// src/components/ui/CustomTextField.jsx
import TextField from '@mui/material/TextField';

/** @param {*} props */
const CustomTextField = ({
  ref,
  required = true,
  fullWidth = true,
  variant = 'outlined',
  size = 'small',
  InputProps,
  slotProps,
  startAdornment,
  ...rest
}) => {
  return (
    <TextField
      ref={ref}
      variant={variant}
      required={required}
      size={size}
      fullWidth={fullWidth}
      slotProps={{
        ...slotProps,
        input: {
          ...InputProps, // Autocomplete still passes its internals via params.InputProps
          startAdornment: startAdornment ? (
            <>
              {startAdornment}
              {InputProps?.startAdornment}
            </>
          ) : (
            InputProps?.startAdornment
          ),
        },
      }}
      {...rest} // spread all other props through
    />
  );
};

export default CustomTextField;
