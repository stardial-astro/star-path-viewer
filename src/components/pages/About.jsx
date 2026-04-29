// src/components/pages/About.jsx
import { memo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Box, Typography, Link } from '@mui/material';
import logo from '@assets/logo.svg';
import config from '@utils/config';

const SKYFIELD_URL = 'https://rhodesmill.org/skyfield';
const JPL_URL = 'https://ssd.jpl.nasa.gov/planets/eph_export.html';
const HIP_URL = 'https://www.cosmos.esa.int/web/hipparcos/catalogues';

/** @type {Record<LangCode | string, string>} */
const DOCS_URLS = {
  en: config.DOCS_URL,
  zh: config.DOCS_URL + '/zh/',
  'zh-HK': config.DOCS_URL + '/zh-HK/',
};

// const justifyStyle = {
//   textJustify: 'inter-word',
//   hyphens: 'auto',
//   hyphenateLimitChars: '8 3 4',
// };

const logoImg = (
  // <img
  //   src={logo}
  //   alt="Logo"
  //   data-testid="about-logo"
  //   style={{
  //     // maxWidth: '15%',
  //     width: '120px',
  //     objectFit: 'contain', // Maintain aspect ratio and contain the image within the Box
  //   }}
  // />
  <Box
    component="img"
    src={logo}
    alt="Logo"
    data-testid="about-logo"
    sx={{
      width: { xs: '90px', sm: '130px' },
      objectFit: 'contain', // Maintain aspect ratio and contain the image within the Box
    }}
  />
);

/** @param {*} param */
/* eslint-disable-next-line no-unused-vars */
const TransLink = ({ children, i18nIsDynamicList, ...props }) => (
  <Link target="_blank" rel="noopener noreferrer" {...props}>
    {children}
  </Link>
);

/** @param {*} param */
/* eslint-disable-next-line no-unused-vars */
const Em = ({ children, i18nIsDynamicList }) => <em>{children}</em>;

const About = () => {
  const { i18n, t } = useTranslation('about');
  const isZh = i18n.language.startsWith('zh');
  const bodyArray = t('body', { returnObjects: true });
  return (
    <>
      <title>{t('head_title')}</title>

      <Box data-testid="about-page" sx={{ mt: 4 }}>
        {logoImg}
      </Box>

      {/* Title */}
      {/* <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          px: 1,
          mx: 'auto',
          mt: { xs: 1.3, sm: 2.7 },
          mb: { xs: 2.1, sm: 3.4 },
          width: '100%',
        }}
      >
        <Typography
          variant="h1"
          component="h1"
          data-testid="about-title"
          fontSize="40.8px"
        >
          {t('title')}
        </Typography>
      </Box> */}

      <Box
        data-testid="about-body"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          rowGap: '1rem',
          mt: { xs: 1, sm: 2 },
          mx: { xs: 1.5, sm: 3 },
          pl: 0.5,
          pr: isZh ? 0.5 : 0.2,
          // px: 0.5,
        }}
      >
        {Array.isArray(bodyArray) &&
          bodyArray.map((p, index) => {
            const elm = p.id.split('-')[0];
            return (
              <Typography
                key={p.id || index}
                variant={elm === 'p' ? 'body2' : elm}
                component={elm}
                align={elm === 'p' ? (isZh ? 'justify' : 'left') : 'center'}
                // align={elm === 'p' ? 'justify' : 'center'}
                // sx={justifyStyle}
              >
                <Trans
                  t={t}
                  i18nKey={`body.${index}.content`}
                  values={{
                    teamName: config.TEAM_NAME,
                    appName: import.meta.env.VITE_APP_NAME,
                  }}
                  components={{
                    em: <Em />,
                    TeamLink: <TransLink href={config.TEAM_URL} />,
                    RepoLink: <TransLink href={config.REPO_URL} />,
                    DocsLink: (
                      <TransLink
                        href={DOCS_URLS[i18n.resolvedLanguage || 'en']}
                      />
                    ),
                    SkyfieldLink: <TransLink href={SKYFIELD_URL} />,
                    JplLink: <TransLink href={JPL_URL} />,
                    HipLink: <TransLink href={HIP_URL} />,
                  }}
                />
              </Typography>
            );
          })}
      </Box>
    </>
  );
};

export default memo(About);
