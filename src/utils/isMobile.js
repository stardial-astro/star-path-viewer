// src/utils/isMobile.js
const isMobile = window.matchMedia(
  '(any-pointer: coarse) and (max-width: 767px)',
).matches;
export default isMobile;
