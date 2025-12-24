// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://your-render-backend.onrender.com' 
    : 'http://localhost:3000');

export { API_BASE_URL };