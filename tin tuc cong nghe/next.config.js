/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cho phép tải ảnh từ bất kỳ domain nào (ảnh từ RSS feeds)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
};

module.exports = nextConfig;
