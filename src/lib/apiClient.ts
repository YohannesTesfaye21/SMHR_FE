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
    // CRITICAL: On client-side, ABSOLUTELY NEVER allow HTTP URLs
    // Always use relative URLs that go through Next.js proxy (HTTPS)
    const isClient = typeof window !== 'undefined';
    
    if (isClient) {
      // FORCE empty baseURL on client - ignore any environment variables or defaults
      // This is CRITICAL to prevent mixed content errors (HTTPS page requesting HTTP resources)
      config.baseURL = '';
      
      // Ensure the URL is relative (starts with /)
      if (config.url) {
        // If URL contains any protocol (http:// or https://), strip it completely
        if (config.url.startsWith('http://') || config.url.startsWith('https://')) {
          try {
            const urlObj = new URL(config.url);
            config.url = urlObj.pathname + urlObj.search;
          } catch {
            // If URL parsing fails, use regex to strip protocol and domain
            config.url = config.url.replace(/^https?:\/\/[^/]+/, '');
          }
        }
        
        // Ensure URL starts with / for relative path
        if (!config.url.startsWith('/')) {
          config.url = '/' + config.url;
        }
      }
      
      // Add auth token if available
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Final safety check: Force empty baseURL and validate final URL
      config.baseURL = '';
      const finalUrl = (config.baseURL || '') + (config.url || '');
      if (finalUrl.startsWith('http://')) {
        console.error('[apiClient] ERROR: Detected HTTP URL on client!', finalUrl);
        // Extract just the path to make it relative
        try {
          const urlObj = new URL(finalUrl);
          config.url = urlObj.pathname + urlObj.search;
          config.baseURL = '';
        } catch (e) {
          // Fallback: strip everything before the first /
          config.url = finalUrl.replace(/^https?:\/\/[^/]+/, '');
          config.baseURL = '';
        }
      }
    } else {
      // Server-side only: use direct backend URL (server-to-server calls)
      // On Vercel, use HTTPS with self-signed certificate; local dev uses HTTP
      const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV;
      const defaultServerURL = isVercel 
        ? 'https://144.91.86.199:8443'  // HTTPS for Vercel (self-signed cert)
        : 'http://144.91.86.199:8080';  // HTTP for local development
      
      // Only use BACKEND_API_URL for server-side, never NEXT_PUBLIC_API_BASE_URL
      // (NEXT_PUBLIC_* vars are exposed to client and could cause mixed content issues)
      const serverBaseURL = process.env.BACKEND_API_URL || defaultServerURL;
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
