// src/components/ui/ShareButton.jsx
import { useTranslation } from 'react-i18next';
import { Tooltip } from '@mui/material';
import ShareIcon from '@mui/icons-material/Share';
import { getIsDevMode } from '@utils/devMode';
import CustomIconButton from './CustomIconButton';

const SHARE_URL = import.meta.env.BASE_URL; // or window.location.href
const SHARE_LABEL = 'Share the website';

/**
 * @param {object} param
 * @param {ReactSetState<{ success: boolean, error: string}>} param.setShareStatus
 */
const ShareButton = ({ setShareStatus }) => {
  const { t } = useTranslation();

  const handleShare = async () => {
    /* Check if the browser supports the Web Share API */
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${t('share')} ${import.meta.env.VITE_APP_NAME}`,
          text: `${import.meta.env.VITE_APP_NAME}: ${t('description')}`,
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
        error: t('share_error'),
      });
    }
  };

  return (
    <Tooltip
      title={`${t('share')} ${import.meta.env.VITE_APP_NAME}`}
      placement="bottom-end"
    >
      <div>
        <CustomIconButton aria-label={SHARE_LABEL} onClick={handleShare}>
          <ShareIcon fontSize="inherit" />
        </CustomIconButton>
      </div>
    </Tooltip>
  );
};

export default ShareButton;
