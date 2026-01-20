/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure API routes run on Node.js runtime (not Edge)
  // This is important for compatibility with native fetch and environment variables
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
