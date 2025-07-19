#!/bin/bash

# 🚀 Press Design System 배포 스크립트

echo "🚀 Press Design System 배포를 시작합니다..."

# 1. 환경 변수 확인
echo "📋 환경 변수 확인 중..."
if [ -z "$NODE_ENV" ]; then
    export NODE_ENV=production
fi

# 2. 의존성 설치
echo "📦 의존성 설치 중..."
npm install
cd frontend && npm install && cd ..
cd server && npm install && cd ..

# 3. 테스트 실행
echo "🧪 테스트 실행 중..."
npm test

# 4. 빌드
echo "🔨 빌드 중..."
npm run build

# 5. 데이터베이스 마이그레이션
echo "🗄️ 데이터베이스 마이그레이션 중..."
npm run migrate

# 6. 서버 시작
echo "🚀 서버 시작 중..."
npm run start

echo "✅ 배포가 완료되었습니다!"
echo "🌐 프론트엔드: http://localhost:3000"
echo "🔧 백엔드: http://localhost:3002" 