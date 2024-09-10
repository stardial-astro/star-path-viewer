// src/components/Input/Date/QuickEntryAccordion.js
import React, { useCallback } from 'react';
import { Box, Grid, Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useDateInput } from '../../../context/DateInputContext';
import * as actionTypes from '../../../context/dateInputActionTypes';
import { EQX_SOL_NAMES } from '../../../utils/constants';
import CustomToggleButton from '../../UI/CustomToggleButton';

const QuickEntryAccordion = () => {
  const {
    flag,  // 've', 'ss', 'ae', 'ws'
    queryDateFromRef,
    dateDispatch,
  } = useDateInput();

  const handleFlagChange = useCallback((event, newFlag) => {
    if (flag === newFlag) {
      dateDispatch({ type: actionTypes.SET_FLAG, payload: '' });  // Deselect
    } else {
      dateDispatch({ type: actionTypes.SET_FLAG, payload: newFlag });  // Select another
      if (newFlag) {
        queryDateFromRef.current = 'click';
        dateDispatch({ type: actionTypes.SET_DATE_FETCHING_ON });
        dateDispatch({ type: actionTypes.SET_DATE_VALID, payload: false });
        dateDispatch({ type: actionTypes.SET_CAL, payload: '' });  // Force to use Gregorian
      }
    }
  }, [flag, queryDateFromRef, dateDispatch]);

  return (
    <Accordion defaultExpanded disableGutters>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ color: 'primary.main' }} />}
        sx={{
          minHeight: 0,
          '& .MuiAccordionSummary-content': {
            marginY: 1,
          }
        }}
      >
        <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} alignItems="flex-start" pr={1} flexWrap="wrap">
          <Box flex="1 0 auto" textAlign="left" mr={1}>
            <Typography color="primary" variant="body1">
              Quick Entry
            </Typography>
          </Box>
          {/* {date.year && dateFetching && (
            <Box display="flex" alignItems="center" textAlign="left" flexWrap="wrap">
              <Typography color="action.active" variant="body1">
                &gt; Quering the {EQX_SOL_NAMES[flag]} of this year at this location ...
              </Typography>
            </Box>
          )} */}
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ paddingX: 1.5, paddingTop: 0, paddingBottom: 1.5 }}>
        <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
          {Object.entries(EQX_SOL_NAMES).map(([key, value]) => (
            <Grid item xs={12} sm={6} md={3} key={key}>
              <CustomToggleButton
                color="primary"
                size="small"
                aria-label={value}
                value={key}
                selected={flag === key}
                onChange={handleFlagChange}
                fullWidth
              >
                {value}
              </CustomToggleButton>
            </Grid>
          ))}
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
};

export default React.memo(QuickEntryAccordion);
