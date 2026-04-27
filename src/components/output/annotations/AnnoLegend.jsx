// src/components/output/annotations/AnnoLegend.jsx
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { styled } from '@mui/material/styles';
import { Grid, Box, Stack, Typography, IconButton } from '@mui/material';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import isMobile from '@utils/isMobile';
import { LINE_STYLES } from '@utils/constants';
import { colorFilter } from '@utils/outputUtils';
import CustomDivider from '@components/ui/CustomDivider';

const labelStyle = {
  fontWeight: 500,
  minWidth: '1.5rem',
};

const detailStyle = { color: 'text.primary', ml: 1.5 };

/**
 * @param {object} param
 * @param {string} param.type
 */
const Line = ({ type }) => (
  <Box
    sx={{
      display: 'inline-block',
      width: '31px',
      height: '0px',
      borderBottomWidth: type === 'dotted' ? '2px' : '3px',
      borderBottomStyle: type.toLowerCase().includes('dashed')
        ? 'dashed'
        : type === 'dotted'
          ? 'dotted'
          : 'solid',
      borderBottomColor:
        type.includes('dark') || type === 'solid'
          ? 'text.primary'
          : 'text.disabled',
      // borderBottom:
      //   type === 'dotted'
      //     ? '2px dotted text.disabled'
      //     : type === 'solid'
      //       ? '3px solid text.primary'
      //       : type === 'lightDashed'
      //         ? '3px dashed text.disabled'
      //         : type === 'darkDashed'
      //           ? '3px dashed text.primary'
      //           : 'none',
      verticalAlign: 'middle',
      mb: '1px',
      mr: 1,
    }}
  />
);

const Dot = () => (
  <Box
    sx={(theme) => ({
      display: 'inline-block',
      width: '7px',
      height: '7px',
      bgcolor: 'red',
      borderRadius: '50%',
      verticalAlign: 'middle',
      mr: 1,
      mt: '6px',
      ...theme.applyStyles('dark', {
        filter: colorFilter,
      }),
    })}
  />
);

const DetailTooltip = styled(({ className, ...props }) => (
  <Tooltip
    {...props}
    describeChild
    placement="top-start"
    disableHoverListener={isMobile}
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
    color: theme.vars.palette.primary.main,
    backgroundColor: theme.vars.palette.background.paper,
    maxWidth: 480,
    fontSize: theme.typography.body2.fontSize,
    fontWeight: 400,
    border: `1px solid ${theme.vars.palette.primary.main}`,
    boxShadow: `0px 2px 6px ${theme.vars.palette.action.disabledBackground}`,
    ...theme.applyStyles('dark', {
      backgroundColor: 'rgb(41, 41, 41)',
      border: `1px solid ${theme.vars.palette.primary.main}`,
    }),
  },
}));

/**
 * @param {object} params
 * @param {AnnoItem[]} params.anno - Filtered annotations.
 *                                 Only `annoItem.name` is used here.
 */
const AnnoLegend = ({ anno }) => {
  const { t } = useTranslation('output');
  /** @type {Record<PtLabel | string, any>} */
  const pointAnno = t('point_anno', { returnObjects: true });
  /** @type {Record<LineStyle | string, any>} */
  const lineLegend = t('line_legend', { returnObjects: true });

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
            {LINE_STYLES.map((style) => (
              <Box
                key={style}
                display="flex"
                flexWrap="wrap"
                alignItems="center"
              >
                <Line type={style} />
                <Typography variant="body2" align="left" sx={detailStyle}>
                  {lineLegend[style]}
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
              <Box
                key={key}
                display="flex"
                flexWrap="wrap"
                alignItems="flex-start"
              >
                <Dot />
                <Typography
                  variant="body2"
                  align="left"
                  color="red"
                  sx={(theme) => ({
                    ...labelStyle,
                    ...theme.applyStyles('dark', {
                      filter: colorFilter,
                    }),
                  })}
                >
                  {item.name}
                </Typography>
                <Typography variant="body2" align="left" sx={detailStyle}>
                  {pointAnno[item.name].name}
                  <DetailTooltip title={pointAnno[item.name].detail}>
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
