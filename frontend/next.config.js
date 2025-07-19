/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  reactStrictMode: true,
  async rewrites() {
    return [
      // 인증 관련 API는 Next.js가 직접 처리
      {
        source: '/api/auth/:path*',
        destination: '/api/auth/:path*',
      },
      // 나머지 API는 백엔드로 프록시
      {
        source: '/api/:path*',
        destination: 'https://press-design-system-production.up.railway.app/api/:path*',
      },
    ]
  }
}

module.exports = nextConfig 