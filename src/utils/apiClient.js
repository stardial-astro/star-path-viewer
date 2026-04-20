// src/utils/apiClient.js
import axios from 'axios';
import { trackEvent } from '@utils/analytics';

/** An `axios` instance including `startTime`, `endTime`, and `duration`
 * in `metadata` and a GA4 event tracker.
 */
const apiClient = axios.create();

/* Request interceptor: record start time */
apiClient.interceptors.request.use((config) => {
  config.metadata = { startTime: performance.now() };
  return config;
});

/* Response interceptor: log results */
apiClient.interceptors.response.use(
  (response) => {
    if (response.config.metadata?.startTime) {
      const endTime = performance.now();
      response.config.metadata.endTime = endTime;
      response.config.metadata.duration = Math.round(
        endTime - response.config.metadata.startTime,
      );
    }
    trackEvent('api_request', {
      endpoint: response.config.url,
      method: response.config.method?.toUpperCase(),
      status: response.status,
      ...(response.config.metadata?.duration !== undefined && {
        duration_ms: response.config.metadata.duration,
      }),
    });
    return response;
  },
  (error) => {
    if (error.config?.metadata?.startTime) {
      const endTime = performance.now();
      error.config.metadata.endTime = endTime;
      error.config.metadata.duration = Math.round(
        endTime - error.config.metadata.startTime,
      );
    }
    trackEvent('api_error', {
      endpoint: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      status: error.response?.status,
      error_message: error.message,
      ...(error.config?.metadata?.duration !== undefined && {
        duration_ms: error.config.metadata.duration,
      }),
    });
    return Promise.reject(error);
  },
);

export default apiClient;
