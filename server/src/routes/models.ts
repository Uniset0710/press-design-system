import express from 'express';
import { AppDataSource } from '../database';
import { Model } from '../entities/Model';

const router = express.Router();
const modelRepo = AppDataSource.getRepository(Model);

// GET /api/models - 기종 목록 조회
router.get('/', async (req, res) => {
  try {
    const models = await modelRepo.find({
      where: { isActive: true },
      order: { name: 'ASC' }
    });

    return res.json(models);
  } catch (error) {
    console.error('Error fetching models:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/models/:id - 특정 기종 조회
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const model = await modelRepo.findOneBy({ 
      id: parseInt(id), 
      isActive: true 
    });

    if (!model) {
      return res.status(404).json({ error: 'Model not found' });
    }

    return res.json(model);
  } catch (error) {
    console.error('Error fetching model:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/models - 기종 추가
router.post('/', async (req, res) => {
  try {
    const { name, code, description } = req.body;

    if (!name || !code) {
      return res.status(400).json({ error: 'name and code are required' });
    }

    // 코드 중복 확인
    const existingModel = await modelRepo.findOneBy({ code });
    if (existingModel) {
      return res.status(400).json({ error: 'Model code already exists' });
    }

    const model = modelRepo.create({
      name,
      code,
      description,
      isActive: true
    });

    await modelRepo.save(model);
    return res.status(201).json(model);
  } catch (error) {
    console.error('Error creating model:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/models/:id - 기종 수정
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, description, isActive } = req.body;

    const model = await modelRepo.findOneBy({ id: parseInt(id) });
    if (!model) {
      return res.status(404).json({ error: 'Model not found' });
    }

    // 코드 변경 시 중복 확인
    if (code && code !== model.code) {
      const existingModel = await modelRepo.findOneBy({ code });
      if (existingModel) {
        return res.status(400).json({ error: 'Model code already exists' });
      }
    }

    model.name = name || model.name;
    model.code = code || model.code;
    model.description = description !== undefined ? description : model.description;
    model.isActive = isActive !== undefined ? isActive : model.isActive;

    await modelRepo.save(model);
    return res.json(model);
  } catch (error) {
    console.error('Error updating model:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/models/:id - 기종 삭제 (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const model = await modelRepo.findOneBy({ id: parseInt(id) });
    if (!model) {
      return res.status(404).json({ error: 'Model not found' });
    }

    // soft delete로 처리
    model.isActive = false;
    await modelRepo.save(model);

    return res.json({ success: true });
  } catch (error) {
    console.error('Error deleting model:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 