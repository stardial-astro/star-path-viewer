// src/components/input/star/RadecFormatToggle.jsx
import { memo, useCallback } from 'react';
import { FormControl, RadioGroup, Radio } from '@mui/material';
import { useStarInput } from '@context/StarInputContext';
import * as actionTypes from '@context/starInputActionTypes';
import { RADEC_TYPES } from '@utils/constants';
import CustomFormControlLabel from '@components/ui/CustomFormControlLabel';

const RadecFormatToggle = () => {
  const { radecFormat, starDispatch } = useStarInput();

  /** @type {(event: ReactChangeEvent, value: any) => void} */
  const handleRadecFormatChange = useCallback(
    (event, value) => {
      starDispatch({ type: actionTypes.SET_RADEC_FORMAT, payload: value });
      /* Clear RA/Dec */
      starDispatch({ type: actionTypes.CLEAR_STAR_RADEC });
      starDispatch({ type: actionTypes.CLEAR_STAR_RA_HMS });
      starDispatch({ type: actionTypes.CLEAR_STAR_DEC_DMS });
    },
    [starDispatch],
  );

  return (
    <FormControl>
      <RadioGroup
        row
        name="radec-format-radio-group"
        value={radecFormat}
        sx={{ mt: 0.8, mb: 1, justifyContent: 'space-around' }}
        onChange={handleRadecFormatChange}
      >
        <CustomFormControlLabel
          name={RADEC_TYPES.dms}
          value={RADEC_TYPES.dms}
          control={<Radio />}
          label="HMS and DMS"
          checked={radecFormat === RADEC_TYPES.dms}
        />
        <CustomFormControlLabel
          name={RADEC_TYPES.dd}
          value={RADEC_TYPES.dd}
          control={<Radio />}
          label="Decimal Degrees"
          checked={radecFormat === RADEC_TYPES.dd}
        />
      </RadioGroup>
    </FormControl>
  );
};

export default memo(RadecFormatToggle);
