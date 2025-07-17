import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { AppDataSource } from './database';
import authRouter from './routes/auth';
import treeRouter from './routes/tree';
import attachmentsRouter from './routes/attachments';
import checklistRouter from './routes/checklist';
import commentsRouter from './routes/comments';
import modelsRouter from './routes/models';
import optionsRouter from './routes/options';
import { authMiddleware } from './middleware/auth';

// 환경변수 로드
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const port = process.env.PORT || 3002;

// 환경변수 확인 로그
console.log('Environment variables:');
console.log('SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY ? 'Set' : 'Not set');
console.log('FROM_EMAIL:', process.env.FROM_EMAIL);
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);

// CORS 설정
app.use(
  cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());

// 데이터베이스 연결
AppDataSource.initialize()
  .then(() => {
    console.log('데이터베이스가 연결되었습니다.');
  })
  .catch(error => {
    console.error('데이터베이스 연결 중 오류가 발생했습니다:', error);
  });

// 라우터
app.use('/api/auth', authRouter);
app.use('/api/tree', authMiddleware, treeRouter);
app.use('/api/attachments', authMiddleware, attachmentsRouter);
app.use('/api/checklist', authMiddleware, checklistRouter);
app.use('/api/comments', authMiddleware, commentsRouter);
app.use('/api/models', modelsRouter);
app.use('/api/options', authMiddleware, optionsRouter);

// 보호된 라우트 예시
app.get('/api/protected', authMiddleware, (req, res) => {
  res.json({ message: '인증된 요청입니다.' });
});

app.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});
