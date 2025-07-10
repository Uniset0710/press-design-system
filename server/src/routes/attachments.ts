import express from 'express';
import multer from 'multer';
import { AppDataSource } from '../database';
import { Attachment } from '../entities/Attachment';

const router = express.Router();
const attachmentRepo = AppDataSource.getRepository(Attachment);
const upload = multer();

// GET /api/attachments/:itemId - retrieve attachments as objects with id, uri, filename
router.get('/:itemId', async (req, res) => {
  // parse and validate itemId
  const idParam = req.params.itemId;
  const itemId = parseInt(idParam, 10);
  if (isNaN(itemId)) {
    // invalid itemId, return empty list
    return res.json([]);
  }
  const attachments = await attachmentRepo.find({ where: { checklistItemId: itemId } });
  // return array of { id, uri, filename }
  const items = attachments.map(att => ({
    id: att.id,
    uri: `data:${att.mimeType};base64,${att.data.toString('base64')}`,
    filename: att.filename
  }));
  return res.json(items);
});

// POST /api/attachments/:itemId - upload a new attachment
router.post('/:itemId', upload.single('file'), async (req, res) => {
  try {
    // parse and validate itemId
    const idParam = req.params.itemId;
    const itemId = parseInt(idParam, 10);
    if (isNaN(itemId)) {
      return res.status(400).json({ message: 'Invalid itemId' });
    }

    // checklist item 존재 여부 확인
    const checklistItemRepo = AppDataSource.getRepository(require('../entities/ChecklistItem').ChecklistItem);
    const checklistItem = await checklistItemRepo.findOneBy({ id: itemId });
    if (!checklistItem) {
      return res.status(404).json({ message: 'Checklist item not found' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const attachment = attachmentRepo.create({
      checklistItemId: itemId,
      filename: req.file.originalname,
      mimeType: req.file.mimetype,
      data: req.file.buffer
    });

    await attachmentRepo.save(attachment);

    const saved = await attachmentRepo.find({ where: { checklistItemId: itemId } });
    const items = saved.map(att => ({
      id: att.id,
      uri: `data:${att.mimeType};base64,${att.data.toString('base64')}`,
      filename: att.filename
    }));
    return res.json(items);
  } catch (e) {
    return res.status(500).json({ message: '첨부파일 저장 실패', error: e.message });
  }
});

// DELETE /api/attachments/:attachmentId - delete a specific attachment
router.delete('/:attachmentId', async (req, res) => {
  const attachmentId = parseInt(req.params.attachmentId, 10);
  if (isNaN(attachmentId)) {
    return res.status(400).json({ message: 'Invalid attachmentId' });
  }
  const att = await attachmentRepo.findOneBy({ id: attachmentId });
  if (!att) {
    return res.status(404).json({ message: 'Attachment not found' });
  }
  await attachmentRepo.remove(att);
  return res.json({ success: true, id: attachmentId });
});

export default router; 