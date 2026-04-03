// src/components/Output/Annotations/AnnoDisplay.jsx
import { memo, useMemo } from 'react';
import { Box, Stack } from '@mui/material';
import { useHome } from '@context/HomeContext';
import CustomAlert from '@components/ui/CustomAlert';
import AnnoLegend from './AnnoLegend';
import AnnoTable from './AnnoTable';
import DownloadAnnoTable from './DownloadAnnoTable';

const AnnoDisplay = () => {
  // console.log('Rendering AnnoDisplay');
  const { errorMessage, setErrorMessage, diagramId, anno } = useHome();

  const filteredAnno = useMemo(
    () => anno.filter((item) => item.is_displayed),
    [anno],
  );

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
        />
        {errorMessage.download && errorMessage.download.includes('table') && (
          <CustomAlert
            sx={{ mt: 1 }}
            onClose={() =>
              setErrorMessage((prev) => ({ ...prev, download: '' }))
            }
          >
            {errorMessage.download}
          </CustomAlert>
        )}
      </Stack>
    </>
  );
};

export default memo(AnnoDisplay);
