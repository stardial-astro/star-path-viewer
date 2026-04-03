// src/components/ui/ShareButton.jsx
import { Tooltip } from '@mui/material';
import ShareIcon from '@mui/icons-material/Share';
import { getIsDevMode } from '@utils/devMode';
import BarIconButton from './BarIconButton';

const SHARE_TITLE = `Share ${import.meta.env.VITE_APP_NAME}`;
const SHARE_TEXT = `${import.meta.env.VITE_APP_NAME}: ${__APP_DESCRIPTION__}`;
const SHARE_URL = import.meta.env.BASE_URL; // or window.location.href
const SHARE_LABEL = 'Share the website';

/**
 * @param {object} param
 * @param {ReactSetState<{ success: boolean, error: string}>} param.setShareStatus
 */
const ShareButton = ({ setShareStatus }) => {
  const handleShare = async () => {
    /* Check if the browser supports the Web Share API */
    if (navigator.share) {
      try {
        await navigator.share({
          title: SHARE_TITLE,
          text: SHARE_TEXT,
          url: SHARE_URL,
        });
        setShareStatus({ success: true, error: '' });
      } catch (err) {
        if (Error.isError(err) && err.name === 'AbortError') {
          getIsDevMode() && console.debug(err.message);
        } else {
          console.error(err);
        }
      }
    } else {
      setShareStatus({
        success: false,
        error:
          'Web Share is not supported in this browser. Please copy the URL instead.',
      });
    }
  };

  return (
    <Tooltip title={SHARE_TITLE} placement="bottom-end">
      <div>
        <BarIconButton aria-label={SHARE_LABEL} onClick={handleShare}>
          <ShareIcon fontSize="small" />
        </BarIconButton>
      </div>
    </Tooltip>
  );
};

export default ShareButton;
