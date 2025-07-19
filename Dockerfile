# 🐳 Press Design System Docker 설정

# Node.js 베이스 이미지
FROM node:18-alpine

# 작업 디렉토리 설정
WORKDIR /app

# 패키지 파일 복사
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY server/package*.json ./server/

# 의존성 설치
RUN npm install
RUN cd frontend && npm install
RUN cd server && npm install

# 소스 코드 복사
COPY . .

# 빌드
RUN npm run build

# 포트 설정
EXPOSE 3000 3002

# 시작 명령
CMD ["npm", "run", "start"] 