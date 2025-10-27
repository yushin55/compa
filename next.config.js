/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // 개발 환경에서만 CORS 우회를 위한 프록시 설정
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/:path*',
          destination: 'http://localhost:8000/:path*',
        },
      ];
    }
    return [];
  },
};

module.exports = nextConfig;
