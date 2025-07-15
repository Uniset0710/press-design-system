import express from 'express';
import { AppDataSource } from '../database';
import { Option } from '../entities/Option';
import { Model } from '../entities/Model';

const router = express.Router();
const optionRepo = AppDataSource.getRepository(Option);
const modelRepo = AppDataSource.getRepository(Model);

// GET /api/options - 기종별 옵션 목록 조회
router.get('/', async (req, res) => {
  try {
    const { modelId } = req.query;
    
    if (!modelId) {
      return res.status(400).json({ error: 'modelId is required' });
    }

    const options = await optionRepo.find({
      where: { modelId: String(modelId), isActive: true },
      order: { order: 'ASC' }
    });

    return res.json(options);
  } catch (error) {
    console.error('Error fetching options:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/options - 옵션 추가
router.post('/', async (req, res) => {
  try {
    const { modelId, name, code, description } = req.body;

    if (!modelId || !name || !code) {
      return res.status(400).json({ error: 'modelId, name, and code are required' });
    }

    // 기종 존재 여부 확인
    const model = await modelRepo.findOneBy({ id: parseInt(modelId), isActive: true });
    if (!model) {
      return res.status(404).json({ error: 'Model not found' });
    }

    // 코드 중복 확인
    const existingOption = await optionRepo.findOneBy({ 
      modelId: String(modelId), 
      code: code 
    });
    if (existingOption) {
      return res.status(400).json({ error: 'Option code already exists for this model' });
    }

    // 최대 order 값 조회
    const maxOrderOption = await optionRepo.findOne({
      where: { modelId: String(modelId) },
      order: { order: 'DESC' }
    });
    const newOrder = (maxOrderOption?.order || 0) + 1;

    const option = optionRepo.create({
      modelId: String(modelId),
      name,
      code,
      description,
      order: newOrder,
      isActive: true
    });

    await optionRepo.save(option);
    return res.status(201).json(option);
  } catch (error) {
    console.error('Error creating option:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/options/:id - 옵션 수정
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, description, isActive } = req.body;

    const option = await optionRepo.findOneBy({ id: parseInt(id) });
    if (!option) {
      return res.status(404).json({ error: 'Option not found' });
    }

    // 코드 변경 시 중복 확인
    if (code && code !== option.code) {
      const existingOption = await optionRepo.findOneBy({ 
        modelId: option.modelId, 
        code: code 
      });
      if (existingOption) {
        return res.status(400).json({ error: 'Option code already exists for this model' });
      }
    }

    option.name = name || option.name;
    option.code = code || option.code;
    option.description = description !== undefined ? description : option.description;
    option.isActive = isActive !== undefined ? isActive : option.isActive;

    await optionRepo.save(option);
    return res.json(option);
  } catch (error) {
    console.error('Error updating option:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/options/:id - 옵션 삭제 (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const option = await optionRepo.findOneBy({ id: parseInt(id) });
    if (!option) {
      return res.status(404).json({ error: 'Option not found' });
    }

    // soft delete로 처리
    option.isActive = false;
    await optionRepo.save(option);

    return res.json({ success: true });
  } catch (error) {
    console.error('Error deleting option:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/options/reorder - 옵션 순서 변경
router.patch('/reorder', async (req, res) => {
  try {
    const { modelId, optionIds } = req.body;

    if (!modelId || !optionIds || !Array.isArray(optionIds)) {
      return res.status(400).json({ error: 'modelId and optionIds array are required' });
    }

    // 순서 업데이트
    for (let i = 0; i < optionIds.length; i++) {
      await optionRepo.update(
        { id: parseInt(optionIds[i]), modelId: String(modelId) },
        { order: i + 1 }
      );
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('Error reordering options:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 