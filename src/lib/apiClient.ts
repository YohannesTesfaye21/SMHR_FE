import axios, { AxiosInstance } from 'axios';

// Use Next.js API proxy routes (same origin) to avoid mixed content issues
// The proxy routes will forward requests to the backend API server
// Always use relative URLs on client side to hit Next.js proxy (HTTPS)

// CRITICAL: For client-side, we MUST use empty baseURL to prevent mixed content errors
// Create separate instances for client and server to avoid any SSR hydration issues
let apiClient: AxiosInstance;

if (typeof window !== 'undefined') {
  // CLIENT-SIDE: Always use empty baseURL - requests go through Next.js proxy (HTTPS)
  // IGNORE any environment variables - they could contain HTTP URLs
  // Force empty baseURL to prevent mixed content errors
  const clientBaseURL = ''; // NEVER use env vars or defaults here
  
  apiClient = axios.create({
    baseURL: clientBaseURL, // CRITICAL: Empty baseURL forces relative URLs
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  // Log for debugging (remove in production if needed)
  console.log('[apiClient] Initialized client-side with baseURL:', apiClient.defaults.baseURL);
} else {
  // SERVER-SIDE: Use direct backend URL
  const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV;
  const defaultServerURL = isVercel 
    ? 'https://144.91.86.199:8443'  // HTTPS for Vercel (self-signed cert)
    : 'http://144.91.86.199:8080';  // HTTP for local development
  
  const serverBaseURL = process.env.BACKEND_API_URL || defaultServerURL;
  
  apiClient = axios.create({
    baseURL: serverBaseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

// Request interceptor: Add auth token and ensure client-side URLs are relative
apiClient.interceptors.request.use(
  (config) => {
    // CLIENT-SIDE ONLY: Ensure URLs are always relative (no HTTP/HTTPS)
    if (typeof window !== 'undefined') {
      // CRITICAL: Force empty baseURL on every request (defense in depth)
      const originalBaseURL = config.baseURL;
      config.baseURL = '';
      
      // If baseURL was somehow set, log it for debugging
      if (originalBaseURL && originalBaseURL !== '') {
        console.error('[apiClient] WARNING: baseURL was set on client!', originalBaseURL, 'Forcing to empty');
      }
      
      // Ensure URL is relative (starts with /)
      if (config.url) {
        // Strip any protocol (http:// or https://) from URL
        if (config.url.startsWith('http://') || config.url.startsWith('https://')) {
          console.error('[apiClient] WARNING: URL contains protocol!', config.url, 'Stripping to make relative');
          try {
            const urlObj = new URL(config.url);
            config.url = urlObj.pathname + urlObj.search;
          } catch {
            config.url = config.url.replace(/^https?:\/\/[^/]+/, '');
          }
        }
        
        // Ensure URL starts with /
        if (!config.url.startsWith('/')) {
          config.url = '/' + config.url;
        }
      }
      
      // Add auth token if available
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Final validation: ensure no HTTP URLs make it through
      const finalUrl = (config.baseURL || '') + (config.url || '');
      if (finalUrl.startsWith('http://') || finalUrl.startsWith('https://')) {
        console.error('[apiClient] ERROR: HTTP/HTTPS URL detected in final URL!', {
          baseURL: config.baseURL,
          url: config.url,
          finalUrl: finalUrl
        });
        // Force relative URL
        const urlMatch = finalUrl.match(/https?:\/\/[^/]+(\/.*)$/);
        if (urlMatch) {
          config.url = urlMatch[1];
        }
        config.baseURL = '';
      }
      
      // Log the final config for debugging
      console.log('[apiClient] Request config:', {
        method: config.method,
        baseURL: config.baseURL,
        url: config.url,
        finalUrl: (config.baseURL || '') + (config.url || '')
      });
    } else {
      // SERVER-SIDE: Add auth token from headers if present (SSR)
      // Note: Server-side doesn't have localStorage, so auth must come from headers
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
