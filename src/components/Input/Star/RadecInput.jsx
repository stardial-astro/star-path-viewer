// src/components/Input/Star/RadecInput.jsx
import React from 'react';
import { Grid } from '@mui/material';
import { useStarInput } from '@context/StarInputContext';
import { FORMAT_DD } from '@utils/constants';
import RadecFormatToggle from './RadecFormatToggle';
import RadecDecimalInput from './RadecDecimalInput';
import RadecRaHmsInput from './RadecRaHmsInput';
import RadecDecDmsInput from './RadecDecDmsInput';

const RadecInput = () => {
  const { radecFormat } = useStarInput();

  return (
    <div>
      <RadecFormatToggle />

      {radecFormat === FORMAT_DD ? (
        <RadecDecimalInput />
      ) : (
        <Grid container spacing={{ xs: 2, sm: 2, md: 3 }} alignItems="flex-start">
          <RadecRaHmsInput />
          <RadecDecDmsInput />
        </Grid>
      )}
    </div>
  );
};

export default React.memo(RadecInput);
