// src/Globali18nStyles.jsx
import { GlobalStyles } from '@mui/material';

const GLOBAL_FONTS = "'Roboto'";
const SC_FONTS = "'PingFang SC', 'Microsoft YaHei'";

const Globali18nStyles = () => (
  <GlobalStyles
    styles={() => ({
      '@keyframes mui-auto-fill': { from: { display: 'block' } },
      '@keyframes mui-auto-fill-cancel': { from: { display: 'block' } },

      '@font-face': {
        fontFamily: 'ScaledChinese',
        src: "local('PingFang SC'), local('Microsoft YaHei')",
        unicodeRange: 'U+4E00-9FFF', // targets only CJK Unified Ideographs
        sizeAdjust: '110%',
        ascentOverride: '95%',
      },

      '[lang^="zh"]': {
        fontFamily: `${GLOBAL_FONTS}, ${SC_FONTS}, sans-serif`,
      },

      '[lang^="zh"] .MuiButton-root, [lang^="zh"] .MuiToggleButton-root': {
        fontFamily: `${GLOBAL_FONTS}, 'ScaledChinese', sans-serif`,
        letterSpacing: '0.15em',
        textIndent: '0.2em',
      },
    })}
  />
);

export default Globali18nStyles;
