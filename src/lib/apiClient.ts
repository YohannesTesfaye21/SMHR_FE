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

// Runtime check: Ensure we never use HTTP URLs on client (prevents Mixed Content errors)
if (typeof window !== 'undefined') {
  // Override axios adapter to catch any HTTP URLs before they're sent
  const originalAdapter = apiClient.defaults.adapter || axios.defaults.adapter;
  apiClient.defaults.adapter = async (config) => {
    const fullUrl = config.baseURL 
      ? `${config.baseURL}${config.url || ''}` 
      : config.url || '';
    
    // Block any HTTP URLs on client side
    if (fullUrl.startsWith('http://')) {
      console.error('[apiClient] BLOCKED: HTTP URL detected on client side!', {
        fullUrl,
        baseURL: config.baseURL,
        url: config.url,
      });
      throw new Error('Mixed Content Error: HTTP URLs are not allowed on client side. All requests must use relative URLs through /api/ proxy.');
    }
    
    return originalAdapter!(config);
  };
}

// Request interceptor: Handle baseURL and auth token
apiClient.interceptors.request.use(
  (config) => {
    const isClient = typeof window !== 'undefined';
    
    if (isClient) {
      // CLIENT-SIDE: ALWAYS use relative URLs through Next.js API proxy
      // This prevents Mixed Content errors (HTTP from HTTPS page)
      config.baseURL = '';
      
      // CRITICAL: Strip any absolute URLs and make them relative
      if (config.url) {
        // If URL contains http:// or https://, extract only the path
        if (config.url.includes('http://') || config.url.includes('https://')) {
          try {
            const urlObj = new URL(config.url);
            config.url = urlObj.pathname + urlObj.search;
          } catch (e) {
            // If URL parsing fails, try to extract path manually
            const match = config.url.match(/https?:\/\/[^\/]+(\/.*)/);
            if (match) {
              config.url = match[1];
            } else {
              // Fallback: remove protocol and domain
              config.url = config.url.replace(/^https?:\/\/[^\/]+/, '');
            }
          }
        }
        
        // Ensure URL starts with /api/ to go through Next.js proxy
        if (!config.url.startsWith('/')) {
          config.url = '/' + config.url;
        }
        
        // If URL doesn't start with /api/, add it (unless it's already an API route)
        if (!config.url.startsWith('/api/') && !config.url.startsWith('/_next/')) {
          // Check if it's already a full path that should go through proxy
          if (config.url.startsWith('/')) {
            // It's already a relative path, keep it as is
            // The services should already be calling with /api/ prefix
          }
        }
      }
      
      // Add auth token
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Log warning if we detect HTTP URLs (should never happen on client)
      if (config.baseURL?.startsWith('http://') || config.url?.startsWith('http://')) {
        console.error('[apiClient] ERROR: HTTP URL detected on client side!', {
          baseURL: config.baseURL,
          url: config.url,
        });
        // Force to empty to prevent Mixed Content errors
        config.baseURL = '';
        if (config.url?.startsWith('http://')) {
          config.url = config.url.replace(/^http:\/\/[^\/]+/, '');
        }
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
    const isClient = typeof window !== 'undefined';
    
    // Log extended error info
    if (error.response) {
       console.error(`API Error (${error.config?.url}): ${error.response.status} ${error.response.statusText}`, error.response.data);
    } else {
       const fullUrl = error.config?.baseURL 
         ? `${error.config.baseURL}${error.config.url || ''}` 
         : error.config?.url || 'unknown';
       
       // Check for Mixed Content issues
       if (isClient && fullUrl.includes('http://')) {
         console.error(`[apiClient] Mixed Content Error: HTTP URL detected on client!`, {
           fullUrl,
           baseURL: error.config?.baseURL,
           url: error.config?.url,
           message: error.message,
         });
         console.error('[apiClient] This should never happen. All client requests must use relative URLs through /api/ proxy.');
       }
       
       console.error(`API Error (${fullUrl}): No Response`, error.message); 
    }
    return Promise.reject(error);
  }
);

export default apiClient;
