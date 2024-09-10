// src/utils/checkNominatimAccessibility.js
import axios from 'axios';

const nominatimSearchUrl = 'https://nominatim.openstreetmap.org/search';

const checkNominatimAccessibility = async () => {
    try {
        const timeout = 2000;
        await axios.get(nominatimSearchUrl, {
            params: { q: '', format: 'json' },
            timeout,
        });
        return true;
    } catch (error) {
        return false;
    }
};

export default checkNominatimAccessibility;
