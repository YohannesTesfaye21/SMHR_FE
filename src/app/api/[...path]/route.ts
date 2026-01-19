import { NextRequest, NextResponse } from 'next/server';
import https from 'https';
import http from 'http';

// Detect Vercel environment
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV;

// RECOMMENDED: Set BACKEND_API_URL in Vercel Environment Variables
// This allows you to configure the backend URL without code changes
// Defaults are provided as fallback, but setting it explicitly is best practice
const defaultBackendURL = isVercel 
  ? 'https://144.91.86.199:8443'  // HTTPS for Vercel (self-signed cert)
  : 'http://144.91.86.199:8080';  // HTTP for local development

// Use environment variable if set, otherwise use defaults
// Set this in Vercel: Settings → Environment Variables → BACKEND_API_URL
const BACKEND_API_URL = process.env.BACKEND_API_URL || defaultBackendURL;

// Log the backend URL being used (helpful for debugging)
if (isVercel) {
  console.log('[API Proxy] Backend URL:', BACKEND_API_URL, process.env.BACKEND_API_URL ? '(from env var)' : '(using default)');
}
const isHttp = BACKEND_API_URL.startsWith('http://');
const isHttps = BACKEND_API_URL.startsWith('https://');

// Warn if trying to use HTTP on Vercel
if (isVercel && isHttp) {
  console.warn('[API Proxy] WARNING: Using HTTP on Vercel. Vercel may block HTTP connections to external IPs. Consider using HTTPS or setting up a proxy.');
}

// For HTTPS with self-signed certificates, create an agent that accepts unsecured connections
// IMPORTANT: Set NODE_TLS_REJECT_UNAUTHORIZED=0 in Vercel Environment Variables dashboard
// Setting it at runtime may not work on Vercel, so it MUST be set in the dashboard
if (isVercel && isHttps) {
  // Try to set it at runtime (may not work on Vercel, so set it in dashboard too)
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  
  // Log warning if not set
  if (!process.env.NODE_TLS_REJECT_UNAUTHORIZED) {
    console.warn('[API Proxy] WARNING: NODE_TLS_REJECT_UNAUTHORIZED not set. HTTPS with self-signed certs may fail. Set it to "0" in Vercel Environment Variables.');
  }
}

// Create HTTPS agent for self-signed certificates
// This agent will accept self-signed certificates regardless of env var
const httpsAgent = new https.Agent({
  rejectUnauthorized: false // Accept self-signed certificates
});

