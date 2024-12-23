// src/utils/determineService.js
import checkNominatimAccessibility from './checkNominatimAccessibility';

const determineService = async () => {
  const hash = window.location.hash;
  const forceInCn = hash.includes('#cn') || hash.includes('&cn');

  const isNominatimAccessible = forceInCn ? false : await checkNominatimAccessibility();
  const service = isNominatimAccessible ? 'nominatim' : 'baidu';

  forceInCn && console.log(`[Geocoding API] ${service}`);

  return service;
};

export default determineService;
