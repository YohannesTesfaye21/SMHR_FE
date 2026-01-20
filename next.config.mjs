/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optional: enable static export mode only when explicitly requested.
  // WARNING: `output: 'export'` disables Next.js server features (API routes, SSR),
  // so `/api/[...path]` proxy will NOT work in export mode.
  ...(process.env.NEXT_OUTPUT === 'export'
    ? {
        output: 'export',
        images: { unoptimized: true },
      }
    : {}),

  // Ensure API routes run on Node.js runtime (not Edge)
  // This is important for compatibility with native fetch and environment variables
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
