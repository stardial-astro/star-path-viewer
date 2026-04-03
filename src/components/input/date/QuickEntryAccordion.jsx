// src/components/input/date/QuickEntryAccordion.jsx
import { memo, useCallback } from 'react';
import {
  Box,
  Grid,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useHome } from '@context/HomeContext';
import { useDateInput } from '@context/DateInputContext';
import * as actionTypes from '@context/dateInputActionTypes';
import isMobile from '@utils/isMobile';
import { EQX_SOL_NAMES, CALS } from '@utils/constants';
import CustomToggleButton from '@components/ui/CustomToggleButton';

const summaryStyle = {
  minHeight: 0,
  '& .MuiAccordionSummary-content': {
    my: 1,
  },
};

const expandIcon = <ExpandMoreIcon sx={{ color: 'primary.main' }} />;

const QuickEntryAccordion = () => {
  // console.log('Rendering QuickEntryAccordion');
  const { errorMessage } = useHome();
  const { flag, flagRef, dateDispatch } = useDateInput();

  /* When toggles flag, KEEP the date values */

  /** @type {(event: ReactMouseEvent, value: Flag) => void} */
  const handleFlagChange = useCallback(
    (event, value) => {
      /* value won't be empty */
      if (flag === value) {
        /* If clicks the same button, deselect */
        flagRef.current = '';
        dateDispatch({ type: actionTypes.SET_FLAG, payload: '' });
      } else {
        /* If selects another, set the value */
        flagRef.current = value;
        dateDispatch({ type: actionTypes.SET_FLAG, payload: value });
        /* Force to select Gregorian immediately */
        dateDispatch({ type: actionTypes.SET_CAL, payload: CALS.gregorian });
      }
    },
    [flag, flagRef, dateDispatch],
  );

  return (
    <Accordion defaultExpanded={!isMobile} disableGutters>
      <AccordionSummary expandIcon={expandIcon} sx={summaryStyle}>
        <Box
          display="flex"
          flexDirection={{ xs: 'column', sm: 'row' }}
          alignItems="flex-start"
          flexWrap="wrap"
          sx={{ pr: 1 }}
        >
          <Box flex="1 0 auto" textAlign="left" sx={{ mr: 1 }}>
            <Typography variant="body1" sx={{ color: 'primary.main' }}>
              {flag ? `Checked: ${EQX_SOL_NAMES[flag]}` : 'Quick Entry'}
            </Typography>
          </Box>
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ px: 1.5, pt: 0, pb: 1.5 }}>
        <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
          {Object.entries(EQX_SOL_NAMES).map(([key, value]) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={key}>
              <Tooltip
                title={
                  flag !== key
                    ? `Click to fill in the ${value} date`
                    : 'Click again to deselect'
                }
                enterDelay={1000}
                enterNextDelay={500}
              >
                <div>
                  <CustomToggleButton
                    aria-label={value}
                    color="primary"
                    size="small"
                    disabled={!!errorMessage.server}
                    value={key}
                    selected={flag === key}
                    onChange={handleFlagChange}
                    fullWidth
                  >
                    {value}
                  </CustomToggleButton>
                </div>
              </Tooltip>
            </Grid>
          ))}
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
};

export default memo(QuickEntryAccordion);
