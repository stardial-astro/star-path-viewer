// src/components/output/annotations/AnnoTable.jsx
import { memo, useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { styled } from '@mui/material/styles';
import {
  Box,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Tooltip,
} from '@mui/material';
import isMobile from '@utils/isMobile';
import { datetimeToStr, formatTimezone } from '@utils/dateUtils';
import { formatDecimalDegrees } from '@utils/coordUtils';

const JULIAN_NAME = 'julian';
const LMT_NAME = 'lmt';
const UT1_NAME = 'ut1';
const LMT_LABEL = 'LMT';
const UT1_LABEL = 'UT1';

const pointWidth = '2.85rem';
const coordWidthFactor = 0.88;
const coordWidth = '5.25rem';
const timeMinWidth = '6.2rem';

const pointHeadStyle = { px: 0.5 };
const pointStyle = { px: 0.5, py: 1.5, fontWeight: 500 };
const timeHeadStyle = { pb: 0, borderBottom: 0 };
const timeHeadStyle2 = { pt: 0 };

const checkboxStyle = { '& .MuiSvgIcon-root': { fontSize: 18 } };
const checkboxLabelStyle = {
  '& .MuiFormControlLabel-label': {
    fontSize: '0.875rem',
  },
};

/** @param {number} colNumber */
const timeStyle = (colNumber) => ({
  whiteSpace: {
    sm: colNumber < 2 ? 'nowrap' : 'normal',
    md: colNumber < 4 ? 'nowrap' : 'normal',
  },
  overflow: 'hidden',
});

/** @param {number} colNumber */
const timeWidth = (colNumber) =>
  `calc(90% / ${coordWidthFactor * 2 + colNumber})`;

const StickyColumn = styled(TableCell)(({ theme }) => ({
  position: 'sticky',
  left: 0,
  textAlign: 'center',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  backgroundColor: (theme.vars || theme).palette.background.paper,
  borderRight: `1px solid ${(theme.vars || theme).palette.action.disabledBackground}`,
  zIndex: 1,
  ...theme.applyStyles('dark', {
    backgroundColor: 'rgb(41, 41, 41)',
  }),
}));

const CoordHeadCell = styled(TableCell)(() => ({
  textAlign: 'right',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  paddingLeft: '4px',
  paddingRight: '9px',
}));

const CoordCell = styled(TableCell)(() => ({
  textAlign: 'right',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  paddingLeft: '4px',
  paddingRight: '4px',
  paddingTop: '12px',
  paddingBottom: '12px',
}));

const TimeHeadCell = styled(TableCell)(() => ({
  textAlign: 'right',
  lineHeight: 1.25,
  paddingLeft: '4px',
  paddingRight: '8px',
}));

const TimeHeadCell2 = styled(TableCell)(() => ({
  textAlign: 'right',
  paddingLeft: '4px',
  paddingRight: '8px',
}));

const TimeCell = styled(TableCell)(() => ({
  textAlign: 'right',
  lineHeight: 1.25,
  paddingLeft: '4px',
  paddingRight: '8px',
  paddingTop: '12px',
  paddingBottom: '12px',
}));

const StyledRow = styled(TableRow)(() => ({
  // '&:nth-of-type(odd)': {
  //   backgroundColor: (theme.vars || theme).palette.action.hover,
  // },
  /* Hide last border */
  '&:last-child td, &:last-child th': {
    borderBottom: 0,
  },
}));

const SpacerCell = ({ ...props }) => <TableCell sx={{ p: 0 }} {...props} />;

const footnoteStyle = {
  color: 'text.secondary',
  mt: 1,
  ml: 1,
};

const footnoteMarkerRight = (
  <Typography
    component="span"
    variant="body2"
    sx={{
      position: 'absolute',
      top: -1.5,
      right: -7.5,
      color: 'error.main',
      userSelect: 'none',
    }}
  >
    *
  </Typography>
);

const footnoteMarkerLeft = (
  <Typography component="span" variant="body2" sx={{ color: 'error.main' }}>
    *
  </Typography>
);

/**
 * @param {object} param
 * @param {{ julian: boolean, lmt: boolean, ut1: boolean }} param.checked
 * @param {(event: ReactChangeEvent, checked: boolean) => void} param.onChange
 * @param {string} param.julianLabel
 */
const Checkboxes = ({ checked, onChange, julianLabel }) => (
  <FormGroup
    sx={{
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: { xs: 1, sm: 4 },
      ml: 1,
    }}
  >
    <FormControlLabel
      control={
        <Checkbox
          size="small"
          checked={checked.julian}
          onChange={onChange}
          name={JULIAN_NAME}
          sx={checkboxStyle}
        />
      }
      label={julianLabel}
      sx={checkboxLabelStyle}
    />
    <FormControlLabel
      control={
        <Checkbox
          size="small"
          checked={checked.lmt}
          onChange={onChange}
          name={LMT_NAME}
          sx={checkboxStyle}
        />
      }
      label={LMT_LABEL}
      sx={checkboxLabelStyle}
    />
    <FormControlLabel
      control={
        <Checkbox
          size="small"
          checked={checked.ut1}
          onChange={onChange}
          name={UT1_NAME}
          sx={checkboxStyle}
        />
      }
      label={UT1_LABEL}
      sx={checkboxLabelStyle}
    />
  </FormGroup>
);

/**
 * @param {object} params
 * @param {AnnoItem[]} params.anno - Filtered annotations.
 * @param {string} [params.tzname]
 */
const AnnoTable = ({ anno, tzname }) => {
  const { t } = useTranslation('output');
  const [checked, setChecked] = useState({
    julian: false,
    lmt: false,
    ut1: !isMobile,
  });

  const timeColNumber =
    (1 + +checked.julian) * (1 + +checked.lmt + +checked.ut1);

  const timeCol = useMemo(
    () => (
      <>
        <col
          style={{ width: timeWidth(timeColNumber), minWidth: timeMinWidth }}
        />
        {checked.julian && (
          <col
            style={{ width: timeWidth(timeColNumber), minWidth: timeMinWidth }}
          />
        )}
        <col />
      </>
    ),
    [checked.julian, timeColNumber],
  );

  const timeColumnHead = useMemo(
    () => (
      <>
        <TimeHeadCell2 sx={timeHeadStyle2}>{t('gregorian')}</TimeHeadCell2>
        {checked.julian && (
          <TimeHeadCell2 sx={timeHeadStyle2}>{t('julian')}</TimeHeadCell2>
        )}
      </>
    ),
    [t, checked.julian],
  );

  /** @type {(time_g: number[], time_j: number[]) => any} */
  const timeColumnCell = useCallback(
    (time_g, time_j) => (
      <>
        <TimeCell sx={timeStyle(timeColNumber)}>
          {datetimeToStr({ datetimeArr: time_g }).replace(/-/g, '\u2011')}
        </TimeCell>
        {checked.julian && (
          <TimeCell sx={timeStyle(timeColNumber)}>
            {datetimeToStr({ datetimeArr: time_j }).replace(/-/g, '\u2011')}
          </TimeCell>
        )}
        <SpacerCell />
      </>
    ),
    [checked.julian, timeColNumber],
  );

  /** @type {(event: ReactChangeEvent, checked: boolean) => void} */
  const handleChange = useCallback(
    (event) => {
      setChecked({ ...checked, [event.target.name]: event.target.checked });
    },
    [checked],
  );

  return (
    <>
      <Checkboxes
        checked={checked}
        onChange={handleChange}
        julianLabel={t('julian')}
      />

      <Box
        sx={{
          mx: 'auto',
          width: {
            xs: '100%',
            md: timeColNumber < 2 ? '60%' : timeColNumber < 3 ? '80%' : '100%',
          },
        }}
      >
        <TableContainer component={Paper} sx={{ overflow: 'auto' }}>
          <Table
            size="small"
            sx={{ borderCollapse: 'separate', tableLayout: 'fixed' }}
          >
            <colgroup>
              <col style={{ width: pointWidth }} />
              <col />
              <col style={{ width: coordWidth }} />
              <col />
              <col style={{ width: coordWidth }} />
              <col />
              {timeCol}
              {checked.lmt && timeCol}
              {checked.ut1 && timeCol}
            </colgroup>

            <TableHead>
              {/* Row 1 */}
              <TableRow>
                <StickyColumn rowSpan={2} sx={pointHeadStyle}>
                  {t('point')}
                </StickyColumn>
                <SpacerCell rowSpan={2} />
                <CoordHeadCell rowSpan={2}>{t('altitude')}</CoordHeadCell>
                <SpacerCell rowSpan={2} />
                <CoordHeadCell rowSpan={2}>{t('azimuth')}</CoordHeadCell>
                <SpacerCell rowSpan={2} />
                <TimeHeadCell
                  colSpan={checked.julian ? 2 : 1}
                  sx={timeHeadStyle}
                >
                  <Tooltip
                    describeChild
                    followCursor={!isMobile}
                    title={tzname || ''}
                    placement="top"
                    disableHoverListener={isMobile}
                    enterTouchDelay={500}
                    leaveTouchDelay={1000}
                  >
                    <Box
                      component="span"
                      sx={{ position: 'relative', display: 'inline-block' }}
                    >
                      {`${t('standard_time')} (${formatTimezone(anno[0].time_zone)})`}
                      {footnoteMarkerRight}
                    </Box>
                  </Tooltip>
                </TimeHeadCell>
                <SpacerCell rowSpan={2} />
                {checked.lmt && (
                  <>
                    <TimeHeadCell
                      colSpan={checked.julian ? 2 : 1}
                      sx={timeHeadStyle}
                    >
                      {t('lmt')}
                    </TimeHeadCell>
                    <SpacerCell rowSpan={2} />
                  </>
                )}
                {checked.ut1 && (
                  <>
                    <TimeHeadCell
                      colSpan={checked.julian ? 2 : 1}
                      sx={timeHeadStyle}
                    >
                      {t('ut1')}
                    </TimeHeadCell>
                    <SpacerCell rowSpan={2} />
                  </>
                )}
              </TableRow>
              {/* Row 2: Gregorian and Julian columns */}
              <TableRow>
                {timeColumnHead}
                {checked.lmt && timeColumnHead}
                {checked.ut1 && timeColumnHead}
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(anno).map(([key, item]) => (
                <StyledRow key={key}>
                  <StickyColumn component="th" scope="row" sx={pointStyle}>
                    {item.name}
                  </StickyColumn>
                  <SpacerCell />
                  <CoordCell>{formatDecimalDegrees(item.alt)}</CoordCell>
                  <SpacerCell />
                  <CoordCell>{formatDecimalDegrees(item.az)}</CoordCell>
                  <SpacerCell />
                  {timeColumnCell(
                    item.time_standard,
                    item.time_standard_julian,
                  )}
                  {checked.lmt &&
                    timeColumnCell(
                      item.time_local_mean,
                      item.time_local_mean_julian,
                    )}
                  {checked.ut1 &&
                    timeColumnCell(item.time_ut1, item.time_ut1_julian)}
                </StyledRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Typography variant="body2" align="left" sx={footnoteStyle}>
          {footnoteMarkerLeft}
          {' ' + t('no_dst')}
        </Typography>
      </Box>
    </>
  );
};

export default memo(AnnoTable);
