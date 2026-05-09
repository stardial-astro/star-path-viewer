// src/components/output/annotations/AnnoLegend.jsx
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { styled } from '@mui/material/styles';
import {
  Grid,
  Box,
  Stack,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  accordionSummaryClasses,
  IconButton,
} from '@mui/material';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import isMobile from '@utils/isMobile';
import { LINE_STYLES } from '@utils/constants';
import { colorFilter } from '@utils/outputUtils';
// import CustomDivider from '@components/ui/CustomDivider';
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';

const labelStyle = { fontWeight: 500, minWidth: '1.5rem' };

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
      borderBottomWidth:
        type.toLowerCase().includes('dotted') && !type.includes('thick')
          ? '2px'
          : '3px',
      borderBottomStyle: type.toLowerCase().includes('dashed')
        ? 'dashed'
        : type.toLowerCase().includes('dotted')
          ? 'dotted'
          : 'solid',
      borderBottomColor:
        type.includes('dark') || type === 'solid'
          ? 'text.primary'
          : 'text.disabled',
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

const tipIcon = (
  <IconButton size="small" sx={{ p: 0, ml: 0.5 }}>
    <InfoOutlinedIcon
      sx={{
        fontSize: '1rem',
        color: 'primary.main',
        mt: '-3px',
      }}
    />
  </IconButton>
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

const StyledAccordion = styled((props) => (
  <Accordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
  margin: 'auto',
  border: `1px solid ${(theme.vars || theme).palette.divider}`,
  maxWidth: '680px',
}));

const StyledAccordionSummary = styled((props) => (
  <AccordionSummary
    expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: '0.9rem' }} />}
    {...props}
  />
))(({ theme }) => ({
  backgroundColor: 'rgba(0, 0, 0, .03)',
  flexDirection: 'row-reverse',
  minHeight: '36px',
  paddingLeft: theme.spacing(1.4),
  [`& .${accordionSummaryClasses.expandIconWrapper}.${accordionSummaryClasses.expanded}`]:
    {
      transform: 'rotate(90deg)',
    },
  [`& .${accordionSummaryClasses.content}`]: {
    marginLeft: theme.spacing(1),
    marginTop: 0,
    marginBottom: 0,
  },
  [theme.breakpoints.up('sm')]: {
    minHeight: '40px',
    paddingLeft: theme.spacing(2),
    [`& .${accordionSummaryClasses.content}`]: {
      marginLeft: theme.spacing(1.5),
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
    },
  },
  ...theme.applyStyles('dark', {
    backgroundColor: 'rgba(255, 255, 255, .097)',
  }),
}));

const StyledAccordionDetails = styled(AccordionDetails)(({ theme }) => ({
  backgroundColor: 'rgba(0, 0, 0, .03)',
  paddingLeft: theme.spacing(1.5),
  paddingRight: theme.spacing(1.5),
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(1),
  borderTop: '1px solid rgba(0, 0, 0, .125)',
  [theme.breakpoints.up('sm')]: {
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(4),
    paddingTop: theme.spacing(1.5),
    paddingBottom: theme.spacing(1.5),
  },
  ...theme.applyStyles('dark', {
    backgroundColor: 'rgba(255, 255, 255, .05)',
  }),
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
      {/* <CustomDivider sx={{ mb: 1 }} /> */}

      <StyledAccordion defaultExpanded={!isMobile} disableGutters>
        <StyledAccordionSummary>
          <Typography variant="body1">{t('legend')}</Typography>
        </StyledAccordionSummary>

        <StyledAccordionDetails>
          <Grid
            container
            rowSpacing={0.5}
            columnSpacing={6}
            sx={{ m: 'auto', pr: 0.5 }}
          >
            <Grid
              container
              size={{ xs: 12, md: 6.6 }}
              justifyContent={{ xs: 'left', md: 'right' }}
            >
              <Stack direction="column" spacing={0.5}>
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

            <Grid container size={{ xs: 12, md: 'auto' }} justifyContent="left">
              <Stack direction="column" spacing={0.5}>
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
                        {tipIcon}
                      </DetailTooltip>
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Grid>
          </Grid>
        </StyledAccordionDetails>
      </StyledAccordion>

      {/* <CustomDivider sx={{ mt: 0.5, mb: 0.5 }} /> */}
    </>
  );
};

export default memo(AnnoLegend);
