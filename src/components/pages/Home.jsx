// src/components/pages/Home.jsx
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';
// import titleImage from '@assets/title-image.svg';
import { useHome } from '@context/HomeContext';
import { LocationInputProvider } from '@context/LocationInputContext';
import { DateInputProvider } from '@context/DateInputContext';
import { StarInputProvider } from '@context/StarInputContext';
import config from '@utils/config';
import { enableDevMode } from '@utils/devMode';
import DiagramFetcher from '@components/input/DiagramFetcher';
import InfoDisplay from '@components/output/InfoDisplay';
import ImageDisplay from '@components/output/image/ImageDisplay';
import AnnoDisplay from '@components/output/annotations/AnnoDisplay';
import Notice from '@/components/overlays/Notice';
import OfflineNotifier from '@/components/overlays/OfflineNotifier';

// /** Counter to trigger dev (verbose) mode */
// let clickCount = 0;

const hashes = window.location.hash.substring(1).split('&');
hashes.includes('dev') && enableDevMode();

/* Check env and config */
// if (getIsDevMode() && !import.meta.env.VITEST) {
//   console.debug('[BASE_URL]', import.meta.env.BASE_URL);
//   console.debug('[MODE]', import.meta.env.MODE);
//   // console.debug('[DEV]', import.meta.env.DEV);
//   console.debug('[VITE_APP_NAME]', import.meta.env.VITE_APP_NAME);
//   console.debug('[VITE_SERVER_URL]', import.meta.env.VITE_SERVER_URL);
//   // console.debug('[__APP_NAME__]', __APP_NAME__);
//   console.debug('[__APP_DESCRIPTION__]', __APP_DESCRIPTION__);
//   // console.debug('[config]', config);
// }

const Home = () => {
  // console.log('Rendering Home');
  const { t } = useTranslation();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const { success, svgData, anno } = useHome();

  /* ------------------------------------------------------------------|
   * Initialize
   * ------------------------------------------------------------------|
   */
  /* [DiagramFetcher] Call useServerStatusCheck */

  /* ------------------------------------------------------------------|
   * Handlers
   * ------------------------------------------------------------------|
   */
  // const handleTitleClick = () => {
  //   if (getIsDevMode()) return;
  //   clickCount++;
  //   if (clickCount >= config.TRIGGER_DEV_CLICK_COUNT) {
  //     enableDevMode();
  //     clickCount = 0;
  //   }
  // };

  return (
    <>
      <link rel="canonical" href={config.BASE_URL} />

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
                /* <img> */
                // mt: { xs: 3, sm: 5 },
                // mb: { xs: 1, sm: 2 },
                /* text */
                mt: { xs: 2.5, sm: 4.6 },
                mb: { xs: 0.2, sm: 1.2 },
                width: '100%',
              }}
            >
              <Typography
                variant="h1"
                component="h1"
                data-testid="home-title"
                // sx={
                //   {
                //     /* <img> */
                //     width: '100%',
                //     height: 'auto',
                //     lineHeight: 0,
                //     overflow: 'hidden',
                //   }
                // }
              >
                {/* <img
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
                /> */}
                Star Path Viewer
              </Typography>
            </Box>

            <Typography
              variant="subtitle1"
              component="p"
              data-testid="home-subtitle"
              fontSize={{
                xs: '0.7rem',
                sm: 'subtitle2.fontSize',
                md: 'subtitle1.fontSize',
              }}
              sx={{
                color: isDarkMode ? 'text.secondary' : 'action.active',
                /* <img> */
                // mt: 0.5,
                /* text */
                mt: 0,
                mb: 1,
              }}
            >
              {`— ${t('subtitle')} —`}
            </Typography>

            <Box
              id="input"
              data-testid="input"
              sx={{ width: '100%', justifyContent: 'center' }}
            >
              <DiagramFetcher />
            </Box>

            {success && svgData && (
              <Box
                data-testid="output"
                sx={{ width: '100%', justifyContent: 'center' }}
              >
                <Box id="information" sx={{ mt: 2 }}>
                  <InfoDisplay />
                </Box>

                <Box id="diagram">
                  <ImageDisplay />
                </Box>

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
    </>
  );
};

export default memo(Home);
