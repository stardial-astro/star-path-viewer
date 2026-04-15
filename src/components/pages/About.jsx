// src/components/pages/About.jsx
import { memo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
// import { useTheme } from '@mui/material/styles';
import { Box, Typography, Link } from '@mui/material';
// import aboutImage from '@assets/about-image.svg';
import logo from '@assets/logo.svg';
import config from '@utils/config';

const GUIDE_URL = config.REPO_URL + '/wiki/1.-Guides';
const SKYFIELD_URL = 'https://rhodesmill.org/skyfield';
const JPL_URL = 'https://ssd.jpl.nasa.gov/planets/eph_export.html';
const HIP_URL = 'https://www.cosmos.esa.int/web/hipparcos/catalogues';

const About = () => {
  const { t } = useTranslation('about');
  // const theme = useTheme();
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
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          px: 1,
          mx: 'auto',
          /* <img> */
          // mt: { xs: 2, sm: 3 },
          // mb: { xs: 3, sm: 4 },
          /* text */
          mt: { xs: 1.3, sm: 2.7 },
          mb: { xs: 2.1, sm: 3.4 },
          width: '100%',
        }}
      >
        <Typography
          component="h1"
          data-testid="about-title"
          sx={{
            /* <img> */
            // width: '100%',
            // height: 'auto',
            // lineHeight: 0,
            // overflow: 'hidden',
            /* text */
            fontWeight: 100,
            fontSize: '2.55rem',
            lineHeight: 1,
            letterSpacing: '0.1px',
          }}
        >
          {/* <img
            src={aboutImage}
            alt="About Us"
            style={{
              filter:
                theme.palette.mode === 'dark'
                  ? 'invert(1) contrast(200%)'
                  : 'none',
              maxHeight: '2.1rem',
              objectFit: 'contain', // Maintain aspect ratio and contain the image within the Box
              cursor: 'default',
            }}
          /> */}
          {t('title')}
        </Typography>
      </Box>

      <Box
        data-testid="about-body"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          rowGap: '1rem',
          mx: { xs: 0.5, sm: 2.5, md: 3 },
          pl: 1.8,
        }}
      >
        {Array.isArray(bodyArray) &&
          bodyArray.map((p, index) => (
            <Typography
              key={p.id || index}
              variant="body1"
              component="p"
              align="left"
            >
              <Trans
                t={t}
                i18nKey={`body.${index}.content`}
                values={{
                  teamName: config.TEAM_NAME,
                  appName: import.meta.env.VITE_APP_NAME,
                }}
                components={{
                  em: <em />,
                  TeamLink: (
                    <Link
                      href={config.TEAM_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  ),
                  RepoLink: (
                    <Link
                      href={config.REPO_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  ),
                  GuideLink: (
                    <Link
                      href={GUIDE_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  ),
                  SkyfieldLink: (
                    <Link
                      href={SKYFIELD_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  ),
                  JplLink: (
                    <Link
                      href={JPL_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  ),
                  HipLink: (
                    <Link
                      href={HIP_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  ),
                }}
              />
            </Typography>
          ))}
      </Box>
    </>
  );
};

export default memo(About);
