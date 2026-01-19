import axios from 'axios';

// Use Next.js API proxy routes (same origin) to avoid mixed content issues
// The proxy routes will forward requests to the backend API server
// Always use relative URLs on client side to hit Next.js proxy (HTTPS)

// CRITICAL: Always start with empty baseURL to prevent mixed content errors
// The baseURL will be set dynamically in the interceptor for server-side only
const apiClient = axios.create({
  baseURL: '', // Always empty - prevents any HTTP URLs from being set
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: set baseURL only for server-side, ensure empty on client
apiClient.interceptors.request.use(
  (config) => {
    // Client-side: ALWAYS use empty baseURL (relative URLs hit Next.js proxy)
    // This prevents mixed content errors (HTTPS page requesting HTTP resources)
    if (typeof window !== 'undefined') {
      // CRITICAL: Force empty baseURL - never allow HTTP URLs on client
      // This ensures axios constructs relative URLs that hit the Next.js proxy
      config.baseURL = '';
      
      // Ensure URL is relative (starts with /) - axios will combine with empty baseURL
      if (config.url && !config.url.startsWith('http') && !config.url.startsWith('/')) {
        config.url = '/' + config.url;
      }
      
      // Safety check: if URL somehow contains HTTP, strip it to make it relative
      if (config.url && config.url.startsWith('http://')) {
        // Extract path from HTTP URL
        try {
          const urlObj = new URL(config.url);
          config.url = urlObj.pathname + urlObj.search;
        } catch {
          // If URL parsing fails, try simple string replacement
          config.url = config.url.replace(/^https?:\/\/[^/]+/, '');
        }
      }
      
      // Add auth token if available
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } else {
      // Server-side: use direct backend URL (server-to-server calls)
      // On Vercel, use HTTPS with self-signed certificate; local dev uses HTTP
      const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV;
      const defaultServerURL = isVercel 
        ? 'https://144.91.86.199:8443'  // HTTPS for Vercel (self-signed cert)
        : 'http://144.91.86.199:8080';  // HTTP for local development
      
      const serverBaseURL = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || defaultServerURL;
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
