// src/theme.jsx
/* eslint-disable react-refresh/only-export-components */
import { GlobalStyles, createTheme, ThemeProvider } from '@mui/material';
import { CssBaseline } from '@mui/material';

/* Create the default theme */
export const theme = createTheme({
  colorSchemes: {
    /* Enables dark mode */
    dark: true,
  },
  components: {
    MuiInputBase: {
      defaultProps: {
        /* Needed to prevent adding a global style for every input field */
        disableInjectingGlobalStyles: true,
      },
    },
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          transition: 'transform 200ms cubic-bezier(0.0, 0, 0.2, 1)', // only transform — drop color
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: 'none',
        },
      },
    },
    MuiPopover: {
      defaultProps: { transitionDuration: 0 },
    },
    MuiMenu: {
      defaultProps: { transitionDuration: 100 },
    },
  },
});

/**
 * @param {object} props
 * @param {React.ReactNode} props.children
 */
export const AppThemeProvider = ({ children }) => {
  return (
    <ThemeProvider theme={theme} noSsr>
      <GlobalStyles
        styles={{
          '@keyframes mui-auto-fill': { from: { display: 'block' } },
          '@keyframes mui-auto-fill-cancel': { from: { display: 'block' } },
        }}
      />
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};
