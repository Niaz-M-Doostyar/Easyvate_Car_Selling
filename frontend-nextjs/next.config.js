/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    API_URL: process.env.API_URL || 'http://localhost:5000/api',
  },
  async rewrites() {
    return [
      // Proxy image requests to backend's static folder
      {
        source: '/api/uploads/:path*',
        destination: 'http://localhost:3002/uploads/:path*', // adjust port if backend runs on a different port
      },
      {
        source: '/api/uploads/about-logos/:path*',
        destination: 'http://localhost:3002/uploads/about-logos/:path*', // adjust port if backend runs on a different port
      },
      // Proxy all other API requests to backend's API
      {
        source: '/api/:path*',
        destination: 'http://localhost:3002/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;