// src/utils/fetchNameSuggestions.js
import axios from 'axios';
import * as actionTypes from '@context/starInputActionTypes';
import { HIP_MIN, HIP_MAX, HIP_OUT_OF_RANGE, HIP_NOT_FOUND } from './constants';

// const starNameUrl = 'https://stardial-astro.github.io/star-path-data/json/hip_ident.json';
const starNameUrl = 'https://stardial-astro.github.io/star-path-data/json/hip_ident_zh.json';
const topN = 10;

const normalizePinyin = (input) => {
  return input
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/([ln])(v|yu)/g, "$1ü")  // Enable typing 'v' and 'yu' for 'ü'
    .normalize("NFC");  // Ensure Unicode normalization
};

const matchesQuery = (str, query) => {
  return str.includes(query) || str.replace(/_/g, ' ').includes(query);  // Compatible for both 'x_Xxx' and 'x Xxx'
};

const fetchAndCacheNames = async () => {
  try {
    const timeout = 5000;
    const response = await axios.get(starNameUrl, { timeout });
    const data = response.data;
    return data;
  } catch (error) {
    throw new Error('Failed to fetch the Hipparcos Catalogue.');
  }
};

const fetchNameSuggestions = async (query, cachedNames, dispatch) => {
  try {
    let data = cachedNames;
    /* Fetch and set data if cache is empty */
    if (!data) {
      data = await fetchAndCacheNames();
      dispatch({ type: actionTypes.SET_CACHED_NAMES, payload: data });  // Cache the data
    }

    /* Case-insensitive search */
    const normalizedQuery = normalizePinyin(query);  // `query` is already trimmed

    /* Filter suggestions */
    const filteredSuggestions = data
      .filter((item) => {
        /* Concatenate all fields of the item as a string */
        let concatenatedFields = Object.values(item).join(', ')
          .toLowerCase()
          .replace(/\./g, "");  // Remove '.' in 'mu._Xxx', 'nu._Xxx' and 'pi._Xxx'
        concatenatedFields += ', ' + concatenatedFields.replace(/chi_/g, 'xi_').replace(/ü/g, "u");  // For compatibility
        return matchesQuery(concatenatedFields, normalizedQuery);
      })
      .slice(0, topN);

    const hip = parseInt(query, 10);

    /* If the query is a number but not a HIP with names, set it as a HIP and prepare the entry */
    const selectedSuggestions = /^\d+$/.test(query) && !filteredSuggestions.find((item) => item.hip.toString() === query)
      ? [{
        hip: query,
        name: '',
        name_zh: '',
        name_zh_hk: '',
        pinyin: '',
        display_name: hip >= HIP_MIN && hip <= HIP_MAX ? query : HIP_OUT_OF_RANGE,
      }]
      : [];
    /* Return all suggestions */
    if (filteredSuggestions.length > 0) {
      return selectedSuggestions.concat(filteredSuggestions.map((item) => ({
        hip: item.hip.toString(),
        name: item.name.replace(/\./g, ""),  // Remove '.' in 'mu._Xxx', 'nu._Xxx' and 'pi._Xxx'
        name_zh: item.name_zh || '',
        name_zh_hk: item.name_zh_hk || '',
        pinyin: item.pinyin || '',
        display_name: item.hip.toString(),
      })));
    } else if (selectedSuggestions.length > 0) {
      return selectedSuggestions;
    } else {
      return [{
        hip: '',
        name: '',
        name_zh: '',
        name_zh_hk: '',
        pinyin: '',
        display_name: HIP_NOT_FOUND,
      }];
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

export {
  fetchAndCacheNames,
  fetchNameSuggestions,
};
