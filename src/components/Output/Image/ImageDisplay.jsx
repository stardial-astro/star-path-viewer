// src/components/Output/Image/ImageDisplay.jsx
import { memo } from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, Stack } from '@mui/material';
import { useHome } from '@context/HomeContext';
import { colorFilter } from '@utils/outputUtils';
import CustomAlert from '@components/UI/CustomAlert';
import DownloadImage from './DownloadImage';

const ImageDisplay = () => {
  const theme = useTheme();
  const { errorMessage, setErrorMessage, diagramId, svgData } = useHome();
  return (
    <>
      <Box
        id="svg-container"
        sx={{
          filter: colorFilter(theme.palette.mode === 'dark'),
          mr: 0.5,
          '& svg': {
            width: '100%',
            height: 'auto',
          },
        }}
        dangerouslySetInnerHTML={{ __html: svgData }}
      />

      <Stack id="download-img" direction="column" spacing={1} sx={{ mt: -1 }}>
        <DownloadImage filenameBase={`sp_${diagramId}`} dpi={300} />
        {errorMessage.download && !errorMessage.download.includes('table') && (
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

export default memo(ImageDisplay);
