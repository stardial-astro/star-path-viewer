// src/components/output/image/ImageDisplay.jsx
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material/styles';
import { Box, Stack } from '@mui/material';
import { useHome } from '@context/HomeContext';
import { colorFilter } from '@utils/outputUtils';
import CustomAlert from '@components/ui/CustomAlert';
import DownloadImage from './DownloadImage';

const ImageDisplay = () => {
  const { t } = useTranslation();
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
        /* eslint-disable @eslint-react/dom-no-dangerously-set-innerhtml */
        dangerouslySetInnerHTML={{ __html: svgData }}
      />

      <Stack id="download-img" direction="column" spacing={1} sx={{ mt: -1 }}>
        <DownloadImage filenameBase={`sp_${diagramId}`} dpi={300} />
        {errorMessage.download &&
          !errorMessage.download.startsWith('table_') && (
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

export default memo(ImageDisplay);
