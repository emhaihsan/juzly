import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Optimize bundle size for deployment
  experimental: {
    optimizePackageImports: ['@solana/web3.js', '@web3auth/modal'],
  },
  
  // Configure output for serverless functions
  output: 'standalone',
  
  // Reduce bundle size
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Externalize large dependencies on server side
      config.externals = config.externals || [];
      config.externals.push({
        '@solana/web3.js': 'commonjs @solana/web3.js',
        '@metaplex-foundation/js': 'commonjs @metaplex-foundation/js',
      });
    }
    
    // Optimize bundle splitting
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          solana: {
            test: /[\\/]node_modules[\\/]@solana[\\/]/,
            name: 'solana',
            chunks: 'all',
          },
          web3auth: {
            test: /[\\/]node_modules[\\/]@web3auth[\\/]/,
            name: 'web3auth',
            chunks: 'all',
          },
        },
      },
    };
    
    return config;
  },
  
  // Disable source maps in production to reduce size
  productionBrowserSourceMaps: false,
};

export default nextConfig;
