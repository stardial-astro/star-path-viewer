// src/components/input/DiagramFetcher.jsx
import { memo, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Stack,
  Button,
  Typography,
  CircularProgress,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import queryClient from '@/queryClient';
import { useHome } from '@context/HomeContext';
import { useLocationInput } from '@context/LocationInputContext';
import { useDateInput } from '@context/DateInputContext';
import { useStarInput } from '@context/StarInputContext';
import * as actionTypes from '@context/locationInputActionTypes';
import useServerStatusCheck from '@hooks/useServerStatusCheck';
import config from '@utils/config';
import {
  STAR_INPUT_TYPES,
  WARNING_PREFIX_SERVER,
  WARNING_PREFIX,
  SERVER_ERR_PREFIX,
  INTERNAL_ERR_LIST,
} from '@utils/constants';
import { trackEvent } from '@utils/analytics';
import {
  isLocationInputCompleteSync,
  isDateInputCompleteSync,
  isInputCompleteSync,
  clearNullError,
} from '@utils/inputUtils';
import fetchDiagram from '@utils/fetchDiagram';
import { getIsDevMode } from '@utils/devMode';
import CustomDivider from '@components/ui/CustomDivider';
import CustomAlert from '@components/ui/CustomAlert';
import LocationInput from './location/LocationInput';
import DateInput from './date/DateInput';
import StarInput from './star/StarInput';

const QUERY_KEY = 'diagram';

/** dev: 5 minutes; prod: 1 hour */
const STALE_MS = getIsDevMode() ? 5 * 60_000 : 60 * 60_000;
/** 1 hour */
const GC_MS = 60 * 60_000;
const MAX_RETRIES = 1;

const INPUT_ID = 'input-fields';
const LOC_ID = 'location';
const DATE_ID = 'date';
const STAR_ID = 'star';
const DRAW_BTN_ID = 'draw-btn';

const DRAW_BTN_LABEL = 'Draw';

const circularProgress = (
  <CircularProgress color="inherit" size="1rem" sx={{ mr: 1 }} />
);

const DiagramFetcher = () => {
  // console.log('Rendering DiagramFetcher');
  const { t } = useTranslation();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const {
    isDelayedOnline,
    offlineState,
    setSuccess,
    errorMessage,
    setErrorMessage,
    setDiagramId,
    setSvgData,
    setAnno,
    setInfo,
    clearImage,
  } = useHome();
  const { location, locationInputType, locationValid, locationDispatch } =
    useLocationInput();
  const { date, flag, cal, dateValid, dateDispatch } = useDateInput();
  const {
    starName,
    starNameZh,
    starHip,
    starRadec,
    starInputType,
    starValid,
    starDispatch,
  } = useStarInput();
  const [loading, setLoading] = useState(false);

  const isDrawDisabled =
    loading ||
    !dateValid ||
    !locationValid ||
    !starValid ||
    !!errorMessage.server ||
    !!errorMessage.location ||
    !!errorMessage.date ||
    !!errorMessage.star ||
    !!errorMessage.draw;

  /* ------------------------------------------------------------------|
   * Initialize
   * ------------------------------------------------------------------|
   */
  useServerStatusCheck(isDelayedOnline, setErrorMessage);

  /* ------------------------------------------------------------------|
   * Clear errors when user starts typing
   * ------------------------------------------------------------------|
   */
  /* [LocationInput] [DateInput] [StarInput] Clear errors & null errors when user starts typing */

  /* ------------------------------------------------------------------|
   * Validate input
   * ------------------------------------------------------------------|
   */
  /* [LocationInput] [DateInput] [StarInput] Validate non-empty input */

  /* Check whether location & date input fields are complete when flag is set */
  useEffect(() => {
    if (flag) {
      isLocationInputCompleteSync(
        location,
        locationInputType,
        locationDispatch,
      );
      isDateInputCompleteSync(date, flag, dateDispatch);
    }
  }, [location, locationInputType, date, flag, locationDispatch, dateDispatch]);

  /* ------------------------------------------------------------------|
   * Draw
   * ------------------------------------------------------------------|
   */
  /**
   * Fetches diagram.
   * Only calls `fetchDiagram` if data is stale or missing.
   * - skips fetching if offline or loading
   * - Updates `diagramId`, `info`, `svgData`, and `anno` if successful
   * Uses TanStack Query:
   * - Automatic caching
   * - Prevents multiple identical requests
   * - Retries on error
   */
  const handleDraw = useCallback(async () => {
    trackEvent('button_click', { button_name: DRAW_BTN_LABEL.toLowerCase() });

    /* Skip fetching if offline or loading */
    if (offlineState.dialogOpen || offlineState.dismissed || loading) return;

    /* Clear any previous image and null errors before making the API call */
    clearNullError(locationDispatch, dateDispatch, starDispatch);
    clearImage();
    setSuccess(false);

    const isDevMode = getIsDevMode();
    isDevMode &&
      console.debug(
        '[Inputs]',
        location,
        date,
        flag,
        cal,
        starName,
        starHip,
        starRadec,
        starInputType,
      );

    /* Check whether all input fields are complete ------------------ */
    const isComplete = isInputCompleteSync(
      /* Location */
      location,
      locationInputType,
      /* Date */
      date,
      flag,
      /* Star */
      starName,
      starHip,
      starRadec,
      starInputType,
      locationDispatch,
      dateDispatch,
      starDispatch,
    );
    if (!isComplete) return;

    /* Assign parameters -------------------------------------------- */
    /** @type {ParamObj} */
    const params = {
      lat: parseFloat(location.lat).toString(),
      lng: parseFloat(location.lng).toString(),
      year: parseInt(date.year).toString(),
      month: parseInt(date.month).toString(),
      day: parseInt(date.day).toString(),
      cal: cal,
      flag: flag,
    };
    /* If tz is fetched, append it */
    if (location.tz) params.tz = location.tz;
    /* Add star name, HIP, and RA/Dec according to starInputType */
    if (starInputType === STAR_INPUT_TYPES.name) {
      params.name = starName.toLowerCase();
    } else if (starInputType === STAR_INPUT_TYPES.hip) {
      params.hip = parseInt(starHip).toString();
    } else if (starInputType === STAR_INPUT_TYPES.radec) {
      params.ra = parseFloat(starRadec.ra).toString();
      params.dec = parseFloat(starRadec.dec).toString();
    }
    isDevMode && console.debug('[Query]', params);

    /* Plot --------------------------------------------------------- */
    const controller = new AbortController();
    setLoading(true);

    try {
      /* Fetch diagram */
      const res = await queryClient.fetchQuery({
        queryKey: [QUERY_KEY, params],
        queryFn: () => fetchDiagram(params, controller.signal),
        staleTime: STALE_MS,
        gcTime: GC_MS,
        retry: (failureCount, _error) => {
          if (controller.signal.aborted) return false;
          return failureCount < MAX_RETRIES;
        },
        retryDelay: config.RETRY_DELAY,
      });

      if (!res) return;

      const newInfo = res.info;
      /* Insert/Update names into info when querying HIP */
      if (newInfo.hip) {
        newInfo.name = starName;
        newInfo.nameZh = starNameZh;
      }
      /* Update tz if determined by server */
      if (!params.tz) {
        locationDispatch({ type: actionTypes.SET_TZ, payload: newInfo.tz });
      }

      /* Update state if not aborted and no errors */
      setDiagramId(res.diagramId);
      setInfo(newInfo);
      setSvgData(res.svgData);
      setAnno(res.anno);

      /* Clear any errors & null errors */
      setErrorMessage({});
      clearNullError(locationDispatch, dateDispatch, starDispatch);
      setSuccess(true);
    } catch (err) {
      if (Error.isError(err)) {
        let msg = err.message;
        if (msg.startsWith(SERVER_ERR_PREFIX)) {
          /* Show server errors */
          setErrorMessage((prev) => ({ ...prev, server: msg }));
        } else {
          /* Trim server returned 'WARNING:' */
          if (msg.startsWith(WARNING_PREFIX_SERVER)) {
            msg = msg.substring(WARNING_PREFIX_SERVER.length).trim();
          }
          /* Parse internal server errors */
          msg =
            INTERNAL_ERR_LIST.find((item) =>
              msg.toLowerCase().includes(item.hint),
            )?.msg ?? msg;
          setErrorMessage((prev) => ({ ...prev, draw: msg }));
        }
      }
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  }, [
    location,
    locationInputType,
    date,
    flag,
    cal,
    starName,
    starNameZh,
    starHip,
    starRadec,
    starInputType,
    offlineState,
    loading,
    clearImage,
    setDiagramId,
    setInfo,
    setSvgData,
    setAnno,
    setSuccess,
    locationDispatch,
    dateDispatch,
    starDispatch,
    setErrorMessage,
  ]);

  return (
    <Stack direction="column" spacing={3}>
      <Stack id={INPUT_ID} direction="column" spacing={1.5}>
        <Stack id={LOC_ID} direction="column" spacing={1}>
          <CustomDivider>{t('location')}</CustomDivider>
          <LocationInput />
          {errorMessage.location && (
            <CustomAlert
              onClose={() =>
                setErrorMessage((prev) => ({ ...prev, location: '' }))
              }
            >
              {t(errorMessage.location)}
            </CustomAlert>
          )}
        </Stack>

        <Stack id={DATE_ID} direction="column" spacing={1}>
          <CustomDivider>{t('date')}</CustomDivider>
          <DateInput />
          {errorMessage.date && (
            <CustomAlert
              onClose={() => setErrorMessage((prev) => ({ ...prev, date: '' }))}
            >
              {t(errorMessage.date)}
            </CustomAlert>
          )}
        </Stack>

        <Stack id={STAR_ID} direction="column" spacing={1}>
          <CustomDivider>{t('star')}</CustomDivider>
          <StarInput />
          {errorMessage.star && (
            <CustomAlert
              onClose={() => setErrorMessage((prev) => ({ ...prev, star: '' }))}
            >
              {t(errorMessage.star)}
            </CustomAlert>
          )}
        </Stack>
      </Stack>

      <Stack
        id={DRAW_BTN_ID}
        data-testid={DRAW_BTN_ID}
        direction="column"
        spacing={1}
      >
        <Button
          aria-label={DRAW_BTN_LABEL}
          variant="contained"
          color="primary"
          size="large"
          disabled={isDrawDisabled}
          onClick={handleDraw}
          fullWidth
          sx={{ mt: 3 }}
          startIcon={
            <Box
              display="flex"
              alignItems="center"
              sx={{ pb: '1.5px', ml: -2.5 }}
            >
              {loading ? circularProgress : <ArrowForwardIcon />}
            </Box>
          }
        >
          {t('draw')}
        </Button>

        {errorMessage.draw && (
          <CustomAlert
            severity={
              errorMessage.draw.startsWith(WARNING_PREFIX) ? 'warning' : 'error'
            }
            onClose={() => setErrorMessage((prev) => ({ ...prev, draw: '' }))}
          >
            {t(errorMessage.draw)}
          </CustomAlert>
        )}

        {loading && (
          <Typography
            variant="body1"
            align="center"
            sx={{
              color: isDarkMode ? 'text.secondary' : 'action.active',
              pt: 1,
            }}
          >
            <em>{t('drawing')}</em>
          </Typography>
        )}
      </Stack>
    </Stack>
  );
};

export default memo(DiagramFetcher);
