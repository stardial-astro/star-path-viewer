// src/components/Output/Annotations/AnnoDisplay.jsx
import React, { useMemo } from 'react';
import { Box, Stack, Alert } from '@mui/material';
import AnnoLegend from './AnnoLegend';
import AnnoTable from './AnnoTable';
import DownloadAnnoTable from './DownloadAnnoTable';

const AnnoDisplay = ({ anno, diagramId, errorMessage, setErrorMessage }) => {
  // console.log('Rendering AnnoDisplay');
  const filteredAnno = useMemo(() => anno.filter(item => item.is_displayed), [anno]);

  return (
    <>
      <Box>
        <AnnoLegend anno={filteredAnno} />
        <AnnoTable anno={filteredAnno} />
      </Box>

      <Stack id="download-table" direction="column" spacing={1} sx={{ mt: 1 }}>
        <DownloadAnnoTable
          anno={filteredAnno}
          filenameBase={`tb_${diagramId}`}
          setErrorMessage={setErrorMessage}
        />
        {errorMessage.download && errorMessage.download.includes('table') && (
          <Alert severity="error" sx={{ width: '100%', mt: 1, textAlign: 'left' }} onClose={() => setErrorMessage((prev) => ({ ...prev, download: '' }))}>
            {errorMessage.download}
          </Alert>
        )}
      </Stack>
    </>
  );
};

export default React.memo(AnnoDisplay);
