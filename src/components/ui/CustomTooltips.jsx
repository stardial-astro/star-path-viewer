// src/components/ui/CustomTooltips.jsx
/* eslint-disable react-refresh/only-export-components */
import { styled } from '@mui/material/styles';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const infoTipIcon = (
  <InfoOutlinedIcon
    sx={{
      fontSize: '1rem',
      color: 'primary.main',
      mt: '-3px',
    }}
  />
);

const DetailTooltip = styled(({ className, ...props }) => (
  <Tooltip
    {...props}
    describeChild
    placement="top-start"
    disableFocusListener
    enterTouchDelay={0}
    leaveTouchDelay={6_000}
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

/** @param {*} param */
const DetailTooltipWrapper = ({ children, isMobile, onClickAway }) =>
  isMobile ? (
    <ClickAwayListener onClickAway={onClickAway}>
      <span role="presentation">{children}</span>
    </ClickAwayListener>
  ) : (
    children
  );

export { infoTipIcon, DetailTooltip, DetailTooltipWrapper };
