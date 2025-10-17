// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';


// Create axios instance with common configuration
import axios from 'axios';
//import { setupCache } from 'axios-cache-adapter';

// Create cache adapter
/*const cache = setupCache({
  maxAge: 15 * 60 * 1000, // Cache for 15 minutes
  exclude: { query: false },
}); */

// Create axios instance with retry logic
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add  error handling with specific error types
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Network errors
    if (!error.response) {
      console.error('Network Error: Unable to reach the server');
      // You could dispatch to a global error state here
    }
    
    // Authentication errors
    else if (error.response.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    
    // Server errors
    else if (error.response.status >= 500) {
      console.error('Server Error:', error.response.data);
      // You could show a server error notification
    }
    
    return Promise.reject(error);
  }
);

// Add retry logic for failed requests
apiClient.interceptors.response.use(undefined, async (err) => {
  const { config, message } = err;
  
  // Only retry on network errors or 5xx errors, not on 4xx client errors
  if (!config || !config.retry || message.includes('timeout') || 
      (err.response && err.response.status < 500)) {
    return Promise.reject(err);
  }
  
  // Set default retry count if not set
  config.retry = config.retry || 3;
  config.retryCount = config.retryCount || 0;
  
  // Check if we've maxed out the retries
  if (config.retryCount >= config.retry) {
    return Promise.reject(err);
  }
  
  // Increase the retry count
  config.retryCount += 1;
  
  // Create new promise to handle retry
  const backoff = new Promise((resolve) => {
    setTimeout(() => resolve(), config.retryDelay || 1000);
  });
  
  // Return the promise with retry
  await backoff;
  return apiClient(config);
});