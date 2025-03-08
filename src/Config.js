// src/Config.js
const Config = {
  serverUrl: import.meta.env.VITE_SERVER_URL,
  basename: '/',
  serverGetTimeout: 30000,
  serverGetDiagramTimeout: 30000,
  TypingDelay: 300,
};

export default Config;
