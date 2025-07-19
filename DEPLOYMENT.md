# 🚀 배포 가이드

## 📋 배포 전 체크리스트

### ✅ 필수 환경 변수 설정

#### 프론트엔드 (.env.production)
```bash
# Next.js 환경 변수
NEXT_PUBLIC_API_BASE=https://your-backend-domain.com
NEXTAUTH_SECRET=your-super-secret-nextauth-key
NEXTAUTH_URL=https://your-frontend-domain.com

# API 설정
NEXT_PUBLIC_SENDGRID_API_KEY=your-sendgrid-api-key
```

#### 백엔드 (.env.production)
```bash
# 서버 설정
NODE_ENV=production
PORT=3002

# 데이터베이스 (SQLite → PostgreSQL 권장)
DATABASE_URL=postgresql://user:password@host:port/database
# 또는 SQLite 유지
DATABASE_URL=./database.sqlite

# JWT 설정
JWT_SECRET=your-super-secret-jwt-key

# 이메일 설정 (SendGrid)
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=noreply@your-domain.com
FRONTEND_URL=https://your-frontend-domain.com

# CORS 설정
CORS_ORIGIN=https://your-frontend-domain.com
```

## 🛠️ 배포 단계

### 1. 빌드
```bash
# 전체 프로젝트 빌드
npm run build

# 또는 개별 빌드
npm run build:server
npm run build:frontend
```

### 2. 데이터베이스 마이그레이션
```bash
# 마이그레이션 실행
npm run migrate

# 초기 데이터 시드 (필요시)
npm run seed
```

### 3. 서버 시작
```bash
# 백엔드 서버 시작
npm run start

# 프론트엔드 서버 시작 (별도 터미널)
npm run start:frontend
```

## 🌐 배포 플랫폼별 가이드

### Vercel (프론트엔드)
1. Vercel 계정 생성
2. GitHub 저장소 연결
3. 환경 변수 설정
4. 자동 배포 설정

### Railway (백엔드)
1. Railway 계정 생성
2. GitHub 저장소 연결
3. 환경 변수 설정
4. PostgreSQL 데이터베이스 연결

### AWS EC2 (전체)
1. EC2 인스턴스 생성
2. Node.js 설치
3. PM2 설치 및 설정
4. Nginx 설정
5. SSL 인증서 설정

## 🔒 보안 체크리스트

- [ ] HTTPS 설정 완료
- [ ] 환경 변수 보안 설정
- [ ] 데이터베이스 백업 설정
- [ ] 로그 모니터링 설정
- [ ] 에러 추적 시스템 연동

## 📊 모니터링 설정

### 로그 모니터링
```bash
# PM2 로그 확인
pm2 logs

# Nginx 로그 확인
tail -f /var/log/nginx/access.log
```

### 성능 모니터링
- CPU 사용률
- 메모리 사용률
- 디스크 사용률
- 네트워크 트래픽

## 🚨 문제 해결

### 일반적인 문제들
1. **포트 충돌**: 다른 포트 사용
2. **CORS 에러**: CORS_ORIGIN 설정 확인
3. **데이터베이스 연결 실패**: DATABASE_URL 확인
4. **JWT 토큰 오류**: JWT_SECRET 확인

### 로그 확인
```bash
# 백엔드 로그
pm2 logs press-design-system-server

# 프론트엔드 로그
pm2 logs press-design-system-frontend
```

## 📞 지원

배포 중 문제가 발생하면:
1. 로그 확인
2. 환경 변수 재확인
3. 데이터베이스 연결 테스트
4. 네트워크 연결 확인

---

**마지막 업데이트**: 2024년 12월
**버전**: 1.0.0 