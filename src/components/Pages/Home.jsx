// src/components/Pages/Home.jsx
import { memo } from 'react';
// import { Helmet } from 'react-helmet';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { useTheme } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';
import titleImage from '@assets/title-image.svg';
import { useHome } from '@context/HomeContext';
import { LocationInputProvider } from '@context/LocationInputContext';
import { DateInputProvider } from '@context/DateInputContext';
import { StarInputProvider } from '@context/StarInputContext';
import useServerStatusCheck from '@hooks/useServerStatusCheck';
import config from '@utils/config';
import { enableDevMode, getIsDevMode } from '@utils/devMode';
import DiagramFetcher from '@components/Input/DiagramFetcher';
import InfoDisplay from '@components/Output/InfoDisplay';
import ImageDisplay from '@components/Output/Image/ImageDisplay';
import AnnoDisplay from '@components/Output/Annotations/AnnoDisplay';
import Notice from '@components/Navigation/Notice';
import OfflineNotifier from '@components/Navigation/OfflineNotifier';

/** Counter to trigger dev (verbose) mode */
let clickCount = 0;

const hashes = window.location.hash.substring(1).split('&');
hashes.includes('dev') && enableDevMode();

/* Check env and config */
// if (getIsDevMode() && !import.meta.env.VITEST) {
//   // console.debug('[BASE_URL]', import.meta.env.BASE_URL);
//   console.debug('[MODE]', import.meta.env.MODE);
//   // console.debug('[DEV]', import.meta.env.DEV);
//   // console.debug('[VITE_APP_NAME]', import.meta.env.VITE_APP_NAME);
//   console.debug('[VITE_SERVER_URL]', import.meta.env.VITE_SERVER_URL);
//   console.debug('[__APP_NAME__]', __APP_NAME__);
//   // console.debug('[__APP_DESCRIPTION__]', __APP_DESCRIPTION__);
//   // console.debug('[config]', config);
// }

const Home = () => {
  // console.log('Rendering Home');
  const theme = useTheme();
  const { isDelayedOnline, success, svgData, anno, setErrorMessage } =
    useHome();
  const isDarkMode = theme.palette.mode === 'dark';

  /* ------------------------------------------------------------------|
   * Initialize
   * ------------------------------------------------------------------|
   */
  useServerStatusCheck(isDelayedOnline, setErrorMessage);

  /* ------------------------------------------------------------------|
   * Handlers
   * ------------------------------------------------------------------|
   */
  const handleTitleClick = () => {
    if (getIsDevMode()) return;
    clickCount++;
    if (clickCount >= config.TRIGGER_DEV_CLICK_COUNT) {
      enableDevMode();
      clickCount = 0;
    }
  };

  return (
    <HelmetProvider>
      <Helmet>
        <title>Star Path Viewer: Trace Planets & Stars</title>
        <meta
          name="description"
          content="Astronomical tool for tracing the positions of planets and stars on any chosen date in the ancient or future sky."
        />
        <meta property="og:title" content="Star Path Viewer" />
        <meta property="og:description" content="Trace Planets & Stars" />
        <meta
          property="og:image"
          content="https://stardial-astro.github.io/star-path-data/images/star-path-viewer_card.jpg"
        />
        <meta property="og:url" content="https://star-path-viewer.pages.dev/" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <LocationInputProvider>
        <DateInputProvider>
          <StarInputProvider>
            {/* Display a dialog when offline */}
            <OfflineNotifier />

            {/* Display a notice */}
            <Notice />

            {/* Title */}
            <Box
              data-testid="home-page"
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                px: 1,
                mx: 'auto',
                mt: { xs: 3, sm: 5, md: 5 },
                mb: { xs: 1, sm: 2, md: 2 },
                width: '100%',
              }}
            >
              {/* Title image */}
              <Typography
                component="h1"
                data-testid="home-title"
                sx={{
                  width: '100%',
                  height: 'auto',
                  lineHeight: 0,
                  overflow: 'hidden',
                }}
              >
                <img
                  src={titleImage}
                  alt="Star Path Viewer"
                  style={{
                    filter: isDarkMode ? 'invert(1) contrast(200%)' : 'none',
                    maxHeight: '2.1rem',
                    // minHeight: '1rem', // Not working in Safari
                    objectFit: 'contain', // Maintain aspect ratio and contain the image within the Box
                    cursor: 'default',
                  }}
                  onClick={handleTitleClick}
                />
              </Typography>
            </Box>

            <Typography
              variant="subtitle1"
              component="h2"
              data-testid="home-subtitle"
              sx={{
                color: isDarkMode ? 'text.secondary' : 'action.active',
                fontWeight: 400,
                fontSize: {
                  xs: '0.7rem',
                  sm: 'subtitle2.fontSize',
                  md: 'subtitle1.fontSize',
                },
                mt: 0.5,
                mb: { xs: 1, sm: 1, md: 1 },
              }}
            >
              {/* &mdash;&nbsp;Trace a&nbsp;star&nbsp;on any&nbsp;date from &#8209;3000&#8209;01&#8209;29 to 3000&#8209;05&#8209;06&nbsp;&mdash; */}
              &mdash;&nbsp;Trace a&nbsp;star&nbsp;on any&nbsp;date between
              3001&nbsp;BCE and 3000&nbsp;CE&nbsp;&mdash;
            </Typography>

            <Box
              id="input"
              data-testid="input"
              sx={{ width: '100%', justifyContent: 'center' }}
            >
              <DiagramFetcher />
            </Box>

            {success && (
              <Box
                data-testid="output"
                sx={{ width: '100%', justifyContent: 'center' }}
              >
                <Box id="information" sx={{ mt: 2 }}>
                  <InfoDisplay />
                </Box>

                {svgData && (
                  <Box id="diagram">
                    <ImageDisplay />
                  </Box>
                )}

                {anno.length > 0 && (
                  <Box id="annotations" sx={{ mt: 2 }}>
                    <AnnoDisplay />
                  </Box>
                )}
              </Box>
            )}
          </StarInputProvider>
        </DateInputProvider>
      </LocationInputProvider>
    </HelmetProvider>
  );
};

export default memo(Home);
