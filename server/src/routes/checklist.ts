import express from 'express';
import { AppDataSource } from '../database';
import { ChecklistItem } from '../entities/ChecklistItem';
import { History } from '../entities/History';
import { authMiddleware, modelAccessMiddleware, roleMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();
const repo = AppDataSource.getRepository(ChecklistItem);

// 모든 체크리스트 라우트에 인증 적용
router.use(authMiddleware);
router.use(modelAccessMiddleware);

// GET /api/checklist/:partId - fetch checklist items grouped by optionType
router.get('/:partId', async (req: AuthRequest, res) => {
  const partId = parseInt(req.params.partId, 10);
  const { modelId } = req.query; // 기종별 필터링을 위한 파라미터
  
  if (isNaN(partId)) {
    return res.status(400).json({ error: 'Invalid partId' });
  }

  // 기종별 필터링 조건 추가
  const whereCondition: any = { partId };
  if (modelId) {
    whereCondition.modelId = String(modelId);
  }

  const items = await repo.find({ where: whereCondition });
  const attachmentRepo = AppDataSource.getRepository(
    require('../entities/Attachment').Attachment
  );
  
  // Initialize groups
  const result: Record<string, any[]> = {
    DTL: [],
    DTE: [],
    DL: [],
    DE: [],
    '2P': [],
    '4P': [],
  };
  
  for (const item of items) {
    const attachments = await attachmentRepo.find({
      where: { checklistItemId: item.id },
    });
    const mappedAttachments = attachments.map(att => ({
      id: att.id,
      uri: `data:${att.mimeType};base64,${att.data.toString('base64')}`,
      filename: att.filename,
      mimeType: att.mimeType,
    }));
    const key = item.optionType;
    result[key].push({
      id: `${item.id}`,
      text: item.description,
      section: item.section,
      attachments: mappedAttachments,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      author: item.author,
      dueDate: item.dueDate,
      category: item.category,
      priority: item.priority,
      modelId: item.modelId, // 기종 정보 추가
    });
  }
  return res.json(result);
});

// POST /api/checklist/:partId - create a new checklist item
router.post('/:partId', roleMiddleware(['admin', 'user']), async (req: AuthRequest, res) => {
  const partId = parseInt(req.params.partId, 10);
  if (isNaN(partId)) {
    return res.status(400).json({ message: 'Invalid partId' });
  }

  const {
    optionType,
    description,
    section,
    author,
    dueDate,
    category,
    priority,
    modelId, // 기종 ID 추가
  } = req.body;
  
  if (!optionType || !description || !section) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // 기종 ID 검증 (선택사항이지만 제공된 경우 유효성 검사)
  if (modelId) {
    const modelRepo = AppDataSource.getRepository(require('../entities/Model').Model);
    const model = await modelRepo.findOneBy({ id: parseInt(modelId), isActive: true });
    if (!model) {
      return res.status(400).json({ message: 'Invalid modelId' });
    }
  }

  const item = repo.create({
    partId,
    optionType,
    description,
    section,
    author,
    dueDate,
    category,
    priority,
    modelId: modelId || req.user?.model || 'PRESS', // 기종 ID 저장
  });

  await repo.save(item);
  return res.json({
    id: `${item.id}`,
    text: item.description,
    section: item.section,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    author: item.author,
    dueDate: item.dueDate,
    category: item.category,
    priority: item.priority,
    modelId: item.modelId, // 기종 정보 반환
  });
});

// PUT /api/checklist/:itemId - update a checklist item
router.put('/:itemId', roleMiddleware(['admin', 'user']), async (req: AuthRequest, res) => {
  const itemId = parseInt(req.params.itemId, 10);
  if (isNaN(itemId)) {
    return res.status(400).json({ message: 'Invalid itemId' });
  }

  const item = await repo.findOneBy({ id: itemId });
  if (!item) {
    return res.status(404).json({ message: 'Checklist item not found' });
  }

  const { description, author, dueDate, category, priority, modelId } = req.body;
  const before = {
    description: item.description,
    author: item.author,
    dueDate: item.dueDate,
    category: item.category,
    priority: item.priority,
    modelId: item.modelId,
  };
  
  if (description !== undefined) item.description = description;
  if (author !== undefined) item.author = author;
  if (dueDate !== undefined) item.dueDate = dueDate;
  if (category !== undefined) item.category = category;
  if (priority !== undefined) item.priority = priority;
  if (modelId !== undefined) {
    // 기종 ID 변경 시 유효성 검사
    const modelRepo = AppDataSource.getRepository(require('../entities/Model').Model);
    const model = await modelRepo.findOneBy({ id: parseInt(modelId), isActive: true });
    if (!model) {
      return res.status(400).json({ message: 'Invalid modelId' });
    }
    item.modelId = modelId;
  }
  
  item.updatedAt = new Date();

  await repo.save(item);

  // 히스토리 기록
  const historyRepo = AppDataSource.getRepository(History);
  await historyRepo.save(
    historyRepo.create({
      entityType: 'checklist',
      entityId: String(itemId),
      action: 'update',
      changes: JSON.stringify({
        message: '체크리스트 항목이 수정되었습니다.',
        before,
        after: {
          description: item.description,
          author: item.author,
          dueDate: item.dueDate,
          category: item.category,
          priority: item.priority,
          modelId: item.modelId,
        },
      }),
      author: author || 'unknown',
    })
  );

  return res.json({
    id: `${item.id}`,
    text: item.description,
    section: item.section,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    author: item.author,
    dueDate: item.dueDate,
    category: item.category,
    priority: item.priority,
    modelId: item.modelId, // 기종 정보 반환
  });
});

// DELETE /api/checklist/:itemId - delete a checklist item
router.delete('/:itemId', roleMiddleware(['admin']), async (req, res) => {
  const itemId = parseInt(req.params.itemId, 10);
  if (isNaN(itemId)) {
    return res.status(400).json({ message: 'Invalid itemId' });
  }

  const item = await repo.findOneBy({ id: itemId });
  if (!item) {
    return res.status(404).json({ message: 'Item not found' });
  }

  // 히스토리 기록
  const historyRepo = AppDataSource.getRepository(History);
  await historyRepo.save(
    historyRepo.create({
      entityType: 'checklist',
      entityId: String(itemId),
      action: 'delete',
      changes: JSON.stringify({
        message: '체크리스트 항목이 삭제되었습니다.',
        deleted: {
          description: item.description,
          author: item.author,
          dueDate: item.dueDate,
          modelId: item.modelId,
        },
      }),
      author: item.author || 'unknown',
    })
  );

  await repo.remove(item);
  return res.json({ success: true, id: itemId });
});

export default router;
