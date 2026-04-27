// src/components/ui/BackToTopButton.jsx
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Fab, Tooltip, Fade, Box } from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { styled } from '@mui/material/styles';
import useThrottledScroll from '@hooks/useThrottledScroll';
import isMobile from '@utils/isMobile';

const tooltipSlotProps = {
  popper: {
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [1, -5],
        },
      },
    ],
  },
};

const StyledFab = styled(Fab)(({ theme }) => {
  const palette = (theme.vars || theme).palette;
  return {
    // position: 'fixed',
    // bottom: theme.spacing(2),
    // right: theme.spacing(2),
    opacity: 0.5,
    color: palette.text.secondary,
    backgroundColor: palette.action.disabledBackground,
    border: `1px solid ${palette.action.disabled}`,
    '&:hover': {
      opacity: 1, // Fully opaque when hovered
      color: palette.primary.main,
      backgroundColor: palette.background.paper,
      border: `1px solid ${palette.primary.main}`,
      ...theme.applyStyles('dark', {
        color: palette.primary.contrastText,
        backgroundColor: palette.primary.main,
        border: `1px solid ${palette.primary.dark}`,
      }),
    },
    // [theme.breakpoints.between('sm', 'md')]: {
    //   right: theme.spacing(3),
    // },
    // [theme.breakpoints.between('md', 'lg')]: {
    //   right: 'calc(36% - 310px)',
    // },
    // [theme.breakpoints.up('lg')]: {
    //   right: 'calc(50% - 480px)',
    // },
    // zIndex: theme.zIndex.speedDial,
  };
});

/**
 * @param {object} props
 * @param {React.ReactNode} props.children
 */
const ScrollTop = ({ children }) => {
  const threshold = 100;
  // const trigger = useScrollTrigger({
  //   disableHysteresis: true,
  //   threshold,
  // });
  /* Use a lighter custom scroll hook */
  const trigger = useThrottledScroll(threshold);

  const handleClick = useCallback(() => {
    // const anchor = (event.target.ownerDocument || document).querySelector('#back-to-top-anchor');
    // if (anchor) {
    //   anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // }
    /* Standard window scroll is often smoother and lighter than finding
       a specific DOM anchor */
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <Fade in={trigger} timeout={200}>
      {/* <div onClick={handleClick} role="presentation">
        {children}
      </div> */}
      <Box
        onClick={handleClick}
        role="presentation"
        sx={(theme) => ({
          position: 'fixed', // Move positioning here, preventing the style calculation lag
          bottom: theme.spacing(2),
          right: {
            xs: theme.spacing(2),
            sm: theme.spacing(3),
            md: 'calc(36% - 310px)',
            lg: 'calc(50% - 480px)',
          },
          zIndex: theme.zIndex.speedDial,
        })}
      >
        {children}
      </Box>
    </Fade>
  );
};

const BackToTopButton = () => {
  const { t } = useTranslation();
  return (
    <ScrollTop>
      <Tooltip
        describeChild
        title={t('back_to_top')}
        placement="left"
        disableHoverListener={isMobile}
        enterTouchDelay={500}
        leaveTouchDelay={1000}
        slotProps={tooltipSlotProps}
      >
        {/* Wrapping in a span prevents Tooltip/Fade prop-drilling conflicts */}
        <span>
          <StyledFab
            aria-label="Scroll back to top"
            // color="inherit"
            size="small"
          >
            <KeyboardArrowUpIcon />
          </StyledFab>
        </span>
      </Tooltip>
    </ScrollTop>
  );
};

export default memo(BackToTopButton);
