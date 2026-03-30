// src/components/UI/CustomDivider.jsx
import Divider from '@mui/material/Divider';
import { styled } from '@mui/material/styles';

const CustomDivider = styled(Divider)(({ theme }) => ({
  padding: theme.spacing(1, 0, 0, 0),
  color: theme.palette.text.disabled,
  fontSize: '0.8125rem',
}));

export default CustomDivider;
