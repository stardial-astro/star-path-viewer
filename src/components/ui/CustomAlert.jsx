// src/components/ui/CustomAlert.jsx
import Alert from '@mui/material/Alert';

/** @param {*} props */
const CustomAlert = ({ ref, severity = 'error', sx, ...rest }) => {
  return (
    <Alert
      ref={ref}
      severity={severity}
      sx={{
        width: '100%',
        textAlign: 'left',
        ...sx, // allow overriding styles from parent
      }}
      {...rest} // spread all other props through
    />
  );
};

export default CustomAlert;
