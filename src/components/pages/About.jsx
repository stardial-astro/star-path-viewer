// src/components/pages/About.jsx
import { memo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Box, Typography, Link } from '@mui/material';
import logo from '@assets/logo.svg';
import config from '@utils/config';

const GUIDE_URL = config.REPO_URL + '/wiki/1.-Guides';
const SKYFIELD_URL = 'https://rhodesmill.org/skyfield';
const JPL_URL = 'https://ssd.jpl.nasa.gov/planets/eph_export.html';
const HIP_URL = 'https://www.cosmos.esa.int/web/hipparcos/catalogues';

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
      <Box data-testid="about-page" sx={{ mt: 4 }}>
        <img
          src={logo}
          alt="Logo"
          data-testid="about-logo"
          style={{
            maxWidth: '20%',
            minWidth: '130px',
            objectFit: 'contain', // Maintain aspect ratio and contain the image within the Box
          }}
        />
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
          mt: { xs: 2.1, sm: 3.4 },
          mx: { xs: 2, sm: 3 },
          pl: 0.5,
          pr: isZh ? 0.5 : 0,
        }}
      >
        {Array.isArray(bodyArray) &&
          bodyArray.map((p, index) => (
            <Typography
              key={p.id || index}
              variant="body1"
              component="p"
              align={isZh ? 'justify' : 'left'}
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
                  GuideLink: <TransLink href={GUIDE_URL} />,
                  SkyfieldLink: <TransLink href={SKYFIELD_URL} />,
                  JplLink: <TransLink href={JPL_URL} />,
                  HipLink: <TransLink href={HIP_URL} />,
                }}
              />
            </Typography>
          ))}
      </Box>
    </>
  );
};

export default memo(About);
