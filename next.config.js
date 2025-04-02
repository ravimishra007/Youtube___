/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.googleapis.com'
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com'
      },
      {
        protocol: 'https',
        hostname: '*.ggpht.com'
      },
      {
        protocol: 'https',
        hostname: '*.ytimg.com'
      }
    ]
  }
};

module.exports = nextConfig; 