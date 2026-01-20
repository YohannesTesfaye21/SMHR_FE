import { NextRequest, NextResponse } from 'next/server';

// Environment detection
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV;
const isDevelopment = process.env.NODE_ENV === 'development';

// Backend URL configuration
// Set BACKEND_API_URL in Vercel Environment Variables for production
const defaultBackendURL = isVercel 
  ? 'https://144.91.86.199:8443'
  : 'http://144.91.86.199:8080';

const BACKEND_API_URL = process.env.BACKEND_API_URL || defaultBackendURL;
const isHttps = BACKEND_API_URL.startsWith('https://');

// For self-signed certificates, NODE_TLS_REJECT_UNAUTHORIZED must be set to "0" 
// in Vercel Environment Variables (cannot be set at runtime)
if (isHttps && !process.env.NODE_TLS_REJECT_UNAUTHORIZED && isDevelopment) {
  console.warn('[API Proxy] NODE_TLS_REJECT_UNAUTHORIZED not set. Set it to "0" in Vercel Environment Variables for HTTPS with self-signed certs.');
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
    // Remove 'api' prefix if present
    const cleanPath = pathSegments[0] === 'api' 
      ? pathSegments.slice(1).join('/')
      : pathSegments.join('/');
    
    // Debug endpoint for configuration check
    if (cleanPath === 'debug' || cleanPath === 'debug/config') {
      return NextResponse.json({
        status: 'ok',
        environment: {
          isVercel,
          nodeEnv: process.env.NODE_ENV,
          backendApiUrl: BACKEND_API_URL,
          backendApiUrlFromEnv: process.env.BACKEND_API_URL || 'not set (using default)',
          nodeTlsRejectUnauthorized: process.env.NODE_TLS_REJECT_UNAUTHORIZED || 'not set',
          isHttps,
        },
        message: 'API Proxy is configured. Check backendApiUrl and nodeTlsRejectUnauthorized values.',
      });
    }
    
    // Construct backend URL
    const searchParams = request.nextUrl.searchParams.toString();
    const backendUrl = `${BACKEND_API_URL}/api/${cleanPath}${searchParams ? `?${searchParams}` : ''}`;

    if (isDevelopment) {
      console.log(`[API Proxy] ${method} ${cleanPath} -> ${backendUrl}`);
    }

    // Get request body
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

    // Forward Authorization header
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    // Make request to backend with timeout
    let response: Response;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      try {
        response = await fetch(backendUrl, {
          method,
          headers,
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorCode = (error as any)?.code;
      
      if (isDevelopment) {
        console.error('[API Proxy] Request failed:', {
          url: backendUrl,
          method,
          error: errorMessage,
          code: errorCode,
        });
      }
      
      // Format error message
      let formattedError: string;
      if (errorMessage.includes('certificate') || errorMessage.includes('UNABLE_TO_VERIFY_LEAF_SIGNATURE')) {
        formattedError = 'Certificate validation failed. Ensure NODE_TLS_REJECT_UNAUTHORIZED=0 is set in Vercel Environment Variables.';
      } else if (errorMessage.includes('ECONNREFUSED') || errorCode === 'ECONNREFUSED') {
        formattedError = `Connection refused. Unable to reach backend at ${BACKEND_API_URL}. Check if the backend is accessible.`;
      } else if (errorMessage.includes('ENOTFOUND') || errorCode === 'ENOTFOUND') {
        formattedError = `DNS lookup failed. Check if ${BACKEND_API_URL} is correct.`;
      } else if (errorMessage.includes('timeout') || errorCode === 'ETIMEDOUT' || errorMessage.includes('AbortError')) {
        formattedError = 'Request timeout. The backend may be slow or unreachable.';
      } else {
        formattedError = errorMessage;
      }
      
      return NextResponse.json(
        { 
          error: 'Proxy request failed', 
          message: formattedError,
          ...(isDevelopment && {
            details: {
              backendUrl: BACKEND_API_URL,
              attemptedUrl: backendUrl,
              errorCode: errorCode,
            }
          })
        },
        { status: 502 }
      );
    }

    // Parse response
    const contentType = response.headers.get('content-type') || '';
    let data: any;
    
    if (contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch (error) {
        if (isDevelopment) {
          console.error('[API Proxy] Failed to parse JSON response:', error);
        }
        data = { error: 'Invalid JSON response from backend' };
      }
    } else {
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = { raw: text };
      }
    }

    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (isDevelopment) {
      console.error('[API Proxy] Unexpected error:', {
        message: errorMessage,
        url: request.url,
        method,
        backendUrl: BACKEND_API_URL,
      });
    }
    
    return NextResponse.json(
      { 
        error: 'Proxy request failed', 
        message: errorMessage,
        ...(isDevelopment && {
          details: {
            backendUrl: BACKEND_API_URL,
            isVercel,
          }
        })
      },
      { status: 500 }
    );
  }
}
