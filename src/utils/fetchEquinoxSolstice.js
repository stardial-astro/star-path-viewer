// utils/fetchEquinoxSolstice.js
import axios from 'axios';
import Config from '@/Config';
import { getIsDevMode } from './devMode';

export const fetchEquinoxSolstice = async (lat, lng, tz, year, flag, signal) => {
  try {
    const response = await axios.get(`${Config.serverUrl}/equinox`, {
      params: { lat, lng, tz, year, flag },
      timeout: Config.serverGetTimeout,
      signal,
    });

    getIsDevMode() && console.log(`[${flag}]`, response.data.results);

    const month = response.data.results[1];
    const day = response.data.results[2];
    const hours = response.data.results[3];
    const minutes = response.data.results[4];
    const seconds = response.data.results[5];

    return { year, month, day, hours, minutes, seconds };  // numbers

  } catch (error) {
    if (error.name === 'CanceledError') {
      throw error; // Let the caller handle the cancel error
    } else if (error.response) {
      // throw new Error(`Error ${error.response.status}: ${error.response.data?.error || error.message || 'unknown error'}`);
      throw new Error(`${error.response.data?.error || error.message || 'unknown error'}`);
    } else {
      throw new Error('Unable to connect to the server.');
    }
  }
};
