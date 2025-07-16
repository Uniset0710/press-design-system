import express from 'express';
import { AppDataSource } from '../database';
import { Model } from '../entities/Model';
import { adminMiddleware, authMiddleware } from '../middleware/auth';
import { TreeNode } from '../entities/TreeNode';

const router = express.Router();
const modelRepo = AppDataSource.getRepository(Model);

// GET /api/models - 기종 목록 조회
router.get('/', async (req, res) => {
  try {
    const models = await modelRepo.find({
      where: { isActive: true },
      order: { order: 'ASC', name: 'ASC' } // order 우선, 그 다음 name
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

// POST /api/models - 기종 추가 (관리자만)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, code, description } = req.body;

    if (!name || !code) {
      return res.status(400).json({ error: 'name and code are required' });
    }

    // 코드 중복 확인
    const existingModelByCode = await modelRepo.findOneBy({ code });
    if (existingModelByCode) {
      return res.status(400).json({ error: '기종 코드가 이미 존재합니다.' });
    }

    // 기종명 중복 확인
    const existingModelByName = await modelRepo.findOneBy({ name });
    if (existingModelByName) {
      return res.status(400).json({ error: '기종명이 이미 존재합니다.' });
    }

    // 최대 order 값 조회
    const maxOrderModel = await modelRepo.findOne({
      where: { isActive: true },
      order: { order: 'DESC' }
    });
    const newOrder = (maxOrderModel?.order || 0) + 1;

    const model = modelRepo.create({
      name,
      code,
      description,
      order: newOrder,
      isActive: true
    });

    await modelRepo.save(model);
    console.log('Created new model:', model);

    // 새 기종에 대한 독립적인 트리 구조 생성
    const treeRepo = AppDataSource.getRepository(TreeNode);
    
    // 1. 새 기종 전용 Press 루트 노드 생성
    const pressNode = treeRepo.create({
      name: 'Press',
      type: 'press',
      parentId: null,
      order: 0,
      model: code // 새 기종 코드로 설정
    });
    await treeRepo.save(pressNode);
    console.log('Created independent press root for new model:', pressNode);

    // 2. 새 기종 전용 기본 Assembly들 생성
    const defaultAssemblies = [
      { name: 'Main Assembly', order: 1 },
      { name: 'Sub Assembly', order: 2 },
      { name: 'Control Assembly', order: 3 }
    ];

    for (const assemblyData of defaultAssemblies) {
      const assembly = treeRepo.create({
        name: assemblyData.name,
        type: 'assembly',
        parentId: pressNode.id,
        order: assemblyData.order,
        model: code // 새 기종 코드로 설정
      });
      await treeRepo.save(assembly);
      console.log('Created independent assembly for new model:', assembly);
    }

    return res.status(201).json({
      ...model,
      message: `Model '${name}' created successfully with independent tree structure`
    });
  } catch (error) {
    console.error('Error creating model:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/models/:id - 기종 수정 (관리자만)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, description, isActive } = req.body;

    const model = await modelRepo.findOneBy({ id: parseInt(id) });
    if (!model) {
      return res.status(404).json({ error: 'Model not found' });
    }

    // 코드 변경 시도 시 오류 반환
    if (code && code !== model.code) {
      return res.status(400).json({ 
        error: '기종 코드는 데이터베이스 필터링에 사용되므로 수정할 수 없습니다. 기종명과 설명만 수정 가능합니다.' 
      });
    }

    // 기종명과 설명만 수정 가능
    model.name = name || model.name;
    model.description = description !== undefined ? description : model.description;
    model.isActive = isActive !== undefined ? isActive : model.isActive;

    await modelRepo.save(model);
    return res.json(model);
  } catch (error) {
    console.error('Error updating model:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/models/:id - 기종 삭제 (관리자만)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🔍 모델 삭제 시도 - ID:', id);

    const model = await modelRepo.findOneBy({ id: parseInt(id) });
    if (!model) {
      console.log('❌ 모델을 찾을 수 없음 - ID:', id);
      return res.status(404).json({ error: 'Model not found' });
    }

    console.log('✅ 모델 찾음:', model);

    // soft delete로 처리
    model.isActive = false;
    await modelRepo.save(model);
    console.log('✅ 모델 삭제 완료 - ID:', id);

    return res.json({ success: true });
  } catch (error) {
    console.error('❌ 모델 삭제 중 오류 발생:', error);
    console.error('❌ 오류 상세:', error instanceof Error ? error.message : 'Unknown error');
    console.error('❌ 오류 스택:', error instanceof Error ? error.stack : 'No stack trace');
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/models/reorder - 모델 순서 변경 (관리자만)
router.patch('/reorder', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { modelIds } = req.body; // 새로운 순서의 모델 ID 배열

    if (!modelIds || !Array.isArray(modelIds)) {
      return res.status(400).json({ error: 'modelIds array is required' });
    }

    // 순서 업데이트
    for (let i = 0; i < modelIds.length; i++) {
      await modelRepo.update(
        { id: parseInt(modelIds[i]) },
        { order: i + 1 }
      );
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('Error reordering models:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 