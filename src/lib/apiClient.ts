import axios, { AxiosInstance } from 'axios';

// Simple approach: Always use HTTPS via Next.js proxy
// Client → Next.js Proxy (HTTPS) → Backend API (HTTPS with self-signed cert)

let apiClient: AxiosInstance;

if (typeof window !== 'undefined') {
  // CLIENT-SIDE: Empty baseURL = relative URLs → Next.js proxy → Backend (HTTPS)
  apiClient = axios.create({
    baseURL: '', // Relative URLs go through Next.js proxy
    headers: {
      'Content-Type': 'application/json',
    },
  });
} else {
  // SERVER-SIDE: Direct connection to backend
  // HTTPS on Vercel, HTTP for local dev only
  const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV;
  const serverBaseURL = process.env.BACKEND_API_URL || 
    (isVercel 
      ? 'https://144.91.86.199:8443'  // HTTPS on Vercel
      : 'http://144.91.86.199:8080'); // HTTP for local dev
  
  apiClient = axios.create({
    baseURL: serverBaseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

// Request interceptor: Add auth token
apiClient.interceptors.request.use(
  (config) => {
    // Client-side: Ensure baseURL stays empty (relative URLs)
    if (typeof window !== 'undefined') {
      config.baseURL = '';
      
      // Ensure URL is relative
      if (config.url && !config.url.startsWith('/')) {
        config.url = '/' + config.url;
      }
      
      // Add auth token
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
