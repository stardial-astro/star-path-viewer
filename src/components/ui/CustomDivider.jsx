// src/components/ui/CustomDivider.jsx
import Divider from '@mui/material/Divider';
import { styled } from '@mui/material/styles';

const CustomDivider = styled(Divider)(({ theme }) => ({
  padding: theme.spacing(1, 0, 0, 0),
  color: theme.palette.text.disabled,
  fontSize: '0.8125rem',
  // ...theme.applyStyles('dark', {
  //   color: theme.palette.text.secondary,
  // }),
}));

export default CustomDivider;
