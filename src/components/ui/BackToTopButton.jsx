// src/components/ui/BackToTopButton.jsx
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Fab, Tooltip, Fade, Box } from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { styled } from '@mui/material/styles';
import useThrottledScroll from '@hooks/useThrottledScroll';

const StyledFab = styled(Fab)(({ theme }) => ({
  // position: 'fixed',
  // bottom: theme.spacing(2),
  // right: theme.spacing(2),
  opacity: 0.5,
  color: theme.palette.text.secondary,
  backgroundColor: theme.palette.action.disabledBackground,
  border: `1px solid ${theme.palette.action.disabled}`,
  '&:hover': {
    opacity: 1, // Fully opaque when hovered
    color: theme.palette.primary.main,
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.primary.main}`,
    ...theme.applyStyles('dark', {
      color: theme.palette.primary.contrastText,
      backgroundColor: theme.palette.primary.main,
      border: `1px solid ${theme.palette.primary.dark}`,
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
}));

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
      <Tooltip title={t('back_to_top')} placement="left">
        {/* Wrapping in a span prevents Tooltip/Fade prop-drilling conflicts */}
        <div>
          <StyledFab
            aria-label="Scroll back to top"
            // color="inherit"
            size="small"
          >
            <KeyboardArrowUpIcon />
          </StyledFab>
        </div>
      </Tooltip>
    </ScrollTop>
  );
};

export default memo(BackToTopButton);
