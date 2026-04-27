// src/components/pwa/PwaUpdater.jsx
import { memo, useState, useEffect, useRef, useCallback } from 'react';
// import { useRegisterSW } from 'virtual:pwa-register/react';
import { registerSW } from 'virtual:pwa-register';
import { useTranslation } from 'react-i18next';
import { Snackbar, Button, Alert } from '@mui/material';
import Slide from '@mui/material/Slide';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { isDevMode } from '@utils/devMode';

/** @param {*} props */
const TransitionLeft = (props) => {
  return <Slide {...props} direction="left" />;
};

const PwaUpdater = () => {
  const { t } = useTranslation();

  const [needRefresh, setNeedRefresh] = useState(false);
  /** @type {ReactRef<(() => void) | null>} */
  const updateActionRef = useRef(null);

  /* Use manually */
  useEffect(() => {
    /* Ensures that PWA registration is only after the component is mounted, avoiding warnings */
    const updateSW = registerSW({
      immediate: true, // register immediately
      onRegisteredSW(r) {
        isDevMode && console.debug('⚙️ SW Registered:', r);
      },
      onRegisterError(error) {
        console.error('SW Registration Error:', error);
      },
      onNeedRefresh() {
        setNeedRefresh(true);
        /* Save the update function and wait for the user to click the Refresh button */
        updateActionRef.current = () => updateSW(true);
        console.debug('✨ A new version is ready.');
      },
    });
    /* No need to cleanup (Service Worker registration is an application-level persistence behavior) */
  }, []);

  /* Use the official hook to take over the update logic */
  // const {
  //   needRefresh: [needRefresh, setNeedRefresh],
  //   updateServiceWorker,
  // } = useRegisterSW({
  //   onRegisteredSW(r) {
  //     isDevMode && console.debug('⚙️ SW Registered:', r);
  //   },
  //   onRegisterError(error) {
  //     console.error('SW Registration Error:', error);
  //   },
  // });

  const handleUpdate = useCallback(() => {
    if (updateActionRef.current) {
      updateActionRef.current();
    }
  }, []);

  const handleIgnore = () => {
    setNeedRefresh(false);
  };

  /** @type {(event: Event | ReactSyntheticEvent<any, Event>, reason: 'timeout' | 'clickaway' | 'escapeKeyDown') => void} */
  const handleSnackbarClose = (event, reason) => {
    /* Must click Later or Esc to close it */
    if (reason === 'clickaway') return;
    setNeedRefresh(false);
  };

  return (
    <Snackbar
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      open={needRefresh}
      onClose={handleSnackbarClose}
      slots={{ transition: TransitionLeft }}
      key={TransitionLeft.name}
      sx={(theme) => ({ boxShadow: theme.shadows[4] })}
    >
      <Alert
        severity="success"
        variant="filled"
        icon={<AutoAwesomeIcon fontSize="small" />}
        sx={{
          alignItems: 'center',
          '& .MuiAlert-action': {
            paddingBottom: '3.2px',
            paddingLeft: 0.5,
          },
        }}
        action={
          <>
            <Button
              color="inherit"
              size="small"
              onClick={handleUpdate}
              sx={{ fontWeight: 'bold', minWidth: '48px', pr: 0 }}
            >
              {t('pwa_refresh')}
            </Button>
            <Button
              color="inherit"
              size="small"
              onClick={handleIgnore}
              sx={{ minWidth: '48px' }}
            >
              {t('pwa_later')}
            </Button>
          </>
        }
      >
        {t('pwa_new_version_found')}
      </Alert>
    </Snackbar>
  );
};

export default memo(PwaUpdater);
