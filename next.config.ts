import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.ignoreWarnings = [
        { module: /require-in-the-middle/ },
      ];
    }
    // Tell webpack not to bundle these Node-only modules
    config.externals = [...(config.externals || []), {
      'require-in-the-middle': 'commonjs require-in-the-middle',
    }];
    return config;
  },
};

export default nextConfig;
