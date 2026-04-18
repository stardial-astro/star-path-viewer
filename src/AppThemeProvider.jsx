// src/AppThemeProvider.jsx
import { useMemo } from 'react';
import {
  // GlobalStyles,
  createTheme,
  ThemeProvider,
  CssBaseline,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import * as muiLocales from '@mui/material/locale';
import Globali18nStyles from './Globali18nStyles';

/**
 * Maps i18next language code to MUI locale keys.
 * @type {Record<LangCode, string>}
 */
const LANG_CODE_TO_MUI_LOCALE = {
  en: 'enUS',
  'en-US': 'zhCN',
  'en-GB': 'zhCN',
  'en-CA': 'zhCN',
  zh: 'zhCN',
  'zh-CN': 'zhCN',
  'zh-Hans': 'zhCN',
  'zh-HK': 'zhHK',
  'zh-TW': 'zhHK',
  'zh-Hant': 'zhHK',
};

const themeOptions = {
  colorSchemes: {
    /* Enables dark mode */
    dark: true,
  },
  typography: {
    h1: {
      fontWeight: 100,
      fontSize: '43.2px',
      lineHeight: 1,
      letterSpacing: '0.1px',
    },
    h2: {
      fontWeight: 400,
      fontSize: '1.25rem',
      lineHeight: 1,
      letterSpacing: '1px',
      paddingTop: '0.5rem',
    },
    subtitle1: {
      fontWeight: 400,
    },
  },
  components: {
    // MuiTypography: {
    //   styleOverrides: {
    //     h1: {
    //       fontWeight: 100,
    //       fontSize: '43.2px',
    //       lineHeight: 1,
    //       letterSpacing: '0.1px',
    //     },
    //     subtitle1: {
    //       fontWeight: 400,
    //     }
    //   },
    // },
    MuiInputBase: {
      defaultProps: {
        /* Needed to prevent adding a global style for every input field */
        disableInjectingGlobalStyles: true,
      },
    },
    // MuiButtonBase: {
    //   defaultProps: {
    //     disableRipple: true,
    //   },
    // },
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
};

/**
 * @param {object} props
 * @param {React.ReactNode} props.children
 */
const AppThemeProvider = ({ children }) => {
  const { i18n } = useTranslation();

  const theme = useMemo(() => {
    const selectedLocale =
      /* @ts-ignore: TS7053 */
      muiLocales[LANG_CODE_TO_MUI_LOCALE[i18n.language] || 'enUS'];

    /* Create theme with the selected MUI locale */
    return createTheme(
      themeOptions,
      selectedLocale, // inject MUI's internal translations
    );
  }, [i18n.language]);

  return (
    <ThemeProvider theme={theme} noSsr>
      {/* <GlobalStyles
        styles={{
          '@keyframes mui-auto-fill': { from: { display: 'block' } },
          '@keyframes mui-auto-fill-cancel': { from: { display: 'block' } },
        }}
      /> */}
      <Globali18nStyles />
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

export default AppThemeProvider;
