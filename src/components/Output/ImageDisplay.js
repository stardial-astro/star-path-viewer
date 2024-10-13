// src/components/Output/ImageDisplay.js
import React from 'react';
import { Box, Stack, Alert } from '@mui/material';
import DownloadImage from './DownloadImage';

const ImageDisplay = ({ svgData, diagramId, info, errorMessage, setErrorMessage }) => {
  return (
    <>
      <Box
        id="svg-container"
        sx={{mr: 0.5,
          '& svg': {
            width: '100%',
            height: 'auto',
          }
        }}
        dangerouslySetInnerHTML={{ __html: svgData }}
      />

      <Stack id="download-img" direction="column" spacing={1} sx={{ mt: -1 }}>
        <DownloadImage
          svgData={svgData}
          info={info}
          filenameBase={`sp_${diagramId}`}
          dpi={300}
          setErrorMessage={setErrorMessage}
        />
        {errorMessage.download && !errorMessage.download.includes('table') && (
          <Alert severity="error" sx={{ width: '100%', mt: 1, textAlign: 'left' }} onClose={() => setErrorMessage((prev) => ({ ...prev, download: '' }))}>
            {errorMessage.download}
          </Alert>
        )}
      </Stack>
    </>
  );
};

export default React.memo(ImageDisplay);
