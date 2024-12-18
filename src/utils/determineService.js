// src/utils/determineService.js
import checkNominatimAccessibility from './checkNominatimAccessibility';

const determineService = async () => {
  const isInCn = window.location.hash === '#dev&cn';

  const isNominatimAccessible = isInCn ? false : await checkNominatimAccessibility();

  isInCn && console.log("Using Baidu API...");

  return isNominatimAccessible ? 'nominatim' : 'baidu';
};

export default determineService;
