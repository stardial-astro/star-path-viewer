// src/Config.js
const Config = {
  serverUrl: process.env.REACT_APP_SERVER_URL,
  basename: '/',
  serverGetTimeout: 30000,
  serverGetDiagramTimeout: 30000,
  TypingDelay: 300,
  notice: '',
  // notice: 'The hosting service is currently upgrading. Please come back later.',
};

export default Config;
