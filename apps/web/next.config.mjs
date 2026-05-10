/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@photo-app/shared'],
  serverExternalPackages: [],
  webpack(config) {
    // Prevent bundling of node: scheme modules that come from @photo-app/shared/openapi
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
    };
    return config;
  },
};

export default nextConfig;
