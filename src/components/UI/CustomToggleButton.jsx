// src/components/UI/CustomToggleButton.jsx
import ToggleButton from '@mui/material/ToggleButton';
import { styled } from '@mui/material/styles';

const CustomToggleButton = styled(ToggleButton)(({ theme }) => ({
  border: `1px solid ${theme.palette.primary.main}`,
  color: theme.palette.primary.main,
  backgroundColor: 'transparent',
  '&:hover': {
    backgroundColor: theme.palette.action.hover, // MUI's default hover color for outlined buttons
  },
  '&.Mui-selected': {
    color: theme.palette.primary.contrastText,
    backgroundColor: theme.palette.primary.main,
    border: 'none',
    '&:hover': {
      backgroundColor: theme.palette.primary.dark, // MUI's default hover color for contained buttons
    },
  },
  '&.Mui-disabled': {
    backgroundColor: theme.palette.action.disabledBackground,
    border: 'none',
  },
}));

export default CustomToggleButton;