// Custom fetch function that handles self-signed certificates and HTTP
async function customFetch(url: string, options: RequestInit): Promise<Response> {
  const urlObj = new URL(url);
  const protocol = urlObj.protocol;
  const isHttpsProtocol = protocol === 'https:';
  const isHttpProtocol = protocol === 'http:';
  
  // For HTTPS with self-signed certificates, use https module directly
  if (isHttpsProtocol) {
    return new Promise((resolve, reject) => {
      // Convert headers to plain object if needed
      let headers: Record<string, string> = {};
      if (options.headers) {
        if (options.headers instanceof Headers) {
          options.headers.forEach((value, key) => {
            headers[key] = value;
          });
        } else if (Array.isArray(options.headers)) {
          options.headers.forEach(([key, value]) => {
            headers[key] = value;
          });
        } else {
          headers = options.headers as Record<string, string>;
        }
      }

      const requestOptions = {
        hostname: urlObj.hostname,
        port: urlObj.port ? parseInt(urlObj.port) : 443,
        path: urlObj.pathname + urlObj.search,
        method: options.method || 'GET',
        headers,
        agent: httpsAgent, // Use agent that accepts self-signed certs
      };

      const req = https.request(requestOptions, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk.toString();
        });
        
        res.on('end', () => {
          // Convert Node.js response to fetch Response
          const responseInit: ResponseInit = {
            status: res.statusCode || 200,
            statusText: res.statusMessage || 'OK',
            headers: new Headers(res.headers as HeadersInit),
          };
          
          resolve(new Response(data, responseInit));
        });
      });

      // Set timeout for the request (30 seconds)
      req.setTimeout(30000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.on('error', (error) => {
        // Enhanced error logging for HTTPS
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('[API Proxy] HTTPS request error:', {
          url: url,
          error: errorMessage,
          code: (error as any)?.code,
          tlsRejectUnauthorized: process.env.NODE_TLS_REJECT_UNAUTHORIZED,
        });
        reject(error);
      });

      // Write body if present
      if (options.body) {
        if (typeof options.body === 'string') {
          req.write(options.body);
        } else {
          req.write(Buffer.from(options.body as ArrayBuffer));
        }
      }
      
      req.end();
    });
  }
  
  // For HTTP, use http module directly (Vercel may block this)
  if (isHttpProtocol) {
    return new Promise((resolve, reject) => {
      // Convert headers to plain object if needed
      let headers: Record<string, string> = {};
      if (options.headers) {
        if (options.headers instanceof Headers) {
          options.headers.forEach((value, key) => {
            headers[key] = value;
          });
        } else if (Array.isArray(options.headers)) {
          options.headers.forEach(([key, value]) => {
            headers[key] = value;
          });
        } else {
          headers = options.headers as Record<string, string>;
        }
      }

      const requestOptions = {
        hostname: urlObj.hostname,
        port: urlObj.port ? parseInt(urlObj.port) : 80,
        path: urlObj.pathname + urlObj.search,
        method: options.method || 'GET',
        headers,
      };

      const req = http.request(requestOptions, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk.toString();
        });
        
        res.on('end', () => {
          // Convert Node.js response to fetch Response
          const responseInit: ResponseInit = {
            status: res.statusCode || 200,
            statusText: res.statusMessage || 'OK',
            headers: new Headers(res.headers as HeadersInit),
          };
          
          resolve(new Response(data, responseInit));
        });
      });

      // Set timeout for the request (30 seconds)
      req.setTimeout(30000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.on('error', (error) => {
        // Provide helpful error message for HTTP on Vercel
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        if (errorMessage.includes('ECONNREFUSED') || errorMessage.includes('ENOTFOUND')) {
          reject(new Error(`HTTP connection failed. Vercel may block HTTP connections to external IPs. Error: ${errorMessage}. Consider using HTTPS or setting BACKEND_API_URL to an HTTPS endpoint.`));
        } else {
          reject(error);
        }
      });

      // Write body if present
      if (options.body) {
        if (typeof options.body === 'string') {
          req.write(options.body);
        } else {
          req.write(Buffer.from(options.body as ArrayBuffer));
        }
      }
      
      req.end();
    });
  }
  
  // Fallback to regular fetch for other protocols
  return fetch(url, options);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path, 'POST');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path, 'PUT');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path, 'DELETE');
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path, 'PATCH');
}

