// src/components/output/annotations/AnnoDisplay.jsx
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Stack } from '@mui/material';
import { useHome } from '@context/HomeContext';
import CustomAlert from '@components/ui/CustomAlert';
import AnnoLegend from './AnnoLegend';
import AnnoTable from './AnnoTable';
import DownloadAnnoTable from './DownloadAnnoTable';

const AnnoDisplay = () => {
  // console.log('Rendering AnnoDisplay');
  const { t } = useTranslation();
  const { errorMessage, setErrorMessage, diagramId, anno, info } = useHome();

  const filteredAnno = useMemo(
    () => anno.filter((item) => item.is_displayed),
    [anno],
  );

  return (
    <>
      <Box>
        <AnnoLegend anno={filteredAnno} />
        <AnnoTable anno={filteredAnno} tzname={info.tzname} />
      </Box>

      <Stack id="download-table" direction="column" spacing={1} sx={{ mt: 1 }}>
        <DownloadAnnoTable
          anno={filteredAnno}
          filenameBase={`tb_${diagramId}`}
        />
        {errorMessage.download &&
          errorMessage.download.startsWith('table_') && (
            <CustomAlert
              sx={{ mt: 1 }}
              onClose={() =>
                setErrorMessage((prev) => ({ ...prev, download: '' }))
              }
            >
              {t(errorMessage.download)}
            </CustomAlert>
          )}
      </Stack>
    </>
  );
};

export default memo(AnnoDisplay);
