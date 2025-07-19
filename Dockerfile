# 🐳 Press Design System Server

FROM node:18-alpine

WORKDIR /app

# 서버 패키지 파일 복사
COPY server/package*.json ./

# 의존성 설치
RUN npm install

# 서버 소스 코드 복사
COPY server/ ./

EXPOSE 3002

# ts-node로 직접 실행
CMD ["npm", "start"] 