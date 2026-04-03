// src/components/output/annotations/AnnoLegend.jsx
import { memo } from 'react';
import { useTheme, styled, lighten } from '@mui/material/styles';
import { Grid, Box, Stack, Typography, IconButton } from '@mui/material';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { PT_DETAIL, LINE_DETAIL } from '@utils/constants';
import { colorFilter } from '@utils/outputUtils';
import CustomDivider from '@components/ui/CustomDivider';

const labelStyle = { fontWeight: 500, minWidth: '1.5rem' };
const detailStyle = { color: 'text.primary', ml: 1.5 };

/**
 * @param {object} param
 * @param {string} param.type
 */
const Line = ({ type }) => (
  <Box
    sx={({ palette }) => ({
      display: 'inline-block',
      width: '31px',
      height: '0px',
      borderBottom:
        type === 'dotted'
          ? `2px dotted ${palette.text.disabled}`
          : type === 'solid'
            ? `3px solid ${palette.text.primary}`
            : type === 'lightDashed'
              ? `3px dashed ${palette.text.disabled}`
              : type === 'darkDashed'
                ? `3px dashed ${palette.text.primary}`
                : 'none',
      verticalAlign: 'middle',
      mb: '1px',
      mr: 1,
    })}
  />
);

/** @param {*} param */
const Dot = ({ isDarkMode }) => (
  <Box
    sx={{
      filter: colorFilter(isDarkMode),
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
    leaveTouchDelay={20_000}
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
      },
    }}
    classes={{ popper: className }}
  />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    color: theme.palette.primary.main,
    backgroundColor: theme.palette.background.paper,
    maxWidth: 480,
    fontSize: theme.typography.body2.fontSize,
    fontWeight: 400,
    border: `1px solid ${theme.palette.primary.main}`,
    boxShadow: `0px 2px 6px ${theme.palette.action.disabledBackground}`,
    ...theme.applyStyles('dark', {
      backgroundColor: lighten(theme.palette.background.paper, 0.1),
      border: `1px solid ${theme.palette.primary.main}`,
    }),
  },
}));

/**
 * @param {object} params
 * @param {AnnoItem[]} params.anno - Filtered annotations.
 *                                 Only `annoItem.name` is used here.
 */
const AnnoLegend = ({ anno }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  return (
    <>
      <CustomDivider sx={{ mt: 1.5, mb: 1 }} />
      <Grid
        container
        rowSpacing={0.5}
        columnSpacing={0}
        sx={{ m: 'auto', pr: 0.5 }}
      >
        <Grid container size={{ xs: 12, sm: 6.7, md: 6.6 }}>
          <Stack
            direction="column"
            spacing={0.5}
            ml={{ xs: '4%', sm: '26%', md: 20 }}
          >
            {Object.entries(LINE_DETAIL).map(([key, value]) => (
              <Box key={key} display="flex" alignItems="center" flexWrap="wrap">
                <Line type={key} />
                <Typography variant="body2" align="left" sx={detailStyle}>
                  {value}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Grid>

        <Grid container size={{ xs: 12, sm: 5.3, md: 5.4 }}>
          <Stack
            direction="column"
            spacing={0.5}
            ml={{ xs: '4%', sm: 2, md: 2 }}
          >
            {Object.entries(anno).map(([key, item]) => (
              <Box key={key} display="flex" alignItems="start" flexWrap="wrap">
                <Dot isDarkMode={isDarkMode} />
                <Typography
                  variant="body2"
                  align="left"
                  color="red"
                  sx={{ filter: colorFilter(isDarkMode), ...labelStyle }}
                >
                  {item.name}
                </Typography>
                <Typography variant="body2" align="left" sx={detailStyle}>
                  {PT_DETAIL[item.name].name}
                  <DetailTooltip title={PT_DETAIL[item.name].detail}>
                    <IconButton size="small" sx={{ p: 0, ml: 0.5 }}>
                      <InfoOutlinedIcon
                        sx={{
                          fontSize: '1rem',
                          color: 'primary.main',
                          mt: '-3px',
                        }}
                      />
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

export default memo(AnnoLegend);
