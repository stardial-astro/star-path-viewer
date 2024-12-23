// devMode.js
/* A singleton utility to set `isDevMode` to true for console output. */
let isDevMode = false;

export const triggerDevModeCount = 10;

export const enableDevMode = () => {
    isDevMode = true;
    console.log('****** Dev Mode Enabled ******');
};

export const getIsDevMode = () => isDevMode;
