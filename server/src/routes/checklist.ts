import express from 'express';
import { AppDataSource } from '../database';
import { ChecklistItem } from '../entities/ChecklistItem';
import { History } from '../entities/History';

const router = express.Router();
const repo = AppDataSource.getRepository(ChecklistItem);

// GET /api/checklist/:partId - fetch checklist items grouped by optionType
router.get('/:partId', async (req, res) => {
  const partId = parseInt(req.params.partId, 10);
  if (isNaN(partId)) {
    return res.status(400).json({});
  }
  const items = await repo.find({ where: { partId } });
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
    });
  }
  return res.json(result);
});

// POST /api/checklist/:partId - create a new checklist item
router.post('/:partId', async (req, res) => {
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
  } = req.body;
  if (!optionType || !description || !section) {
    return res.status(400).json({ message: 'Missing required fields' });
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
  });
});

// PUT /api/checklist/:itemId - update a checklist item
router.put('/:itemId', async (req, res) => {
  const itemId = parseInt(req.params.itemId, 10);
  if (isNaN(itemId)) {
    return res.status(400).json({ message: 'Invalid itemId' });
  }

  const item = await repo.findOneBy({ id: itemId });
  if (!item) {
    return res.status(404).json({ message: 'Checklist item not found' });
  }

  const { description, author, dueDate, category, priority } = req.body;
  const before = {
    description: item.description,
    author: item.author,
    dueDate: item.dueDate,
    category: item.category,
    priority: item.priority,
  };
  if (description !== undefined) item.description = description;
  if (author !== undefined) item.author = author;
  if (dueDate !== undefined) item.dueDate = dueDate;
  if (category !== undefined) item.category = category;
  if (priority !== undefined) item.priority = priority;
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
  });
});

// DELETE /api/checklist/:itemId - delete a checklist item
router.delete('/:itemId', async (req, res) => {
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
        },
      }),
      author: item.author || 'unknown',
    })
  );

  await repo.remove(item);
  return res.json({ success: true, id: itemId });
});

export default router;
