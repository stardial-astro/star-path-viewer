// src/components/Navigation/CustomAppBar.js
import React, { useState, useCallback } from 'react';
import { Container, Box, IconButton, Tooltip, Snackbar, Alert } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import ShareIcon from '@mui/icons-material/Share';
import HomeIcon from '@mui/icons-material/Home';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { Link as RouterLink } from 'react-router-dom';
import { RWebShare } from 'react-web-share';
import { useLocation } from 'react-router-dom'; // Import the useLocation hook
import Config from '../../Config';
import LogoText from '../../assets/logo-text.svg';

const baseUrl = `${window.location.origin}${Config.basename}`;

const barIconStyle = {
  width: '1.3rem',
  height: 'auto',
};

const barBtnStyle = {
  '&:hover': {
    color: 'primary.main',
  },
};

const CustomAppBar = () => {
  const [shared, setShared] = useState(false);
  const currentRoute = useLocation();

  const handleShareSuccess = useCallback(() => {
    setShared(true);
  }, []);

  const handleSnackbarClose = useCallback(() => {
    setShared(false);
  }, []);

  return (
    <Container
      maxWidth="md"
      sx={{
        display: 'flex',
        alignItems: 'center',
        paddingX: 0,
      }}
    >
      <Box
        sx={{
          width: '100%',
          backgroundColor: 'background.paper',
          borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
          height: { xs: '2.1rem', sm: '2.5rem', md: '2.5rem' },
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mt: 0.5,
          px: { xs: 2, sm: 0, md: 0 },
        }}
      >
        {/* Left Side */}
        <Box display="flex" justifyContent="flex-start" alignItems="center" minWidth="82px" gap={1.5}>
          {currentRoute.pathname === '/' ? (
            <Tooltip title="About Us" placement="bottom-start">
              <RouterLink to="/about">
                <img
                  src={LogoText}
                  alt="Logo"
                  style={{
                    maxHeight: '1.3rem',
                    maxWidth: '82.58px',
                    width: '100%',
                    objectFit: 'contain',  // Maintain aspect ratio and contain the image within the Box
                    justifyContent: 'flex-start',
                    marginTop: '6px',
                    cursor: 'pointer',
                  }}
                />
              </RouterLink>
            </Tooltip>
          ) : (
            <IconButton
              component={RouterLink}
              to="/"
              aria-label="Home"
              color="action.active"
              size="small"
              sx={{ ...barBtnStyle, pl: 0, pr: 1 }}
            >
              <ArrowBackIosNewIcon sx={{ ...barIconStyle, ml: 0, mr: 0 }} />
              <HomeIcon sx={barIconStyle} />
            </IconButton>
          )}
        </Box>

        {/* Right Side */}
        <Box display="flex" alignItems="center" gap={1}>
          <Tooltip title="GitHub Repository" placement="bottom-end">
            <IconButton
              href="https://github.com/stardial-astro/star-path-viewer"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              size="small"
              color="action.active"
              sx={barBtnStyle}
            >
              <GitHubIcon sx={barIconStyle} />
            </IconButton>
          </Tooltip>
          <RWebShare
            disableNative={false}
            data={{
              text: "Star Path Viewer: An astronomical tool for tracing the positions of planets and stars on any date in the ancient or future sky.",
              url: baseUrl,
              title: "Check out Star Path Viewer",
            }}
            onClick={handleShareSuccess}
          >
            <Tooltip title="Share this website" placement="bottom-end">
              <IconButton
                aria-label="Share"
                color="action.active"
                size="small"
                sx={barBtnStyle}
              >
                <ShareIcon sx={barIconStyle} />
              </IconButton>
            </Tooltip>
          </RWebShare>
        </Box>
      </Box>

      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={shared}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        sx={(theme) => ({
          boxShadow: theme.shadows[2],
        })}
      >
        <Alert severity="success" sx={{ width: '100%', textAlign: 'left' }} onClose={handleSnackbarClose}>
          Shared successfully!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default React.memo(CustomAppBar);
