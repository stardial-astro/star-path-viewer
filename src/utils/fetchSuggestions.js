// src/utils/fetchSuggestions.js
import axios from 'axios';
import fetchJsonp from 'fetch-jsonp';
import { ADDR_NOT_FOUND } from './constants';

const nominatimSearchUrl = 'https://nominatim.openstreetmap.org/search';
const baiduSearchUrl = 'https://api.map.baidu.com/place/v2/suggestion';

const fetchSuggestionsWithNominatim = async (query) => {
  const timeout = 5000;
  const response = await axios.get(nominatimSearchUrl, {
    params: {
      q: query,
      format: 'json',
      addressdetails: 1,
    },
    timeout,
  });
  if (response.data.length > 0) {
    return response.data.map((item) => ({
      lat: item.lat,
      lng: item.lon,
      display_name: item.display_name,
      id: item.osm_id?.toString() || `${item.lat},${item.lon}`,
      addresstype: item.addresstype || '',
    }));
  } else {
    return [{ display_name: ADDR_NOT_FOUND, id: '', addresstype: '' }];
  }
};

const fetchSuggestionsWithBaidu = async (query) => {
  const timeout = 5000;
  const url = `${baiduSearchUrl}?` +
    `ak=${process.env.REACT_APP_BAIDU_API_KEY}&` +
    `query=${query}&` +
    'region=全国&' +
    'output=json&' +
    'ret_coordtype=gcj02ll';
  const response = await fetchJsonp(url, {
    jsonpCallback: 'callback',
    timeout: timeout,
  });
  const data = await response.json();
  if (data.result && data.result.length > 0) {
    return data.result.map((item) => ({
      lat: item.location.lat.toString(),
      lng: item.location.lng.toString(),
      display_name: item.address || item.name,
      id: item.uid || `${item.location.lat},${item.location.lng}`,
      addresstype: item.tag || '',
    }));
  } else {
    return [{ display_name: ADDR_NOT_FOUND, id: '', addresstype: '' }];
  }
};

const fetchSuggestions = async (query, service) => {
  try {
    if (service === 'nominatim') {
      return await fetchSuggestionsWithNominatim(query);
    } else {
      return await fetchSuggestionsWithBaidu(query);
    }
  } catch (error) {
    return [{ display_name: 'Service not available. Please enter the coordinates manually. ⤴', id: '', addresstype: '' }];
  }
};

export default fetchSuggestions;
