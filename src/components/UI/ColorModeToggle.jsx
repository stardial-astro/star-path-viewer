// src/components/UI/ColorModeToggle.jsx
import { useCallback } from 'react';
import Tooltip from '@mui/material/Tooltip';
import { useColorScheme } from '@mui/material/styles';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import BrightnessMediumOutlinedIcon from '@mui/icons-material/BrightnessMediumOutlined';
import BarIconButton from './BarIconButton';

/** @type {ColorMode[]} */
const MODE_CYCLES = ['light', 'dark', 'system'];
const MODE_CYCLE_LEN = MODE_CYCLES.length;

const MODE_LABELS = {
  light: 'Light mode',
  dark: 'Dark mode',
  system: 'System mode',
};

const MODE_ICONS = {
  light: <LightModeOutlinedIcon fontSize="small" />,
  dark: <DarkModeOutlinedIcon fontSize="small" />,
  system: <BrightnessMediumOutlinedIcon fontSize="small" />,
};

const ColorModeToggle = () => {
  const { mode, setMode } = useColorScheme();

  const currentMode = mode && MODE_CYCLES.includes(mode) ? mode : 'system';

  const nextMode =
    MODE_CYCLES[(MODE_CYCLES.indexOf(currentMode) + 1) % MODE_CYCLE_LEN];

  const handleToggle = useCallback(() => {
    setMode(nextMode);
  }, [nextMode, setMode]);

  return (
    <Tooltip title={MODE_LABELS[currentMode]} placement="bottom">
      <div>
        <BarIconButton
          aria-label={MODE_LABELS[currentMode]}
          onClick={handleToggle}
          sx={{ mr: 0.3 }}
        >
          {MODE_ICONS[currentMode]}
        </BarIconButton>
      </div>
    </Tooltip>
  );
};

export default ColorModeToggle;
