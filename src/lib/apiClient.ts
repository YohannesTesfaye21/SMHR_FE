import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

/**
 * API Client Configuration
 * 
 * IMPORTANT: This client handles unsecured (HTTP) backend endpoints safely.
 * 
 * Flow:
 * 1. CLIENT-SIDE (Browser):
 *    - Always uses relative URLs (e.g., /api/HealthFacilities)
 *    - Requests go through Next.js API proxy route (/api/[...path])
 *    - No HTTP URLs allowed on client to prevent Mixed Content errors
 * 
 * 2. SERVER-SIDE (Next.js API Route):
 *    - Uses BACKEND_API_URL (can be HTTP - server-to-server is fine)
 *    - Proxies requests to unsecured backend
 *    - Returns response to client
 * 
 * This pattern allows unsecured backends while keeping the client secure.
 */

// Helper function to detect if we're on the client side
const isClientSide = (): boolean => {
  return typeof window !== 'undefined';
};

// Helper function to sanitize URLs - ensure they're always relative on client
const sanitizeUrlForClient = (url: string | undefined): string => {
  if (!url) return '';
  
  // Remove any protocol (http:// or https://) and domain
  let sanitized = url.replace(/^https?:\/\/[^\/]+/, '');
  
  // Ensure it starts with /
  if (!sanitized.startsWith('/')) {
    sanitized = '/' + sanitized;
  }
  
  return sanitized;
};

// CRITICAL: Always create with empty baseURL to prevent any HTTP URLs in client bundle
// The interceptor will ensure it stays empty on client, and set it on server if needed
const apiClient: AxiosInstance = axios.create({
  baseURL: '', // ALWAYS empty - prevents HTTP URLs in client bundle
  headers: {
    'Content-Type': 'application/json',
  },
});

// Override adapter on client side to prevent ANY HTTP requests
if (typeof window !== 'undefined') {
  // Store original adapter
  const originalAdapter = apiClient.defaults.adapter || axios.defaults.adapter;
  
  // Override adapter to enforce relative URLs
  apiClient.defaults.adapter = (config: any) => {
    // Final check before request: ensure NO HTTP URLs
    const baseURL = config.baseURL || '';
    const url = config.url || '';
    
    // If we detect HTTP anywhere, force to relative
    if (baseURL.includes('http://') || url.includes('http://')) {
      console.error('[apiClient] ADAPTER BLOCK: HTTP URL detected, forcing to relative', {
        baseURL,
        url,
      });
      
      // Force to relative
      config.baseURL = '';
      config.url = sanitizeUrlForClient(url || baseURL);
      
      // Verify it's relative now
      const finalURL = config.url || '';
      if (finalURL.includes('http://')) {
        throw new Error('CRITICAL: Unable to sanitize HTTP URL. Mixed Content error prevented.');
      }
    }
    
    // Use original adapter with sanitized config
    return originalAdapter!(config);
  };
}

// Request interceptor: Handle baseURL and auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const isClient = isClientSide();
    
    if (isClient) {
      // CLIENT-SIDE: ALWAYS use relative URLs through Next.js API proxy
      // This prevents Mixed Content errors (HTTP from HTTPS page)
      // Even if backend is unsecured (HTTP), client uses HTTPS → Next.js → HTTP backend
      
      // FORCE baseURL to be empty - this is critical
      config.baseURL = '';
      
      // Sanitize the URL to ensure it's always relative
      if (config.url) {
        config.url = sanitizeUrlForClient(config.url);
      }
      
      // Final safety check: Block ANY HTTP URLs on client side
      const finalBaseURL = config.baseURL || '';
      const finalURL = config.url || '';
      
      if (finalBaseURL.includes('http://') || finalURL.includes('http://')) {
        const errorMsg = 'SECURITY ERROR: HTTP URL detected on client side! All client requests must use relative URLs through /api/ proxy to prevent Mixed Content errors.';
        console.error('[apiClient] SECURITY ERROR:', {
          baseURL: finalBaseURL,
          url: finalURL,
          fullConfig: config,
        });
        
        // Force to relative URLs
        config.baseURL = '';
        config.url = sanitizeUrlForClient(finalURL);
        
        // If after sanitization we still have HTTP, this is a critical error
        if (config.url.includes('http://')) {
          throw new Error(errorMsg);
        }
      }
      
      // Add auth token from localStorage
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } else {
      // SERVER-SIDE: Set baseURL for direct backend connection
      // Server-to-server requests can use HTTP (unsecured) - this is fine
      // RECOMMENDED: Set BACKEND_API_URL in Vercel Environment Variables
      const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV;
      const serverBaseURL = process.env.BACKEND_API_URL || 
        (isVercel 
          ? 'https://144.91.86.199:8443'  // HTTPS on Vercel (default)
          : 'http://144.91.86.199:8080'); // HTTP for local dev (unsecured backend is OK)
      
      config.baseURL = serverBaseURL;
      
      // Log for debugging in server context
      if (process.env.NODE_ENV === 'development') {
        console.log('[apiClient] Server-side request:', {
          baseURL: config.baseURL,
          url: config.url,
          isVercel,
        });
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
    const isClient = isClientSide();
    
    // Log extended error info
    if (error.response) {
       // Server responded with an error status
       console.error(`API Error (${error.config?.url || 'unknown'}): ${error.response.status} ${error.response.statusText}`, error.response.data);
    } else {
       // No response from server (network error, timeout, etc.)
       const baseURL = error.config?.baseURL || '';
       const url = error.config?.url || '';
       const fullUrl = baseURL ? `${baseURL}${url}` : url;
       
       // Check for Mixed Content issues on client side
       if (isClient) {
         // Check if the error might be due to Mixed Content blocking
         const hasHttpUrl = fullUrl.includes('http://') || baseURL.includes('http://') || url.includes('http://');
         
         if (hasHttpUrl) {
           console.error(`[apiClient] ⚠️ CRITICAL: Mixed Content Error Detected!`, {
             fullUrl,
             baseURL,
             url,
             message: error.message,
             errorCode: (error as any)?.code,
           });
           console.error('[apiClient] The browser blocked an HTTP request from an HTTPS page.');
           console.error('[apiClient] All client requests MUST use relative URLs (e.g., /api/HealthFacilities) that go through the Next.js proxy.');
           console.error('[apiClient] The Next.js proxy will handle the unsecured backend connection on the server side.');
         }
         
         // Check for common network errors that might indicate mixed content blocking
         const errorMessage = error.message || '';
         if (errorMessage.includes('Mixed Content') || errorMessage.includes('blocked') || 
             errorMessage.includes('ERR_FAILED') || errorMessage.includes('Network Error')) {
           console.error(`[apiClient] Network Error (${url}): This might be a Mixed Content issue.`, {
             message: errorMessage,
             suggestion: 'Ensure all client-side requests use relative URLs starting with /api/',
           });
         }
       }
       
       console.error(`API Error (${fullUrl || 'unknown'}): No Response - ${error.message}`); 
    }
    return Promise.reject(error);
  }
);

export default apiClient;
