// src/components/Input/Location/TimezoneFetcher.js
import React, { useEffect, useMemo } from 'react';
import Config from '../../../Config';
import { useLocationInput } from '../../../context/LocationInputContext';
import * as actionTypes from '../../../context/locationInputActionTypes';
import debounce from 'lodash/debounce';

const TimezoneFetcher = ({ lat, lng, latestTzRequest }) => {
  const { locationDispatch } = useLocationInput();
  
  const debouncedFetchTimeZone = useMemo(
    () =>
      debounce(async (lat, lng) => {
        const isDevMode = window.location.hash.includes('#dev');
        const latFloat = parseFloat(lat);
        const lngFloat = parseFloat(lng);

        if (latFloat >= -90 && latFloat <= 90 && lngFloat >= -180 && lngFloat <= 180) {
          const requestId = ++latestTzRequest.current;  // Increment and capture the current request ID
          try {
            const [tz] = await window.GeoTZ.find(latFloat, lngFloat);
            /* Only update if this request is the latest one */
            if (requestId === latestTzRequest.current) {
              locationDispatch({ type: actionTypes.SET_TZ, payload: tz });
              isDevMode && console.log("[Timezone]", tz);
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
    debouncedFetchTimeZone(lat, lng);

    /* Cleanup the debounced function on unmount */
    return () => {
      debouncedFetchTimeZone.cancel();
    };
  }, [lat, lng, debouncedFetchTimeZone]);

  return null;
};

export default React.memo(TimezoneFetcher);
