// src/components/ui/CustomToggleButton.jsx
import ToggleButton from '@mui/material/ToggleButton';
import { styled } from '@mui/material/styles';

const CustomToggleButton = styled(ToggleButton)(({ theme }) => {
  const palette = (theme.vars || theme).palette;
  return {
    border: `1px solid ${palette.primary.main}`,
    color: palette.primary.main,
    backgroundColor: 'transparent',
    '&:hover': {
      backgroundColor: palette.action.hover, // MUI's default hover color for outlined buttons
    },
    '&.Mui-selected': {
      color: palette.primary.contrastText,
      backgroundColor: palette.primary.main,
      border: 'none',
      '&:hover': {
        backgroundColor: palette.primary.dark, // MUI's default hover color for contained buttons
      },
    },
    '&.Mui-disabled': {
      backgroundColor: palette.action.disabledBackground,
      border: 'none',
    },
  };
});

export default CustomToggleButton;
