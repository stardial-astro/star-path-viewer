// src/components/overlays/Notice.jsx
/* Check:
 *  isServerUpdate -> isMaintain -> has noticeMsg -> within time range
 * Display:
 *  isServerUpdate: server update msg + [time] + tail
 * -> isMaintain: maintenance msg + [time] + tail
 * -> custom msg + [time] + tail
 */
import { memo, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from '@mui/material';
import AnnouncementOutlinedIcon from '@mui/icons-material/AnnouncementOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import { useHome } from '@context/HomeContext';
import {
  CC_HANT_CODES,
  SERVER_ERR_MSG,
  SERVER_TIMEOUT_MSG,
} from '@utils/constants';

const isServerUpdate = import.meta.env.VITE_IS_SERVER_UPDATE === 'true';
const isMaintain = import.meta.env.VITE_IS_MAINTAIN === 'true';

const presetMsg = (import.meta.env.VITE_NOTICE_MSG || '').trim();
const presetMsgTail = (import.meta.env.VITE_NOTICE_MSG_TAIL || '').trim();

/** @param {string} s */
const trimPeriod = (s) => s.replace(/[.。,，!！;；]$/, '').trim();

/** @param {Date} time */
const isValidTime = (time) => time instanceof Date && !isNaN(time.getTime());

/**
 * @param {Date} time
 * @param {string} [fallbackStr='']
 * @param {LangCode | string} [langCode='en'] - The i18n language code. Defaults to `'en'`.
 */
const timeToStr = (time, fallbackStr = '', langCode = 'en') => {
  const locale = CC_HANT_CODES.includes(langCode) ? 'zh-Hant' : langCode;
  return isValidTime(time)
    ? time.toLocaleString(locale, {
        dateStyle: 'long',
        timeStyle: 'long',
      })
    : /* If time is invalid, return this string */
      fallbackStr;
};

const Notice = () => {
  const { i18n, t } = useTranslation('notice');
  const { errorMessage, setErrorMessage } = useHome();

  /* Returns the message if the current time is within the range */
  const msg = useMemo(() => {
    const serverUpdateMsg = t('server_update');
    const maintainMsg = t('maintain');

    const customMsg = trimPeriod(presetMsg);
    const customMsgTail =
      presetMsgTail && presetMsgTail !== 'false'
        ? t('delim') + presetMsgTail
        : '';
    const msgTail1 =
      t('full_stop') +
      (presetMsgTail === 'false'
        ? ''
        : t('delim') + (customMsgTail || t('please_check_back')));
    const msgTail2 =
      t('full_stop') +
      (presetMsgTail === 'false'
        ? ''
        : t('delim') + (customMsgTail || t('we_will_be_back')));

    /** Notice start time (ISO format) */
    let startTimeStr = (import.meta.env.VITE_NOTICE_START_TIME || '').trim();
    /** Notice end time (ISO format) */
    let endTimeStr = (import.meta.env.VITE_NOTICE_END_TIME || '').trim();
    const startTime = new Date(startTimeStr);
    startTimeStr = timeToStr(startTime, startTimeStr, i18n.language);
    const endTime = new Date(endTimeStr);
    endTimeStr = timeToStr(endTime, endTimeStr, i18n.language);

    let timeRangeStr = '';
    if (startTimeStr && endTimeStr) {
      timeRangeStr = t('from_until', {
        start: startTimeStr,
        end: endTimeStr,
      });
    } else if (startTimeStr) {
      timeRangeStr = t('from', { start: startTimeStr });
    } else if (endTimeStr) {
      timeRangeStr = t('until', { end: endTimeStr });
    }

    let msg = '';
    if (isServerUpdate) {
      msg = serverUpdateMsg + timeRangeStr + msgTail1;
    } else if (isMaintain) {
      msg = maintainMsg + timeRangeStr + (timeRangeStr ? msgTail1 : msgTail2);
    } else if (customMsg) {
      msg = customMsg + timeRangeStr + msgTail1;
    }
    /* If no message, hide */
    if (!msg) return '';
    /* Always show if there is a message but no range given */
    if (!timeRangeStr) return msg;
    const now = new Date();
    /* If in the range, always show even if the time is invalid */
    if (
      (!isValidTime(startTime) || now >= startTime) &&
      (!isValidTime(endTime) || now <= endTime)
    ) {
      return msg;
    }
    return '';
  }, [t, i18n.language]);

  const serverError = useMemo(() => {
    if (!errorMessage.server) return '';
    if (
      errorMessage.server === SERVER_ERR_MSG ||
      errorMessage.server === SERVER_TIMEOUT_MSG
    ) {
      return t(errorMessage.server);
    } else {
      return (
        t(errorMessage.server) +
        t('errors:delim') +
        t('errors:check_back')
      );
    }
  }, [errorMessage.server, t]);

  useEffect(() => {
    if (msg || errorMessage.server) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [errorMessage.server, msg]);

  return (
    <>
      {(msg || errorMessage.server) && (
        <Alert
          severity="info"
          icon={
            msg ? (
              <AnnouncementOutlinedIcon fontSize="inherit" />
            ) : (
              <ErrorOutlineOutlinedIcon fontSize="inherit" />
            )
          }
          sx={(theme) => ({
            position: 'fixed',
            top: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            minWidth: 360,
            textAlign: 'left',
            boxShadow: theme.shadows[2],
            zIndex: theme.zIndex.modal,
          })}
          onClose={() =>
            errorMessage.server &&
            setErrorMessage((prev) => ({ ...prev, server: '' }))
          }
        >
          {msg || serverError}
        </Alert>
      )}
    </>
  );
};

export default memo(Notice);
