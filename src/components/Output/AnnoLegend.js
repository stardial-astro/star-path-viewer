// src/components/Output/AnnoLegend.js
import React from 'react';
import { Box, Stack, Grid, Typography, IconButton } from '@mui/material';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { styled } from '@mui/system';
import { PT_DETAIL, LINE_DETAIL } from '../../utils/constants';
import CustomDivider from '../UI/CustomDivider';

const labelStyle = { textAlign: 'left', fontWeight: 500, minWidth: '1.5rem' };
const detailStyle = { textAlign: 'left', color: 'text.primary', ml: 1.5 };

const Line = ({ type }) => (
  <Box
    sx={{
      display: 'inline-block',
      width: '31px',
      height: '0px',
      borderBottom: type === 'dotted' ? '2px dotted rgba(0, 0, 0, 0.35)' :
                    type === 'solid' ? '3px solid black' :
                    type === 'lightDashed' ? '3px dashed rgba(0, 0, 0, 0.35)' :
                    type === 'darkDashed' ? '3px dashed black' :
                    'none',
      verticalAlign: 'middle',
      mb: '1px',
      mr: 1,
    }}
  />
);

const Dot = () => (
  <Box
    sx={{
      display: 'inline-block',
      width: '7px',
      height: '7px',
      bgcolor: 'red',
      borderRadius: '50%',
      verticalAlign: 'middle',
      mr: 1,
      mt: '6px',
    }}
  />
);

const DetailTooltip = styled(({ className, ...props }) => (
  <Tooltip
    {...props}
    placement="top-start"
    enterTouchDelay={0}
    leaveTouchDelay={20000}
    slotProps={{
      popper: {
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, -5],
            },
          },
        ],
        sx: {
          [`&.${tooltipClasses.popper}[data-popper-placement*="top"] .${tooltipClasses.tooltip}`]:
            {
              marginBottom: 2,
            },
        }
      },
    }}
    classes={{ popper: className }}
  />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.primary.main,
    maxWidth: 480,
    fontSize: theme.typography.body2.fontSize,
    fontWeight: 400,
    border: `1px solid ${theme.palette.primary.main}`,
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.1)',
  },
}));

const AnnoLegend = ({ anno }) => {
  return (
    <>
      <CustomDivider sx={{ mt: 1.5, mb: 0.5 }} />
      <Grid container pr={0.5} rowSpacing={0.5} columnSpacing={0} sx={{ maxWidth: '100%', margin: 'auto' }}>
        <Grid container item xs={12} sm={6.7} md={6.6}>
          <Stack direction="column" spacing={0.5} ml={{ xs: '4%', sm: '26%', md: 20 }}>
            {Object.keys(LINE_DETAIL).map((type, index) => (
              <Box key={index} display="flex" alignItems="center" flexWrap="wrap">
                <Line type={type} />
                <Typography variant="body2" sx={detailStyle}>
                  {LINE_DETAIL[type]}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Grid>

        <Grid container item xs={12} sm={5.3} md={5.4}>
          <Stack direction="column" spacing={0.5} ml={{ xs: '4%', sm: 2, md: 2 }}>
            {anno.map((item, index) => (
              <Box key={index} display="flex" alignItems="start" flexWrap="wrap">
                <Dot />
                <Typography variant="body2" color="red" sx={labelStyle}>
                  {item.name}
                </Typography>
                <Typography variant="body2" sx={detailStyle}>
                  {PT_DETAIL[item.name].name}
                  <DetailTooltip
                    title={PT_DETAIL[item.name].detail}
                  >
                    <IconButton size="small" sx={{ padding: 0, ml: 0.5 }}>
                      <HelpOutlineIcon sx={{ fontSize: '1rem', color: 'primary.main', mt: '-3px' }} />
                    </IconButton>
                  </DetailTooltip>
                </Typography>
              </Box>
            ))}
          </Stack>
        </Grid>
      </Grid>
      <CustomDivider sx={{ mt: 0.5, mb: 2 }} />
    </>
  );
};

export default React.memo(AnnoLegend);
