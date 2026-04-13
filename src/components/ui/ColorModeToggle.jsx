// src/components/ui/ColorModeToggle.jsx
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import Tooltip from '@mui/material/Tooltip';
import { useColorScheme } from '@mui/material/styles';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import BrightnessMediumOutlinedIcon from '@mui/icons-material/BrightnessMediumOutlined';
import CustomIconButton from './CustomIconButton';

/** @type {ColorMode[]} */
const MODE_CYCLES = ['light', 'dark', 'system'];
const MODE_CYCLE_LEN = MODE_CYCLES.length;

const MODE_LABELS = {
  light: 'color_mode.light',
  dark: 'color_mode.dark',
  system: 'color_mode.system',
}; // i18n keys

const MODE_ICONS = {
  light: <LightModeOutlinedIcon fontSize="inherit" />,
  dark: <DarkModeOutlinedIcon fontSize="inherit" />,
  system: <BrightnessMediumOutlinedIcon fontSize="inherit" />,
};

const ColorModeToggle = () => {
  const { t } = useTranslation();
  const { mode, setMode } = useColorScheme();

  const currentMode = mode && MODE_CYCLES.includes(mode) ? mode : 'system';

  const nextMode =
    MODE_CYCLES[(MODE_CYCLES.indexOf(currentMode) + 1) % MODE_CYCLE_LEN];

  const handleToggle = useCallback(() => {
    setMode(nextMode);
  }, [nextMode, setMode]);

  return (
    <Tooltip
      describeChild
      title={t(MODE_LABELS[currentMode], 'Toggle color mode')}
      placement="bottom"
      enterTouchDelay={0}
      leaveTouchDelay={3000}
    >
      <span>
        <CustomIconButton
          aria-label={MODE_LABELS[currentMode].split('.')[1]}
          onClick={handleToggle}
        >
          {MODE_ICONS[currentMode]}
        </CustomIconButton>
      </span>
    </Tooltip>
  );
};

export default ColorModeToggle;
