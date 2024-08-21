// src/components/BackToTopButton.js
import React, { useCallback, useMemo } from 'react';
import { Fab, Tooltip, useScrollTrigger, Zoom } from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { styled } from '@mui/system';

const StyledFab = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(2),
  right: theme.spacing(2),
  opacity: 0.5, // Initial opacity
  backgroundColor: theme.palette.grey[300],
  border: `1px solid ${theme.palette.action.disabled}`,
  '&:hover': {
    opacity: 1, // Fully opaque when hovered
    color: theme.palette.primary.main,
    border: `1px solid ${theme.palette.primary.main}`,
  },
  [theme.breakpoints.between('sm', 'md')]: {
    right: theme.spacing(3),
  },
  [theme.breakpoints.between('md', 'lg')]: {
    right: 'calc(36% - 310px)',
  },
  [theme.breakpoints.up('lg')]: {
    right: 'calc(50% - 480px)',
  },
}));

const ScrollTop = ({ children }) => {
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 100, // When the button appears
  });

  const handleClick = useCallback((event) => {
    const anchor = (event.target.ownerDocument || document).querySelector('#back-to-top-anchor');
    if (anchor) {
      anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return (
    <Zoom in={trigger}>
      <div onClick={handleClick} role="presentation">
        {children}
      </div>
    </Zoom>
  );
};

const BackToTopButton = () => {
  const button = useMemo(
    () => (
      <Tooltip title="Back to Top" placement="left">
        <StyledFab color="inherit" size="small" aria-label="scroll back to top">
          <KeyboardArrowUpIcon />
        </StyledFab>
      </Tooltip>
    ),
    []
  );

  return <ScrollTop>{button}</ScrollTop>;
};

export default React.memo(BackToTopButton);
