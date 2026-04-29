// src/components/navigation/CustomAppBar.jsx
import { memo, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Container,
  Box,
  Slide,
  Tooltip,
  Snackbar,
  useScrollTrigger,
} from '@mui/material';
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
  // maxHeight: '1.3rem',
  width: '82.58px',
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

/** @param {*} param */
const HideOnScroll = ({ children, trigger }) => {
  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
};

const CustomAppBar = () => {
  const { t } = useTranslation();
  const [shareStatus, setShareStatus] = useState({ success: false, error: '' });
  const currentRoute = useLocation();

  const trigger = useScrollTrigger({
    threshold: 10,
  });

  const handleSnackbarClose = useCallback(() => {
    setShareStatus({ success: false, error: '' });
  }, []);

  return (
    <HideOnScroll trigger={trigger}>
      <Box
        sx={(theme) => ({
          position: 'fixed', // must be 'fixed' to enable hiding
          top: 0,
          left: 0,
          right: 0,
          zIndex: theme.zIndex.appBar,
        })}
      >
        <Container
          sx={(theme) => ({
            display: 'flex',
            flexDirection: 'column',
            maxWidth: 'md',
            // alignItems: 'center',
            // position: 'sticky',
            // top: 0,
            px: 0,
            transition: 'all 0.3s ease',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(8px)',
            // boxShadow: trigger ? theme.shadows[2] : 'none',
            zIndex: theme.zIndex.appBar,
            ...theme.applyStyles('dark', {
              backgroundColor: 'rgba(18, 18, 18, 0.7)',
            }),
          })}
        >
          <Box
            sx={(theme) => ({
              width: '100%',
              borderBottom: `1px solid ${(theme.vars || theme).palette.action.disabledBackground}`,
              height: { xs: '2.1rem', sm: '2.5rem' },
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
              sx={(theme) => ({
                top: {
                  xs: 'calc(2.1rem + 12px) !important',
                  sm: 'calc(2.5rem + 12px) !important',
                },
                boxShadow: theme.shadows[2],
                zIndex: theme.zIndex.tooltip,
              })}
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
      </Box>
    </HideOnScroll>
  );
};

export default memo(CustomAppBar);
