import axios from 'axios';

// Empty for now as requested.
// This will be used to connect to the Flask backend later.
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Example URL
});

export default api;
