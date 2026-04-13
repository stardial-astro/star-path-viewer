// src/components/input/star/StarInputTypeToggle.jsx
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useStarInput } from '@context/StarInputContext';
import * as actionTypes from '@context/starInputActionTypes';
import { STAR_INPUT_TYPES } from '@utils/constants';

const STAR_INPUT_TYPE_LABEL = 'Star input type';

const NAME_LABEL = 'Input name';
const HIP_LABEL = 'Input HIP';
const RADEC_LABEL = 'Input radec';

const StarInputTypeToggle = () => {
  const { t } = useTranslation('star');
  const { starInputType, resetStarValues, starDispatch } = useStarInput();

  /** @type {(event: ReactMouseEvent, value: StarInputType) => void} */
  const handleInputTypeChange = useCallback(
    (event, value) => {
      /* Block deselection (when value is null) */
      if (value === null) return;
      starDispatch({ type: actionTypes.SET_INPUT_TYPE, payload: value });
      /* Clear name, HIP, suggestions, RA/Dec and resets validity */
      resetStarValues();
    },
    [resetStarValues, starDispatch],
  );

  return (
    <ToggleButtonGroup
      exclusive
      aria-label={STAR_INPUT_TYPE_LABEL}
      color="primary"
      size="small"
      value={starInputType}
      onChange={handleInputTypeChange}
      fullWidth
    >
      <ToggleButton value={STAR_INPUT_TYPES.name} aria-label={NAME_LABEL}>
        {t('planet')}
      </ToggleButton>
      <ToggleButton value={STAR_INPUT_TYPES.hip} aria-label={HIP_LABEL}>
        {t('star')}
      </ToggleButton>
      <ToggleButton value={STAR_INPUT_TYPES.radec} aria-label={RADEC_LABEL}>
        {t('radec')}
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

export default memo(StarInputTypeToggle);
