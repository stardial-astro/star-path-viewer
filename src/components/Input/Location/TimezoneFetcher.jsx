// src/components/Input/Location/TimezoneFetcher.jsx
import React, { useEffect, useMemo } from 'react';
import Config from '@/Config';
import { useLocationInput } from '@context/LocationInputContext';
import * as actionTypes from '@context/locationInputActionTypes';
import { getIsDevMode } from '@utils/devMode';
// import debounce from 'lodash/debounce';
import debounce from 'lodash-es/debounce';

const TimezoneFetcher = ({ lat, lng, latestTzRequest }) => {
  const { locationDispatch } = useLocationInput();

  const debouncedFetchTimezone = useMemo(
    () =>
      debounce(async (lat, lng) => {
        const latFloat = parseFloat(lat);
        const lngFloat = parseFloat(lng);

        if (latFloat >= -90 && latFloat <= 90 && lngFloat >= -180 && lngFloat <= 180) {
          const requestId = ++latestTzRequest.current;  // Increment and capture the current request ID
          try {
            let [tz] = await window.GeoTZ.find(latFloat, lngFloat);
            if (tz === 'Asia/Urumqi') {
              tz = 'Asia/Shanghai';
            }
            /* Only update if this request is the latest one */
            if (requestId === latestTzRequest.current) {
              locationDispatch({ type: actionTypes.SET_TZ, payload: tz });
              getIsDevMode() && console.log("[Timezone]", tz);
            }
          } catch (error) {
            if (requestId === latestTzRequest.current) {
              locationDispatch({ type: actionTypes.SET_TZ, payload: '' });
            }
          }
        }
      },
      Config.TypingDelay / 2
    ),
    [latestTzRequest, locationDispatch]
  );

  useEffect(() => {
    debouncedFetchTimezone(lat, lng);

    /* Cleanup the debounced function on unmount */
    return () => {
      debouncedFetchTimezone.cancel();
    };
  }, [lat, lng, debouncedFetchTimezone]);

  return null;
};

export default React.memo(TimezoneFetcher);
