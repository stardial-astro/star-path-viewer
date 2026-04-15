// src/components/overlays/OfflineNotifier.jsx
import { memo, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Alert,
  AlertTitle,
  Collapse,
} from '@mui/material';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import { useHome } from '@context/HomeContext';
import useOnlineStatus from '@hooks/useOnlineStatus';
import config from '@utils/config';

const OfflineNotifier = () => {
  const { i18n, t } = useTranslation('errors');
  const { setIsDelayedOnline, offlineState, setOfflineState } = useHome();

  /* Determine online/offline status */
  const isOnline = useOnlineStatus(setIsDelayedOnline, config.ONLINE_DELAY);
  /** Ref to track the last online status */
  const prevOnlineRef = useRef(isOnline);

  /* Show alert when offline AND the dialog has been dismissed */
  const showAlert = !isOnline && offlineState.dismissed;

  /* Triggers on transitions (do nothing if the online status hasn't changed) */
  useEffect(() => {
    const wasOnline = prevOnlineRef.current;
    prevOnlineRef.current = isOnline;
    /* Online -> offline, show the dialog and reset the dismissed flag */
    if (!isOnline && wasOnline) {
      setOfflineState({ dialogOpen: true, dismissed: false });
    }
    /* Offline -> online, close dialog & hide alert */
    if (isOnline && !wasOnline) {
      setOfflineState({ dialogOpen: false, dismissed: false });
    }
  }, [isOnline, setOfflineState]);

  const handleDialogClose = useCallback(() => {
    setOfflineState({ dialogOpen: false, dismissed: true });
  }, [setOfflineState]);

  return (
    <>
      {/* Offline Dialog */}
      <Dialog
        open={offlineState.dialogOpen}
        keepMounted={false}
        onClose={handleDialogClose}
        // disableRestoreFocus={true}
        // closeAfterTransition={true}
        aria-hidden={!offlineState.dialogOpen} // fix "Blocked aria-hidden on an element" error
        aria-labelledby="offline-dialog-title"
        aria-describedby="offline-dialog-description"
        maxWidth="xs"
      >
        <DialogTitle
          id="offline-dialog-title"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            pt: 3,
            pb: 1,
          }}
        >
          <WifiOffIcon color="error" sx={{ ml: -1 }} />
          {t('offline_title')}
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', pb: 0, px: 2 }}>
          <DialogContentText id="offline-dialog-description">
            {t('offline_description')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleDialogClose}
            sx={{ mr: i18n.language.startsWith('zh') ? 1 : 3, mb: 0.5 }}
          >
            {t('dismiss')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Persistent offline Alert (shown after dialog is dismissed) */}
      <Collapse in={showAlert} unmountOnExit>
        <Alert
          severity="error"
          icon={<WifiOffIcon fontSize="inherit" />}
          sx={(theme) => ({
            position: 'fixed',
            top: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            minWidth: 280,
            justifyContent: 'center',
            boxShadow: theme.shadows[3],
            pl: 2,
            pr: 4,
            zIndex: theme.zIndex.modal + 1,
          })}
        >
          <AlertTitle>{t('offline_alert_title')}</AlertTitle>
          {t('offline_alert_description')}
        </Alert>
      </Collapse>
    </>
  );
};

/**
 * Sets an offline notifier.
 * - Goes offline -> Dialog opens automatically.
 * - User closes Dialog while still offline ->
 *   Dialog closes, persistent Alert appears instead.
 * - Comes back online -> Dialog (if open) closes; Alert disappears.
 * - Goes offline again -> Dialog re-opens (cycle repeats).
 */
export default memo(OfflineNotifier);
