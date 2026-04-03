// src/components/overlays/Notice.jsx
/* Check:
 *  isServerUpdate -> isMaintain -> has noticeMsg -> within time range
 * Display:
 *  isServerUpdate: server update msg + [time] + tail
 * -> isMaintain: maintenance msg + [time] + tail
 * -> custom msg + [time] + tail
 */
import { memo, useEffect } from 'react';
import AnnouncementOutlinedIcon from '@mui/icons-material/AnnouncementOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import { useHome } from '@context/HomeContext';
import CustomAlert from '@components/ui/CustomAlert';

const SERVER_UPDATE_MSG = 'The server is updating';
const MAINTAIN_NOTICE_MSG = 'We are currently updating our site';
const NOTICE_MSG_TAIL_1 = ' Please check back later.';
const NOTICE_MSG_TAIL_2 = " We'll be back soon!";

const isServerUpdate = import.meta.env.VITE_IS_SERVER_UPDATE === 'true';
const isMaintain = import.meta.env.VITE_IS_MAINTAIN === 'true';

let noticeMsg = (import.meta.env.VITE_NOTICE_MSG || '').trim();
if (noticeMsg) noticeMsg = noticeMsg.replace(/\.$/, '');
let noticeMsgTail = (import.meta.env.VITE_NOTICE_MSG_TAIL || '').trim();
if (noticeMsgTail) noticeMsgTail = ' ' + noticeMsgTail.replace(/\.$/, '') + '.';

let startTimeStr = (import.meta.env.VITE_NOTICE_START_TIME || '').trim();
let endTimeStr = (import.meta.env.VITE_NOTICE_END_TIME || '').trim();

/** @param {Date} time */
const isValidTime = (time) => time instanceof Date && !isNaN(time.getTime());

/**
 * @param {Date} time
 * @param {string} fallbackStr
 */
const timeToStr = (time, fallbackStr = '') => {
  return isValidTime(time)
    ? /* Automatically use the system locale */
      time.toLocaleString(undefined, {
        dateStyle: 'long',
        timeStyle: 'long',
      })
    : /* If invalid, return this string */
      fallbackStr;
};

/** Returns the message if the current time is within the range. */
const getMsg = () => {
  /** Notice start time (ISO format) */
  const startTime = new Date(startTimeStr);
  startTimeStr = timeToStr(startTime, startTimeStr);
  /** Notice end time (ISO format) */
  const endTime = new Date(endTimeStr);
  endTimeStr = timeToStr(endTime, endTimeStr);

  let timeRangeStr = '';
  if (startTimeStr) timeRangeStr = `from ${startTimeStr}`;
  if (endTimeStr) timeRangeStr = (timeRangeStr + ` until ${endTimeStr}`).trim();
  if (timeRangeStr) timeRangeStr = ' ' + timeRangeStr + '.';
  let presetMsg = '';

  if (isServerUpdate) {
    presetMsg =
      SERVER_UPDATE_MSG +
      (timeRangeStr || '.') +
      (noticeMsgTail || NOTICE_MSG_TAIL_1);
  } else if (isMaintain) {
    if (timeRangeStr) {
      presetMsg =
        MAINTAIN_NOTICE_MSG +
        timeRangeStr +
        (noticeMsgTail || NOTICE_MSG_TAIL_1);
    } else {
      presetMsg =
        MAINTAIN_NOTICE_MSG + '.' + (noticeMsgTail || NOTICE_MSG_TAIL_2);
    }
  } else if (noticeMsg) {
    presetMsg =
      noticeMsg + (timeRangeStr || '.') + (noticeMsgTail || NOTICE_MSG_TAIL_1);
  }
  /* If no message, hide */
  if (!presetMsg) return '';
  /* Always show if there is a message and no range given */
  if (!timeRangeStr) return presetMsg;
  const now = new Date();
  /* If in the range (always show if invalid) */
  if (
    (!isValidTime(startTime) || now >= startTime) &&
    (!isValidTime(endTime) || now <= endTime)
  ) {
    return presetMsg;
  }
  return '';
};

const msg = getMsg();

const Notice = () => {
  const { errorMessage, setErrorMessage } = useHome();

  useEffect(() => {
    if (msg || errorMessage.server) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [errorMessage.server]);

  return (
    <>
      {(msg || errorMessage.server) && (
        <CustomAlert
          icon={
            msg ? (
              <AnnouncementOutlinedIcon fontSize="inherit" />
            ) : (
              <ErrorOutlineOutlinedIcon fontSize="inherit" />
            )
          }
          severity="warning"
          sx={{ mt: 1, mb: 1 }}
          onClose={() =>
            errorMessage.server &&
            setErrorMessage((prev) => ({ ...prev, server: '' }))
          }
        >
          {msg || errorMessage.server}
        </CustomAlert>
      )}
    </>
  );
};

export default memo(Notice);
