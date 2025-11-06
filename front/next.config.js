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
  
  // 프로덕션 환경 설정
  reactStrictMode: true,
  
  // 이미지 최적화 (필요시)
  images: {
    domains: [],
    unoptimized: true, // 개발 모드에서 이미지 최적화 오류 방지
  },
};

module.exports = nextConfig;
