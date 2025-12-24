import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 图片配置
  images: {
    remotePatterns: [
      {
        // 允许从localhost加载图片
        protocol: 'http',
        hostname: 'localhost',
        port: '7000',
        pathname: '/**',
      },
      {
        // 实际部署的域名
        protocol: 'https',
        hostname: 'eggshell.online',
        port: '',
        pathname: '/**',
      },
      {
        // 如果使用 CDN，替换为实际的 CDN 域名
        protocol: 'https',
        hostname: 'cdn.yourdomain.com',
        port: '',
        pathname: '/**',
      }
    ],
    // 启用 Next.js 图片优化功能
    unoptimized: false
  },
  // 允许编译 @eggshell/tailwindcss-ui 包
  transpilePackages: ['@eggshell/tailwindcss-ui']
};
export default nextConfig;