import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

/**
 * API Client Configuration
 * 
 * Client-side: Uses relative URLs through Next.js API proxy (/api/[...path])
 * Server-side: Uses BACKEND_API_URL for direct backend connection
 */

const isClientSide = (): boolean => typeof window !== 'undefined';
const isDevelopment = process.env.NODE_ENV === 'development';

const sanitizeUrlForClient = (url: string | undefined): string => {
  if (!url) return '';
  let sanitized = url.replace(/^https?:\/\/[^\/]+/, '');
  if (!sanitized.startsWith('/')) {
    sanitized = '/' + sanitized;
  }
  return sanitized;
};

// Create axios instance with empty baseURL - NEVER set baseURL here
// It will be set dynamically in the interceptor based on client/server context
const apiClient: AxiosInstance = axios.create({
  baseURL: '', // Always empty at creation - prevents HTTP URLs in bundle
  headers: {
    'Content-Type': 'application/json',
  },
});

// Ensure defaults are also clean on client (in case they get modified elsewhere)
// This runs immediately when the module loads on the client to prevent HTTP URLs
if (typeof window !== 'undefined') {
  // Force baseURL to be empty on client - this is critical
  apiClient.defaults.baseURL = '';
}

// Request interceptor: Handle baseURL and auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // CRITICAL: Always check client-side first and enforce empty baseURL
    // This prevents HTTP URLs from leaking to the client during SSR/hydration
    const isClient = typeof window !== 'undefined';
    
    if (isClient) {
      // Client-side: ALWAYS use relative URLs through Next.js API proxy
      // Force baseURL to be empty - this is critical for preventing Mixed Content errors
      config.baseURL = '';
      
      // Sanitize URL to ensure it's always relative
      if (config.url) {
        config.url = sanitizeUrlForClient(config.url);
      }
      
      // Final safety check: Block ANY HTTP URLs on client side
      // Check both the baseURL and the final constructed URL
      const finalBaseURL = String(config.baseURL || '');
      const finalURL = String(config.url || '');
      const constructedURL = finalBaseURL + finalURL;
      
      // Block HTTP URLs in any form
      if (finalBaseURL.includes('http://') || finalURL.includes('http://') || constructedURL.includes('http://')) {
        // Force to relative URLs
        config.baseURL = '';
        config.url = sanitizeUrlForClient(finalURL);
        
        // Double-check after sanitization
        const sanitizedBaseURL = String(config.baseURL || '');
        const sanitizedURL = String(config.url || '');
        const sanitizedFullURL = sanitizedBaseURL + sanitizedURL;
        
        if (sanitizedFullURL.includes('http://') || sanitizedURL.includes('http://')) {
          const error = new Error('HTTP URL detected on client side. All requests must use relative URLs through /api/ proxy.');
          if (isDevelopment) {
            console.error('[apiClient] SECURITY ERROR - HTTP URL blocked:', {
              originalBaseURL: finalBaseURL,
              originalURL: finalURL,
              constructedURL,
              sanitizedBaseURL,
              sanitizedURL,
              sanitizedFullURL,
            });
          }
          throw error;
        }
      }
      
      // Add auth token
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } else {
      // Server-side: Set baseURL for direct backend connection
      // Only set this when we're 100% sure we're on the server
      const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV;
      const serverBaseURL = process.env.BACKEND_API_URL || 
        (isVercel 
          ? 'https://144.91.86.199:8443'
          : 'http://144.91.86.199:8080');
      
      config.baseURL = serverBaseURL;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (isDevelopment) {
      if (error.response) {
        console.error(`API Error (${error.config?.url || 'unknown'}): ${error.response.status} ${error.response.statusText}`);
      } else {
        const baseURL = error.config?.baseURL || '';
        const url = error.config?.url || '';
        const fullUrl = baseURL ? `${baseURL}${url}` : url;
        
        // Check for HTTP URLs in error (this shouldn't happen but helps debug)
        if (fullUrl.includes('http://') && typeof window !== 'undefined') {
          console.error('[apiClient] SECURITY WARNING: HTTP URL detected in error config:', {
            baseURL,
            url,
            fullUrl,
            message: error.message,
          });
        }
        
        console.error(`API Error (${fullUrl || 'unknown'}): ${error.message}`);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
