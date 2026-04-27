// src/components/navigation/CustomAppBar.jsx
import { memo, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, Box, Tooltip, Snackbar } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import HomeIcon from '@mui/icons-material/Home';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { Link as RouterLink, useLocation } from 'react-router';
import logo from '@assets/logo-text.svg';
import isMobile from '@utils/isMobile';
import config from '@utils/config';
import CustomIconButton from '@components/ui/CustomIconButton';
import CustomAlert from '@components/ui/CustomAlert';
import LanguageSelector from '@components/ui/LanguageSelector';
import ColorModeToggle from '@components/ui/ColorModeToggle';
import ShareButton from '@components/ui/ShareButton';

const ABOUT_ROUT = '/about';

const ABOUT_LABEL = 'About';
const HOME_LABEL = 'Home';
const GITHUB_LABEL = 'GitHub';

const LOGO_ALT = 'About Stardial';

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

/** @param {*} param */
const AboutButton = ({ title }) => (
  <Tooltip
    describeChild
    title={title}
    placement="bottom"
    disableHoverListener={isMobile}
    enterTouchDelay={300}
    leaveTouchDelay={1000}
  >
    <RouterLink to={ABOUT_ROUT} aria-label={ABOUT_LABEL}>
      <img src={logo} alt={LOGO_ALT} style={logoCssStyle} />
    </RouterLink>
  </Tooltip>
);

const HomeButton = () => (
  <CustomIconButton
    component={RouterLink}
    to="/"
    aria-label={HOME_LABEL}
    sx={{ pl: 0, pr: 1 }}
  >
    <ArrowBackIosNewIcon fontSize="small" sx={{ ml: 0, mr: 0 }} />
    <HomeIcon fontSize="small" />
  </CustomIconButton>
);

/** @param {*} param */
const GithubButton = ({ title }) => (
  <Tooltip
    describeChild
    title={title}
    placement="bottom"
    disableHoverListener={isMobile}
    enterTouchDelay={800}
    leaveTouchDelay={1000}
  >
    <span>
      <CustomIconButton
        href={config.REPO_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={GITHUB_LABEL}
      >
        <GitHubIcon fontSize="inherit" />
      </CustomIconButton>
    </span>
  </Tooltip>
);

const CustomAppBar = () => {
  const { t } = useTranslation();
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
          borderBottom: `1px solid ${(theme.vars || theme).palette.action.disabledBackground}`,
          height: { xs: '2.1rem', sm: '2.5rem', md: '2.5rem' },
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mt: 0.5,
          px: { xs: 2, sm: 0 },
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
          {currentRoute.pathname === '/' ? (
            <AboutButton
              title={t('about_us')}
              alt={`${t('about')} ${config.TEAM_NAME}`}
            />
          ) : (
            <HomeButton />
          )}
        </Box>

        {/* Right Side */}
        <Box
          display="flex"
          alignItems="center"
          gap={{ xs: 0, sm: 0.5 }}
          sx={{ mr: -0.5 }}
        >
          <ColorModeToggle />
          <LanguageSelector />
          <GithubButton title={t('github_repo')} />
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
            {shareStatus.error || t('share_success')}
          </CustomAlert>
        </Snackbar>
      )}
    </Container>
  );
};

export default memo(CustomAppBar);