async function proxyRequest(
  request: NextRequest,
  pathSegments: string[],
  method: string
) {
  try {
    // Log that proxy was called
    console.log(`[API Proxy] ${method} request received for:`, pathSegments.join('/'));
    
    // Remove 'api' prefix if present (since route is already /api/[...path])
    const cleanPath = pathSegments[0] === 'api' 
      ? pathSegments.slice(1).join('/')
      : pathSegments.join('/');
    
    // Special debug endpoint to check configuration
    if (cleanPath === 'debug' || cleanPath === 'debug/config') {
      return NextResponse.json({
        status: 'ok',
        environment: {
          isVercel,
          nodeEnv: process.env.NODE_ENV,
          backendApiUrl: BACKEND_API_URL,
          backendApiUrlFromEnv: process.env.BACKEND_API_URL || 'not set (using default)',
          nodeTlsRejectUnauthorized: process.env.NODE_TLS_REJECT_UNAUTHORIZED || 'not set',
          isHttp,
          isHttps,
        },
        message: 'API Proxy is configured. Check backendApiUrl and nodeTlsRejectUnauthorized values.',
      });
    }
    
    // Construct the backend URL
    const searchParams = request.nextUrl.searchParams.toString();
    const backendUrl = `${BACKEND_API_URL}/api/${cleanPath}${searchParams ? `?${searchParams}` : ''}`;

    console.log(`[API Proxy] ${method} ${cleanPath} -> ${backendUrl}`, {
      isVercel,
      isHttp,
      isHttps,
      tlsRejectUnauthorized: process.env.NODE_TLS_REJECT_UNAUTHORIZED,
      backendUrl: BACKEND_API_URL,
    });

    // Get request body if present
    let body = null;
    if (method !== 'GET' && method !== 'DELETE') {
      try {
        body = await request.json();
      } catch {
        // No body or not JSON
      }
    }

    // Prepare headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Forward Authorization header if present
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    // Make request to backend using custom fetch that handles self-signed certificates
    let response: Response;
    try {
      response = await customFetch(backendUrl, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch (error) {
      // Provide detailed error information
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorCode = (error as any)?.code;
      
      console.error('[API Proxy] Request failed:', {
        url: backendUrl,
        method,
        error: errorMessage,
        code: errorCode,
        isVercel,
        tlsRejectUnauthorized: process.env.NODE_TLS_REJECT_UNAUTHORIZED,
      });
      
      // Format error message for specific error types
      let formattedError: string;
      if (errorMessage.includes('certificate') || errorMessage.includes('UNABLE_TO_VERIFY_LEAF_SIGNATURE')) {
        formattedError = `Certificate validation failed. The backend uses a self-signed certificate. Ensure NODE_TLS_REJECT_UNAUTHORIZED=0 is set in Vercel Environment Variables.`;
      } else if (errorMessage.includes('ECONNREFUSED') || errorCode === 'ECONNREFUSED') {
        if (isHttp) {
          formattedError = `HTTP connection failed. Vercel blocks HTTP connections to external IPs for security. Please use HTTPS (set BACKEND_API_URL to https://...) or configure your backend to accept HTTPS connections.`;
        } else {
          formattedError = `Connection refused. Unable to reach backend at ${BACKEND_API_URL}. Check if the backend is accessible from Vercel's network.`;
        }
      } else if (errorMessage.includes('ENOTFOUND') || errorCode === 'ENOTFOUND') {
        formattedError = `DNS lookup failed. Unable to resolve backend hostname. Check if ${BACKEND_API_URL} is correct.`;
      } else if (errorMessage.includes('timeout') || errorCode === 'ETIMEDOUT') {
        formattedError = `Request timeout. Unable to reach backend at ${backendUrl} within 30 seconds. The backend may be slow or unreachable.`;
      } else {
        formattedError = errorMessage;
      }
      
      // Return error response immediately (don't throw to outer catch)
      return NextResponse.json(
        { 
          error: 'Proxy request failed', 
          message: formattedError,
          details: {
            backendUrl: BACKEND_API_URL,
            attemptedUrl: backendUrl,
            errorCode: errorCode,
          }
        },
        { status: 502 } // Bad Gateway - indicates proxy couldn't reach backend
      );
    }

    // Get response data
    const contentType = response.headers.get('content-type') || '';
    let data: any;
    
    if (contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch (error) {
        console.error('[API Proxy] Failed to parse JSON response:', error);
        data = { error: 'Invalid JSON response from backend' };
      }
    } else {
      // For non-JSON responses, get text
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = { raw: text };
      }
    }

    // Return response with same status and data
    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('[API Proxy] Unexpected error:', {
      message: errorMessage,
      stack: errorStack,
      url: request.url,
      method,
      backendUrl: BACKEND_API_URL,
      isVercel,
      envVars: {
        BACKEND_API_URL: process.env.BACKEND_API_URL || 'not set',
        NODE_TLS_REJECT_UNAUTHORIZED: process.env.NODE_TLS_REJECT_UNAUTHORIZED || 'not set',
      },
    });
    
    // Always return a proper JSON response that axios can understand
    return NextResponse.json(
      { 
        error: 'Proxy request failed', 
        message: errorMessage,
        // Include details in production too (helps with debugging on Vercel)
        details: {
          backendUrl: BACKEND_API_URL,
          isVercel,
        }
      },
      { status: 500 }
    );
  }
}
