// src/utils/determineService.js
import checkNominatimAccessibility from './checkNominatimAccessibility';

const determineService = async () => {
  const hash = window.location.hash;
  const isDevMode = hash.includes('#dev');
  const isInCn = hash.includes('#cn') || hash.includes('&cn');

  const isNominatimAccessible = isInCn ? false : await checkNominatimAccessibility();
  const service = isNominatimAccessible ? 'nominatim' : 'baidu';

  isDevMode && console.log(`[Geocoding API] ${service}`);

  return service;
};

export default determineService;
