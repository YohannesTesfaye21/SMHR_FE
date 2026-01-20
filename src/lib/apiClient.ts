import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

/**
 * API Client Configuration
 * 
 * Client-side: Uses relative URLs through Next.js API proxy (/api/[...path])
 * Server-side: Uses BACKEND_API_URL for direct backend connection
 */

const isClientSide = (): boolean => typeof window !== 'undefined';
const isDevelopment = process.env.NODE_ENV === 'development';

// Helper to get server baseURL - this should NEVER be called on client
// Always use HTTPS - no HTTP URLs anywhere
const getServerBaseURL = (): string => {
  // This function should only run on server
  if (typeof window !== 'undefined') {
    throw new Error('getServerBaseURL should never be called on client');
  }
  
  // Use environment variable if set, otherwise use HTTPS default
  // Always HTTPS - no HTTP URLs in the codebase
  return process.env.BACKEND_API_URL || 'https://144.91.86.199:8443';
};

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
      
      // Also ensure defaults are empty (double protection)
      if (apiClient.defaults.baseURL) {
        apiClient.defaults.baseURL = '';
      }
      
      // Sanitize URL to ensure it's always relative
      if (config.url) {
        config.url = sanitizeUrlForClient(config.url);
      }
      
      // Final safety check: Block ANY HTTP URLs on client side
      // Check both the baseURL and the final constructed URL
      const finalBaseURL = String(config.baseURL || '');
      const finalURL = String(config.url || '');
      const constructedURL = finalBaseURL + finalURL;
      
      // Block HTTP URLs in any form - log in production too for debugging
      if (finalBaseURL.includes('http://') || finalURL.includes('http://') || constructedURL.includes('http://')) {
        // Log the error in production to help debug
        console.error('[apiClient] SECURITY ERROR - HTTP URL detected on client:', {
          baseURL: finalBaseURL,
          url: finalURL,
          constructedURL,
          defaultsBaseURL: apiClient.defaults.baseURL,
        });
        
        // Force to relative URLs
        config.baseURL = '';
        config.url = sanitizeUrlForClient(finalURL);
        
        // Double-check after sanitization
        const sanitizedBaseURL = String(config.baseURL || '');
        const sanitizedURL = String(config.url || '');
        const sanitizedFullURL = sanitizedBaseURL + sanitizedURL;
        
        if (sanitizedFullURL.includes('http://') || sanitizedURL.includes('http://')) {
          const error = new Error('HTTP URL detected on client side. All requests must use relative URLs through /api/ proxy.');
          console.error('[apiClient] SECURITY ERROR - HTTP URL blocked after sanitization:', {
            originalBaseURL: finalBaseURL,
            originalURL: finalURL,
            constructedURL,
            sanitizedBaseURL,
            sanitizedURL,
            sanitizedFullURL,
          });
          throw error;
        }
      }
      
      // Add auth token
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Log the final URL being used on client (for debugging)
      const finalUrl = (config.baseURL || '') + (config.url || '');
      console.log('[apiClient] Client-side request:', {
        baseURL: config.baseURL,
        url: config.url,
        finalUrl,
        method: config.method,
      });
      
      // CRITICAL: Final check - if HTTP is detected, throw immediately
      if (finalUrl.includes('http://')) {
        console.error('[apiClient] FATAL: HTTP URL in final constructed URL:', finalUrl);
        throw new Error(`FATAL: HTTP URL detected in final URL: ${finalUrl}`);
      }
    } else {
      // Server-side: Set baseURL for direct backend connection
      // Use helper function to get server URL (prevents HTTP URL in client bundle)
      const serverBaseURL = getServerBaseURL();
      config.baseURL = serverBaseURL;
      
      // Log server-side request (for debugging)
      console.log('[apiClient] Server-side request:', {
        baseURL: serverBaseURL,
        url: config.url,
        finalUrl: serverBaseURL + (config.url || ''),
        method: config.method,
      });
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
