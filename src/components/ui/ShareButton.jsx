// src/components/ui/ShareButton.jsx
import { useTranslation } from 'react-i18next';
import { Tooltip } from '@mui/material';
import ShareIcon from '@mui/icons-material/Share';
import isMobile from '@utils/isMobile';
import { isDevMode } from '@utils/devMode';
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
          title: `${t('share')} ${t('title')}`,
          text: `${t('title')}: ${t('description')}`,
          url: SHARE_URL,
        });
        setShareStatus({ success: true, error: '' });
      } catch (err) {
        if (Error.isError(err) && err.name === 'AbortError') {
          isDevMode && console.debug(err.message);
        } else {
          console.error(String(err));
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
      describeChild
      title={`${t('share')} ${t('title')}`}
      placement="bottom-end"
      disableHoverListener={isMobile}
      enterTouchDelay={800}
      leaveTouchDelay={1000}
    >
      <span>
        <CustomIconButton aria-label={SHARE_LABEL} onClick={handleShare}>
          <ShareIcon fontSize="inherit" />
        </CustomIconButton>
      </span>
    </Tooltip>
  );
};

export default ShareButton;
