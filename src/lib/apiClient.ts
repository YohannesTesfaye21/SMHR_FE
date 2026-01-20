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

const apiClient: AxiosInstance = axios.create({
  baseURL: '',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Handle baseURL and auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const isClient = isClientSide();
    
    if (isClient) {
      // Client-side: Use relative URLs through Next.js API proxy
      config.baseURL = '';
      if (config.url) {
        config.url = sanitizeUrlForClient(config.url);
      }
      
      // Safety check: Block HTTP URLs on client side
      const finalBaseURL = config.baseURL || '';
      const finalURL = config.url || '';
      
      if (finalBaseURL.includes('http://') || finalURL.includes('http://')) {
        config.baseURL = '';
        config.url = sanitizeUrlForClient(finalURL);
        if (config.url.includes('http://')) {
          throw new Error('HTTP URL detected on client side. Use relative URLs through /api/ proxy.');
        }
      }
      
      // Add auth token
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } else {
      // Server-side: Set baseURL for direct backend connection
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
        console.error(`API Error (${fullUrl || 'unknown'}): ${error.message}`);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
