// src/components/output/image/ImageDisplay.jsx
import { memo, useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import parse from 'html-react-parser';
import { Box, Stack, Tooltip } from '@mui/material';
import Fade from '@mui/material/Fade';
import { useHome } from '@context/HomeContext';
import useMagnifier from '@hooks/useMagnifier';
import isMobile from '@utils/isMobile';
import { colorFilter } from '@utils/outputUtils';
import CustomAlert from '@components/ui/CustomAlert';
import DownloadImage from './DownloadImage';

const HINT_OPEN_DELAY = 2_500;
const HINT_CLOSE_DELAY = 5_000;

/** Loupe diameter. */
const loupeSize = 300;

const loupeBaseStyle = {
  display: 'none',
  position: 'absolute',
  width: loupeSize,
  height: loupeSize,
  borderRadius: '50%',
  backgroundColor: 'background.default',
  border: '2px solid rgba(0,0,0,0.25)',
  overflow: 'hidden',
  pointerEvents: 'none',
  zIndex: 10,
  boxSizing: 'border-box',
};

const loupeInnerBaseStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  transformOrigin: '0 0',
};

const tooltipSlotProps = {
  popper: {
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [16, 16],
        },
      },
    ],
  },
  transition: { timeout: 600 },
};

/** @param {*} param */
const TooltipWrapper = ({ children, showHint, ...props }) =>
  isMobile ? (
    children
  ) : (
    <Tooltip
      describeChild
      followCursor
      open={showHint}
      disableHoverListener={!showHint}
      disableFocusListener
      disableTouchListener
      placement="bottom-start"
      slots={{
        transition: Fade,
      }}
      slotProps={tooltipSlotProps}
      {...props}
    >
      <span>{children}</span>
    </Tooltip>
  );

const ImageDisplay = () => {
  const { t } = useTranslation('output');
  const { errorMessage, setErrorMessage, diagramId, svgData } = useHome();
  const isMac = /Mac|iPhone|iPad/.test(navigator.platform);
  const altKey = isMac ? '⌥ Option' : 'Alt';
  const [showHint, setShowHint] = useState(false);

  const parsedSvg = useMemo(() => parse(svgData), [svgData]);

  useEffect(() => {
    const timer = setTimeout(() => setShowHint(true), HINT_OPEN_DELAY);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!showHint) return;
    const timer = setTimeout(() => setShowHint(false), HINT_CLOSE_DELAY);
    /** @param {KeyboardEvent} e */
    const onAlt = (e) => {
      if (e.key === 'Alt') setShowHint(false);
    };
    window.addEventListener('keydown', onAlt);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', onAlt);
    };
  }, [showHint]);

  const { loupeRef, loupeInnerRef, handleMouseMove, handleMouseLeave } =
    useMagnifier({
      enabled: !isMobile,
      zoom: 3,
      loupeSize,
    });

  return (
    <>
      <Box
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        sx={{
          position: 'relative',
          mt: { xs: -1, sm: -2.5, md: -3 },
          mb: { xs: -2, sm: -3.5, md: -4.5 },
          mr: 0.5,
        }}
      >
        {/* Original SVG */}
        <TooltipWrapper
          title={t('hold_alt', { alt: altKey })}
          showHint={showHint}
        >
          <Box
            id="svg-container"
            sx={(theme) => ({
              // mt: { xs: -1, sm: -2.5, md: -3 },
              // mb: { xs: -2, sm: -3.5, md: -4.5 },
              // mr: 0.5,
              '& svg': { width: '100%', height: 'auto' },
              ...theme.applyStyles('dark', { filter: colorFilter }),
            })}
          >
            {parsedSvg}
          </Box>
        </TooltipWrapper>

        {/* Magnifier */}
        {!isMobile && (
          <Box ref={loupeRef} sx={loupeBaseStyle}>
            <Box
              ref={loupeInnerRef}
              sx={[
                loupeInnerBaseStyle,
                { '& svg': { display: 'block' } },
                (theme) => theme.applyStyles('dark', { filter: colorFilter }),
              ]}
            >
              {parsedSvg}
            </Box>
          </Box>
        )}
      </Box>

      <Stack id="download-img" direction="column" spacing={1}>
        <DownloadImage filenameBase={`sp_${diagramId}`} dpi={300} />
        {errorMessage.download &&
          !errorMessage.download.startsWith('errors:table_') && (
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
