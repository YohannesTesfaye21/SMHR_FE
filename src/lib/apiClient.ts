import axios, { AxiosInstance } from 'axios';

// Simple approach: Always use HTTPS via Next.js proxy
// Client → Next.js Proxy (HTTPS) → Backend API (HTTPS with self-signed cert)

// CRITICAL: Always create with empty baseURL to prevent any HTTP URLs on client
// The interceptor will ensure it stays empty on client, and set it on server if needed
const apiClient: AxiosInstance = axios.create({
  baseURL: '', // ALWAYS empty - prevents HTTP URLs in client bundle
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Handle baseURL and auth token
apiClient.interceptors.request.use(
  (config) => {
    const isClient = typeof window !== 'undefined';
    
    if (isClient) {
      // CLIENT-SIDE: Force empty baseURL - requests go through Next.js proxy (HTTPS)
      config.baseURL = '';
      
      // Ensure URL is relative (starts with /)
      if (config.url) {
        // Strip any protocol if somehow present
        if (config.url.startsWith('http://') || config.url.startsWith('https://')) {
          const urlObj = new URL(config.url);
          config.url = urlObj.pathname + urlObj.search;
        }
        
        // Ensure it starts with /
        if (!config.url.startsWith('/')) {
          config.url = '/' + config.url;
        }
      }
      
      // Add auth token
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } else {
      // SERVER-SIDE: Set baseURL for direct backend connection
      // RECOMMENDED: Set BACKEND_API_URL in Vercel Environment Variables
      // This allows configuration without code changes
      const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV;
      const serverBaseURL = process.env.BACKEND_API_URL || 
        (isVercel 
          ? 'https://144.91.86.199:8443'  // HTTPS on Vercel (default)
          : 'http://144.91.86.199:8080'); // HTTP for local dev (default)
      
      config.baseURL = serverBaseURL;
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
