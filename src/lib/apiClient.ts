import axios from 'axios';

// Use Next.js API proxy routes (same origin) to avoid mixed content issues
// The proxy routes will forward requests to the backend API server
// Always use relative URLs on client side to hit Next.js proxy (HTTPS)
function getBaseURL() {
  // Client-side: ALWAYS use empty string for relative URLs (hits Next.js proxy)
  // This prevents mixed content errors (HTTPS page requesting HTTP resources)
  if (typeof window !== 'undefined') {
    return '';
  }
  // Server-side: use direct backend URL (server-to-server calls can use HTTP)
  return process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://144.91.86.199:8080';
}

// Create axios instance with dynamic baseURL
// Note: baseURL is set at creation time, but we ensure it's empty on client
const baseURL = getBaseURL();
const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: ensure baseURL is empty on client and add auth token
apiClient.interceptors.request.use(
  (config) => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      // Force empty baseURL on client side to prevent mixed content errors
      // This ensures all client requests go through Next.js proxy (HTTPS)
      config.baseURL = '';
      
      // Add auth token if available
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Log extended error info
    if (error.response) {
       console.error(`API Error (${error.config?.url}): ${error.response.status} ${error.response.statusText}`, error.response.data);
    } else {
       console.error(`API Error (${error.config?.url}): No Response`, error.message); 
    }
    return Promise.reject(error);
  }
);

export default apiClient;
