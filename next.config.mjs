/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://t-order-app-95224602622.us-central1.run.app/api/:path*',
      },
    ];
  },
};

export default nextConfig;