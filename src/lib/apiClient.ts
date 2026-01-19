import axios from 'axios';

// Use Next.js API proxy routes (same origin) to avoid mixed content issues
// The proxy routes will forward requests to the backend API server
// Always use relative URLs on client side to hit Next.js proxy (HTTPS)
function getBaseURL() {
  // Client-side: always use empty string for relative URLs (hits Next.js proxy)
  if (typeof window !== 'undefined') {
    return '';
  }
  // Server-side: use direct backend URL
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://144.91.86.199:8080';
}

const apiClient = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token if available
apiClient.interceptors.request.use(
  (config) => {
    // Only run on client side
    if (typeof window !== 'undefined') {
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
