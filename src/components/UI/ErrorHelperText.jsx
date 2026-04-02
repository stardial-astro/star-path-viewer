// src/components/UI/ErrorHelperText.jsx
import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const ErrorHelperText = styled(Typography)(({ theme }) => ({
  color: theme.palette.error.main,
  marginTop: '4px',
  marginLeft: '14px',
  marginRight: '14px',
  fontSize: theme.typography.caption.fontSize,
  textAlign: 'left',
}));

export default ErrorHelperText;
