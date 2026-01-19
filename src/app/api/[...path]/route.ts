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

// Create HTTPS agent for self-signed certificates (alternative approach)
const httpsAgent = new https.Agent({
  rejectUnauthorized: false // Accept self-signed certificates
});

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

    // Make request to backend
    // For HTTPS with self-signed certificates:
    // 1. NODE_TLS_REJECT_UNAUTHORIZED=0 should be set in Vercel Environment Variables
    // 2. For Node.js 18+, fetch uses undici which respects NODE_TLS_REJECT_UNAUTHORIZED
    // 3. If that doesn't work, we may need to use node-fetch or https module directly
    
    // Note: Next.js fetch doesn't support custom agents, so we rely on NODE_TLS_REJECT_UNAUTHORIZED
    let response: Response;
    try {
      response = await fetch(backendUrl, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch (error) {
      // If fetch fails due to certificate issues, try with node-fetch if available
      // or provide clearer error message
      if (error instanceof Error && error.message.includes('certificate')) {
        console.error('[API Proxy] Certificate error. Make sure NODE_TLS_REJECT_UNAUTHORIZED=0 is set in Vercel environment variables.');
        throw new Error(`Certificate validation failed. Please set NODE_TLS_REJECT_UNAUTHORIZED=0 in Vercel Environment Variables for production/preview environments.`);
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
