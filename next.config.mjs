/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  // Force clean build and disable cache
  experimental: {
    turbotrace: {
      logLevel: 'error'
    }
  },
  // For Electron compatibility
  webpack: (config, { isServer }) => {
    // Disable webpack cache
    config.cache = false;
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

export default nextConfig;
