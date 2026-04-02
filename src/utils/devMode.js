// src/utils/devMode.js
/** `true` if in development environment. */
let isDevMode = import.meta.env.DEV === true;

/**
 * Sets `isDevMode` to `true` for verbose console output.
 */
export const enableDevMode = () => {
  isDevMode = true;
  console.debug('****** Dev Mode Enabled ******');
};

/**
 * @returns {boolean} The value of `isDevMode`.
 */
export const getIsDevMode = () => isDevMode;
