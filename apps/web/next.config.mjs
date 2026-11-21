/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['three'],
  webpack: (config) => {
    // Graceful handling for optional canvas/webgl modules
    return config;
  },
};

export default nextConfig;
