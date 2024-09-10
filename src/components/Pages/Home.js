// src/components/Pages/Home.js
import React, { useState, useCallback } from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, Stack, Typography, Alert } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import TitleImage from '../../assets/title-image.svg';
import { LocationInputProvider } from '../../context/LocationInputContext';
import { DateInputProvider } from '../../context/DateInputContext';
import { StarInputProvider } from '../../context/StarInputContext';
import { GREGORIAN } from '../../utils/constants';
import DiagramFetcher from '../Input/DiagramFetcher';
import InfoDisplay from '../Output/InfoDisplay';
import ImageDisplay from '../Output/ImageDisplay';
import DownloadManager from '../Output/DownloadManager';
import AnnoDisplay from '../Output/AnnoDisplay';
// import Notice from '../Navigation/Notice';
// import Config from '../../Config';
import { Helmet } from 'react-helmet';

const Home = () => {
  // console.log('Rendering Home');
  const theme = useTheme();
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

  const clearImage = useCallback(() => {
    setDiagramId('');
    setSvgData('');
    setAnno([]);
  }, []);

  return (
    <>
      <Helmet>
        <title>Star Path Viewer - Trace Planets and Stars</title>
        <meta name="description" content="Astronomical tool for tracing the positions of planets and stars on any date in the ancient or future sky." />
        <meta property="og:title" content="Star Path Viewer" />
        <meta property="og:description" content="Astronomical tool for tracing the positions of planets and stars on any date in the ancient or future sky." />
        <meta property="og:image" content="https://stardial-astro.github.io/star-path-data/images/star-path-viewer_card.jpg" />
        <meta property="og:url" content="https://stardial-astro.github.io/star-path-viewer" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <LocationInputProvider>
        <DateInputProvider>
          <StarInputProvider>
            {/* {Config.notice && (
              <Notice />
            )} */}
            <Box
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
              <RouterLink to="/">
                <img
                  src={TitleImage}
                  alt="Star Path Viewer - Trace Planets and Stars"
                  style={{
                    maxHeight: '2.1rem',
                    width: '100%',
                    objectFit: 'contain',  // Maintain aspect ratio and contain the image within the Box
                    cursor: 'pointer',
                  }}
                />
              </RouterLink>
            </Box>

            <Typography
              variant="subtitle1"
              component="h2"
              color="action.active"
              fontWeight={400}
              sx={{
                mt: 0.5,
                mb: { xs: 1, sm: 2, md: 2 },
                fontSize: '0.7rem',
                [theme.breakpoints.up('sm')]: {
                  fontSize: 'subtitle2.fontSize',
                },
                [theme.breakpoints.up('md')]: {
                  fontSize: 'subtitle1.fontSize',
                },
              }}
            >
              {/* &mdash;&nbsp;Trace a&nbsp;star&nbsp;on any&nbsp;date from &#8209;3000&#8209;01&#8209;29 to 3000&#8209;05&#8209;06&nbsp;&mdash; */}
              &mdash;&nbsp;Trace a&nbsp;star&nbsp;on any&nbsp;date between 3001&nbsp;BCE and 3000&nbsp;CE&nbsp;&mdash;
            </Typography>

            <Box id="draw" sx={{ width: '100%', justifyContent: 'center' }}>
              <DiagramFetcher
                setDiagramId={setDiagramId}
                setInfo={setInfo}
                setSvgData={setSvgData}
                setAnno={setAnno}
                setSuccess={setSuccess}
                clearImage={clearImage}
              />
            </Box>

            {success && (
              <Box sx={{ width: '100%', justifyContent: 'center' }}>
                <Box id="information" mt={2}>
                  <InfoDisplay info={info} />
                </Box>

                {svgData && (
                  <Box id="diagram">
                    <Box id="svg-container">
                      <ImageDisplay svgData={svgData} />
                    </Box>

                    <Stack id="download" direction="column" spacing={1} sx={{ mt: -1 }}>
                      <DownloadManager
                        svgData={svgData}
                        filenameBase={`sp_${diagramId}`}
                        dpi={300}
                        setErrorMessage={setErrorMessage}
                      />
                      {errorMessage.download && (
                        <Alert severity="error" sx={{ width: '100%', mt: 1, textAlign: 'left' }} onClose={() => setErrorMessage((prev) => ({ ...prev, download: '' }))}>
                          {errorMessage.download}
                        </Alert>
                      )}
                    </Stack>
                  </Box>
                )}

                {anno.length > 0 && (
                  <Box id="annotations" mt={2}>
                    <AnnoDisplay anno={anno} />
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

export default React.memo(Home);
