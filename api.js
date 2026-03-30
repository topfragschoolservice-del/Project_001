import axios from 'axios';

// Create an axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:5001/api', // Matches your backend PORT
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Note: In Step 26, we will add interceptors here to handle 
 * automatic JWT attachment and Token Refreshing.
 */
export default api;