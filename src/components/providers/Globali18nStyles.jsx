// src/components/providers/Globali18nStyles.jsx
import { GlobalStyles } from '@mui/material';

const GLOBAL_FONTS = '"Roboto"';
const SC_FONTS = [
  '"PingFang SC"',
  '"Microsoft YaHei"',
  '"微软雅黑"',
].join(', ');

const Globali18nStyles = () => (
  <GlobalStyles
    styles={() => ({
      '@keyframes mui-auto-fill': { from: { display: 'block' } },
      '@keyframes mui-auto-fill-cancel': { from: { display: 'block' } },

      '@font-face': {
        fontFamily: 'ScaledChinese',
        src: [
          'local("PingFangSC-Medium")',
          'local("PingFang-SC-Medium")',
          'local("Microsoft YaHei")',
          'local("微软雅黑")',
        ].join(', '),
        unicodeRange: 'U+4E00-9FFF', // targets only CJK Unified Ideographs
        sizeAdjust: '110%',
        ascentOverride: '95%',
      },

      '[lang^="zh"]': {
        fontFamily: `${GLOBAL_FONTS}, ${SC_FONTS}, sans-serif`,
      },

      '[lang^="zh"] .MuiButton-root, [lang^="zh"] .MuiToggleButton-root': {
        fontFamily: `${GLOBAL_FONTS}, 'ScaledChinese', sans-serif`,
        fontWeight: 500,
        letterSpacing: '0.15em',
        textIndent: '0.2em',
      },
    })}
  />
);

export default Globali18nStyles;
