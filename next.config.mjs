/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['firebase-admin', 'jwks-rsa', 'jose'],
  turbopack: {
    resolveAlias: {
      // Force jose to its Node.js CJS build instead of the webapi/browser build
      'jose/dist/webapi/index.js': 'jose/dist/node/cjs/index.js',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;

