import { Router, Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../database';
import { ModelOption } from '../entities/ModelOption';
import { authMiddleware } from '../middleware/auth';

// Request 인터페이스 확장
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

const router = Router();

// 관리자 권한 체크 미들웨어
const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: '관리자 권한이 필요합니다.' });
  }
  return next();
};

// 옵션 순서 변경 (관리자만) - 가장 먼저 정의하여 라우트 충돌 방지
router.put('/reorder', authMiddleware, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { optionIds } = req.body;
    
    if (!Array.isArray(optionIds)) {
      return res.status(400).json({ error: '옵션 ID 배열이 필요합니다.' });
    }
    
    const modelOptionRepo = AppDataSource.getRepository(ModelOption);
    
    // 트랜잭션으로 순서 업데이트
    await modelOptionRepo.manager.transaction(async (manager: any) => {
      for (let i = 0; i < optionIds.length; i++) {
        await manager.update(ModelOption, optionIds[i], { order: i });
      }
    });
    
    return res.json({ message: '옵션 순서가 변경되었습니다.' });
  } catch (error) {
    console.error('옵션 순서 변경 오류:', error);
    return res.status(500).json({ error: '옵션 순서 변경에 실패했습니다.' });
  }
});

// 기종별 옵션 조회
router.get('/', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { modelId, modelid, section } = req.query;
    const modelOptionRepo = AppDataSource.getRepository(ModelOption);
    
    console.log('=== 옵션 조회 요청 ===');
    console.log('Query params:', { modelId, modelid, section });
    
    let query = modelOptionRepo.createQueryBuilder('option');
    
    // modelId 또는 modelid 중 하나를 사용
    const actualModelId = modelId || modelid;
    console.log('Actual modelId:', actualModelId);
    
    if (actualModelId) {
      // 숫자인 경우 숫자로 처리, 문자열인 경우 문자열로 처리
      const numericModelId = parseInt(actualModelId as string, 10);
      if (!isNaN(numericModelId)) {
        console.log('Using numeric modelId:', numericModelId);
        query = query.where('option.modelId = :modelId', { modelId: numericModelId });
      } else {
        // 문자열인 경우 (기종 코드)
        console.log('Using string modelId:', actualModelId);
        query = query.where('option.modelId = :modelId', { modelId: actualModelId });
      }
    }
    
    if (section) {
      console.log('Adding section filter:', section);
      query = query.andWhere('option.section = :section', { section });
    }
    
    query = query.orderBy('option.order', 'ASC');
    
    console.log('Generated SQL:', query.getSql());
    console.log('Query parameters:', query.getParameters());
    
    const options = await query.getMany();
    console.log('Found options:', options.length);
    options.forEach((opt, index) => {
      console.log(`Option ${index}:`, { id: opt.id, modelId: opt.modelId, section: opt.section, optionCode: opt.optionCode });
    });
    
    return res.json(options);
  } catch (error) {
    console.error('옵션 조회 오류:', error);
    return res.status(500).json({ error: '옵션을 불러오는데 실패했습니다.' });
  }
});

// 옵션 생성 (관리자만)
router.post('/', authMiddleware, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { modelId, section, optionCode, optionName, order, isActive = true } = req.body;
    
    if (!modelId || !section || !optionCode || !optionName) {
      return res.status(400).json({ error: '필수 필드가 누락되었습니다.' });
    }
    
    const modelOptionRepo = AppDataSource.getRepository(ModelOption);
    
    // 중복 체크
    const existingOption = await modelOptionRepo.findOne({
      where: { modelId, section, optionCode }
    });
    
    if (existingOption) {
      return res.status(400).json({ error: '이미 존재하는 옵션입니다.' });
    }
    
    const newOption = modelOptionRepo.create({
      modelId: typeof modelId === 'string' && !isNaN(parseInt(modelId, 10)) 
        ? parseInt(modelId, 10) 
        : modelId,
      section,
      optionCode,
      optionName,
      order: order || 0,
      isActive
    });
    
    const savedOption = await modelOptionRepo.save(newOption);
    return res.status(201).json(savedOption);
  } catch (error) {
    console.error('옵션 생성 오류:', error);
    return res.status(500).json({ error: '옵션 생성에 실패했습니다.' });
  }
});

// 옵션 수정 (관리자만)
router.put('/:id', authMiddleware, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { optionCode, optionName, order, isActive } = req.body;
    
    const modelOptionRepo = AppDataSource.getRepository(ModelOption);
    const option = await modelOptionRepo.findOne({ where: { id } });
    
    if (!option) {
      return res.status(404).json({ error: '옵션을 찾을 수 없습니다.' });
    }
    
    // 중복 체크 (같은 모델, 섹션에서 같은 코드가 있는지)
    if (optionCode && optionCode !== option.optionCode) {
      const existingOption = await modelOptionRepo.findOne({
        where: { modelId: option.modelId, section: option.section, optionCode }
      });
      
      if (existingOption) {
        return res.status(400).json({ error: '이미 존재하는 옵션 코드입니다.' });
      }
    }
    
    // 업데이트
    Object.assign(option, {
      ...(optionCode && { optionCode }),
      ...(optionName && { optionName }),
      ...(order !== undefined && { order }),
      ...(isActive !== undefined && { isActive })
    });
    
    const updatedOption = await modelOptionRepo.save(option);
    return res.json(updatedOption);
  } catch (error) {
    console.error('옵션 수정 오류:', error);
    return res.status(500).json({ error: '옵션 수정에 실패했습니다.' });
  }
});

// 옵션 삭제 (관리자만)
router.delete('/:id', authMiddleware, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const modelOptionRepo = AppDataSource.getRepository(ModelOption);
    
    const option = await modelOptionRepo.findOne({ where: { id } });
    if (!option) {
      return res.status(404).json({ error: '옵션을 찾을 수 없습니다.' });
    }
    
    await modelOptionRepo.remove(option);
    return res.status(204).send();
  } catch (error) {
    console.error('옵션 삭제 오류:', error);
    return res.status(500).json({ error: '옵션 삭제에 실패했습니다.' });
  }
});

export default router; 