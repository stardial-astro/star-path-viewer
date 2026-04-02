// src/components/Navigation/CustomAppBar.jsx
import { memo, useState, useCallback } from 'react';
import { Container, Box, Tooltip, Snackbar } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import HomeIcon from '@mui/icons-material/Home';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { Link as RouterLink, useLocation } from 'react-router';
import config from '@utils/config';
import logo from '@assets/logo-text.svg';
import BarIconButton from '@components/UI/BarIconButton';
import CustomAlert from '@components/UI/CustomAlert';
import ColorModeToggle from '@components/UI/ColorModeToggle';
import ShareButton from '@components/UI/ShareButton';

const ABOUT_TITLE = 'About Us';
const GITHUB_TITLE = 'GitHub Repository';

const ABOUT_ROUT = '/about';

const ABOUT_LABEL = 'About';
const HOME_LABEL = 'Home';
const GITHUB_LABEL = 'GitHub';

const LOGO_ALT = 'About Stardial';

const SHARED_MSG = 'Shared successfully!';

/** @type {React.CSSProperties} */
const logoCssStyle = {
  maxHeight: '1.3rem',
  maxWidth: '82.58px',
  width: '100%',
  objectFit: 'contain', // Maintain aspect ratio and contain the image within the Box
  justifyContent: 'flex-start',
  marginTop: '6px',
  cursor: 'pointer',
};

const AboutButton = () => (
  <Tooltip title={ABOUT_TITLE} placement="bottom">
    <RouterLink to={ABOUT_ROUT} aria-label={ABOUT_LABEL}>
      <img src={logo} alt={LOGO_ALT} style={logoCssStyle} />
    </RouterLink>
  </Tooltip>
);

const HomeButton = () => (
  <BarIconButton
    component={RouterLink}
    to="/"
    aria-label={HOME_LABEL}
    sx={{ pl: 0, pr: 1 }}
  >
    <ArrowBackIosNewIcon fontSize="small" sx={{ ml: 0, mr: 0 }} />
    <HomeIcon fontSize="small" />
  </BarIconButton>
);

const GithubButton = () => (
  <Tooltip title={GITHUB_TITLE} placement="bottom">
    <div>
      <BarIconButton
        href={config.REPO_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={GITHUB_LABEL}
      >
        <GitHubIcon fontSize="small" />
      </BarIconButton>
    </div>
  </Tooltip>
);

const CustomAppBar = () => {
  const [shareStatus, setShareStatus] = useState({ success: false, error: '' });
  const currentRoute = useLocation();

  const handleSnackbarClose = useCallback(() => {
    setShareStatus({ success: false, error: '' });
  }, []);

  return (
    <Container
      sx={{ display: 'flex', maxWidth: 'md', alignItems: 'center', px: 0 }}
    >
      <Box
        sx={(theme) => ({
          width: '100%',
          backgroundColor: 'background.paper',
          borderBottom: `1px solid ${theme.palette.action.disabledBackground}`,
          height: { xs: '2.1rem', sm: '2.5rem', md: '2.5rem' },
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mt: 0.5,
          px: { xs: 2, sm: 0, md: 0 },
        })}
      >
        {/* Left Side */}
        <Box
          display="flex"
          justifyContent="flex-start"
          alignItems="center"
          minWidth="82px"
          gap={1.5}
        >
          {currentRoute.pathname === '/' ? <AboutButton /> : <HomeButton />}
        </Box>

        {/* Right Side */}
        <Box display="flex" alignItems="center" gap={0.5}>
          <ColorModeToggle />

          <GithubButton />

          <ShareButton setShareStatus={setShareStatus} />
        </Box>
      </Box>

      {(shareStatus.success || shareStatus.error) && (
        <Snackbar
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          open={shareStatus.success || !!shareStatus.error}
          autoHideDuration={5000}
          onClose={handleSnackbarClose}
          sx={(theme) => ({ boxShadow: theme.shadows[2] })}
        >
          <CustomAlert
            severity={shareStatus.error ? 'warning' : 'success'}
            onClose={handleSnackbarClose}
          >
            {shareStatus.error || SHARED_MSG}
          </CustomAlert>
        </Snackbar>
      )}
    </Container>
  );
};

export default memo(CustomAppBar);
