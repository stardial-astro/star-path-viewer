// src/components/Pages/Home.jsx
import React, { useState, useCallback } from 'react';
// import { useTheme } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';
import TitleImage from '@assets/title-image.svg';
import { LocationInputProvider } from '@context/LocationInputContext';
import { DateInputProvider } from '@context/DateInputContext';
import { StarInputProvider } from '@context/StarInputContext';
import { GREGORIAN } from '@utils/constants';
import { enableDevMode, getIsDevMode, triggerDevModeCount } from '@utils/devMode';
import DiagramFetcher from '@components/Input/DiagramFetcher';
import InfoDisplay from '@components/Output/InfoDisplay';
import ImageDisplay from '@components/Output/Image/ImageDisplay';
import AnnoDisplay from '@components/Output/Annotations/AnnoDisplay';
import Notice from '@components/Navigation/Notice';
// import { Helmet } from 'react-helmet';
import { Helmet, HelmetProvider } from 'react-helmet-async';

const Home = () => {
  // console.log('Rendering Home');
  // const theme = useTheme();
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState({});
  const [diagramId, setDiagramId] = useState('');
  const [svgData, setSvgData] = useState('');
  const [anno, setAnno] = useState([]);
  const [info, setInfo] = useState({
    lat: '', lng: '',
    dateG: { year: '', month: '', day: '' },
    dateJ: { year: '', month: '', day: '' },
    flag: '', cal: GREGORIAN,
    name: '', nameZh: '', hip: '', ra: '', dec: '',
    eqxSolTime: '',
  });

  let clickCount = 0;

  const clearImage = useCallback(() => {
    setDiagramId('');
    setSvgData('');
    setAnno([]);
  }, []);

  const handleTitleClick = () => {
    if (getIsDevMode()) return;
    clickCount++;
    if (clickCount >= triggerDevModeCount) {
      enableDevMode();
      clickCount = 0;
    }
  };

  return (
    <HelmetProvider>
      <Helmet>
        <title>Star Path Viewer: Trace Planets & Stars</title>
        <meta name="description" content="Astronomical tool for tracing the positions of planets and stars on any chosen date in the ancient or future sky." />
        <meta property="og:title" content="Star Path Viewer" />
        <meta property="og:description" content="Trace Planets & Stars" />
        <meta property="og:image" content="https://stardial-astro.github.io/star-path-data/images/star-path-viewer_card.jpg" />
        <meta property="og:url" content="https://star-path-viewer.pages.dev/" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <LocationInputProvider>
        <DateInputProvider>
          <StarInputProvider>
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
                  overflow: 'hidden'
                }}
              >
                <img
                  src={TitleImage}
                  alt={import.meta.env.VITE_APP_NAME}
                  style={{
                    maxHeight: '2.1rem',
                    // minHeight: '1rem', // Not working in Safari
                    objectFit: 'contain',  // Maintain aspect ratio and contain the image within the Box
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
              color="action.active"
              fontWeight={400}
              sx={{
                mt: 0.5,
                mb: { xs: 1, sm: 1, md: 1 },
                fontSize: {
                  xs: '0.7rem',
                  sm: 'subtitle2.fontSize',
                  md: 'subtitle1.fontSize',
                }
              }}
            >
              {/* &mdash;&nbsp;Trace a&nbsp;star&nbsp;on any&nbsp;date from &#8209;3000&#8209;01&#8209;29 to 3000&#8209;05&#8209;06&nbsp;&mdash; */}
              &mdash;&nbsp;Trace a&nbsp;star&nbsp;on any&nbsp;date between 3001&nbsp;BCE and 3000&nbsp;CE&nbsp;&mdash;
            </Typography>

            <Box id="draw" data-testid="draw-btn" sx={{ width: '100%', justifyContent: 'center' }}>
              <DiagramFetcher
                setDiagramId={setDiagramId}
                setInfo={setInfo}
                setSvgData={setSvgData}
                setAnno={setAnno}
                setSuccess={setSuccess}
                clearImage={clearImage}
                errorMessage={errorMessage}
                setErrorMessage={setErrorMessage}
              />
            </Box>

            {success && (
              <Box data-testid="output" sx={{ width: '100%', justifyContent: 'center' }}>
                <Box id="information" mt={2}>
                  <InfoDisplay info={info} />
                </Box>

                {svgData && (
                  <Box id="diagram">
                    <ImageDisplay
                      svgData={svgData}
                      diagramId={diagramId}
                      info={info}
                      errorMessage={errorMessage}
                      setErrorMessage={setErrorMessage}
                    />
                  </Box>
                )}

                {anno.length > 0 && (
                  <Box id="annotations" mt={2}>
                    <AnnoDisplay
                      anno={anno}
                      diagramId={diagramId}
                      errorMessage={errorMessage}
                      setErrorMessage={setErrorMessage}
                    />
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

export default React.memo(Home);
