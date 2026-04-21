// src/utils/analytics.js

/**
 * Measures the execution time of an async function and sends it to GA4.
 *
 * @template T
 * @param {string} eventName - GA4 event name for the tracked operation.
 * @param {() => Promise<T>} fn - The async function to measure.
 * @param {object} [params={}] - Additional event parameters to include.
 * @returns {Promise<T>} Resolves or rejects with the same value as `fn`.
 *
 * @example
 * const data = await trackTiming('run_task', () => runTask(taskParams), {
 *   task_name: taskName,
 * });
 */
export const trackTiming = async (eventName, fn, params = {}) => {
  const start = performance.now();
  try {
    const result = await fn();
    trackEvent(eventName, {
      ...params,
      duration_ms: Math.round(performance.now() - start),
      success: true,
    });
    return result;
  } catch (err) {
    trackEvent(eventName, {
      ...params,
      duration_ms: Math.round(performance.now() - start),
      success: false,
      error_message: Error.isError(err) ? err.message : String(err),
    });
    throw err;
  }
};

/**
 * Sends a custom event to GA4.
 * - Has no effect if `window.gtag` is not initialized (e.g. in dev mode or when
 *   `VITE_GA_ID` is not provided).
 * @param {string} eventName - The name of the event. Use snake_case to follow
 *   GA4 naming conventions (e.g. `'button_click'`, `'app_error'`).
 * @param {object} [params={}] - Optional event parameters.
 * @param {string} [params.endpoint] - HTTP request URL.
 * @param {string} [params.method] - HTTP method.
 * @param {number} [params.status] - HTTP request status code.
 * @param {string} [params.button_name] - Name of the button that was clicked.
 * @param {number | undefined} [params.duration_ms] - Elapse time in milliseconds. `undefined` if unknown.
 * @param {boolean} [params.success] - `true` if complete successfully.
 * @param {string} [params.error_type] - Error type for error events.
 * @param {string} [params.error_message] - Error message for error events.
 * @param {string} [params.error_source] - Source file where the error occurred.
 * @param {string} [params.component_stack] - React component stack trace for error events.
 * @example
 * // Track a button click
 * trackEvent('button_click', { button_name: 'subscribe' });
 * @example
 * // Track an error
 * trackEvent('app_error', { error_message: error.message });
 */
export const trackEvent = (eventName, params = {}) => {
  window.gtag?.('event', eventName, params);
};
