import { NextRequest, NextResponse } from 'next/server';
import https from 'https';

// Use HTTPS API on Vercel (with self-signed certificate), HTTP for local development
// Detect Vercel environment
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV;
const defaultBackendURL = isVercel 
  ? 'https://144.91.86.199:8443'  // HTTPS for Vercel (self-signed cert)
  : 'http://144.91.86.199:8080';  // HTTP for local development

const BACKEND_API_URL = process.env.BACKEND_API_URL || defaultBackendURL;

// For HTTPS with self-signed certificates, create an agent that accepts unsecured connections
// IMPORTANT: Set NODE_TLS_REJECT_UNAUTHORIZED=0 in Vercel Environment Variables dashboard
// This code will also try to set it at runtime, but Vercel may require it as an env var
if (isVercel && BACKEND_API_URL.startsWith('https://')) {
  // Try to set it at runtime (may not work on Vercel, so set it in dashboard too)
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

// Create HTTPS agent for self-signed certificates
const httpsAgent = new https.Agent({
  rejectUnauthorized: false // Accept self-signed certificates
});

// Custom fetch function that handles self-signed certificates
async function customFetch(url: string, options: RequestInit): Promise<Response> {
  const urlObj = new URL(url);
  const isHttps = urlObj.protocol === 'https:';
  
  // For HTTPS with self-signed certificates, use https module directly
  if (isHttps) {
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
  
  // For HTTP, use regular fetch
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
    // Remove 'api' prefix if present (since route is already /api/[...path])
    const cleanPath = pathSegments[0] === 'api' 
      ? pathSegments.slice(1).join('/')
      : pathSegments.join('/');
    
    // Construct the backend URL
    const searchParams = request.nextUrl.searchParams.toString();
    const backendUrl = `${BACKEND_API_URL}/api/${cleanPath}${searchParams ? `?${searchParams}` : ''}`;

    console.log(`[API Proxy] ${method} ${cleanPath} -> ${backendUrl}`);

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
      console.error('[API Proxy] Request failed:', {
        url: backendUrl,
        method,
        error: errorMessage,
        isVercel,
        tlsRejectUnauthorized: process.env.NODE_TLS_REJECT_UNAUTHORIZED,
      });
      
      // Check for specific error types
      if (errorMessage.includes('certificate') || errorMessage.includes('UNABLE_TO_VERIFY_LEAF_SIGNATURE')) {
        throw new Error(`Certificate validation failed. The backend uses a self-signed certificate. Ensure NODE_TLS_REJECT_UNAUTHORIZED=0 is set in Vercel Environment Variables.`);
      } else if (errorMessage.includes('ECONNREFUSED') || errorMessage.includes('timeout')) {
        throw new Error(`Connection failed. Unable to reach backend at ${backendUrl}. Check if the backend is accessible from Vercel.`);
      }
      
      throw error;
    }

    // Get response data
    const data = await response.json().catch(() => ({}));

    // Return response with same status and data
    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('[API Proxy] Error:', error);
    return NextResponse.json(
      { error: 'Proxy request failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
