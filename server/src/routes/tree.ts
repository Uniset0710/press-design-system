import express from 'express';
import { AppDataSource } from '../database';
import { TreeNode } from '../entities/TreeNode';
import { IsNull } from 'typeorm';
import { authMiddleware, modelIdAccessMiddleware, modelIdWriteMiddleware } from '../middleware/auth';

const router = express.Router();
const repo = AppDataSource.getRepository(TreeNode);

// GET /api/tree - fetch all press nodes with nested assemblies and parts
router.get('/', authMiddleware, modelIdAccessMiddleware, async (req, res) => {
  try {
    const { modelId } = req.query; // 기종별 필터링을 위한 파라미터
    
    // 모든 press(루트) 노드 조회
    const roots = await repo.find({ where: { type: 'press', parentId: IsNull() }, order: { order: 'ASC' } });
    
    // 기종별 필터링이 있는 경우, 해당 기종의 트리만 반환
    let filteredRoots = roots;
    if (modelId) {
      // modelId에 해당하는 press 노드만 필터링
      // 실제로는 press 노드와 modelId를 연결하는 로직이 필요할 수 있음
      // 현재는 모든 press 노드를 반환하되, 향후 modelId 기반 필터링 로직 추가 가능
      console.log(`Filtering by modelId: ${modelId}`);
    }
    
    // 각 press 노드에 대해 assemblies/parts 구조로 트리 구성
    const data = await Promise.all(
      filteredRoots.map(async root => {
        // assemblies 조회
        const assemblies = await repo.find({ where: { parentId: root.id, type: 'assembly' }, order: { order: 'ASC' } });
        // 각 assembly에 대해 parts 조회
        const assemblyNodes = await Promise.all(
          assemblies.map(async asm => {
            const parts = await repo.find({ where: { parentId: asm.id, type: 'part' }, order: { order: 'ASC' } });
            // parts: id, name만 반환
            return { id: String(asm.id), name: asm.name, parts: parts.map(p => ({ id: String(p.id), name: p.name })) };
          })
        );
        // PressNode: id, name, assemblies
        return { id: String(root.id), name: root.name, assemblies: assemblyNodes };
      })
    );
    res.json(data);
  } catch (error) {
    console.error('Error fetching tree data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/tree - add assembly or part
router.post('/', authMiddleware, modelIdWriteMiddleware, async (req, res) => {
  try {
    const { nodeId, assemblyId, name, modelId } = req.body; // modelId 추가
    if (assemblyId) {
      // add part
      const asm = await repo.findOneBy({ id: assemblyId, type: 'assembly' });
      if (!asm) return res.status(404).json({ error: 'Assembly not found' });
      const maxOrderPart = await repo.findOne({ where: { parentId: assemblyId, type: 'part' }, order: { order: 'DESC' } });
      const newOrder = (maxOrderPart?.order || 0) + 1;
      const part = repo.create({ name, type: 'part', parentId: assemblyId, order: newOrder });
      await repo.save(part);
      return res.json({ success: true, part });
    }
    if (nodeId) {
      // add assembly
      const press = await repo.findOneBy({ id: nodeId, type: 'press' });
      if (!press) return res.status(404).json({ error: 'Press node not found' });
      const maxOrderAssembly = await repo.findOne({ where: { parentId: nodeId, type: 'assembly' }, order: { order: 'DESC' } });
      const newOrder = (maxOrderAssembly?.order || 0) + 1;
      const asm = repo.create({ name, type: 'assembly', parentId: nodeId, order: newOrder });
      await repo.save(asm);
      return res.json({ success: true, assembly: asm });
    }
    return res.status(400).json({ error: 'Invalid payload' });
  } catch (error) {
    console.error('Error adding node:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/tree - rename assembly or part
router.put('/', authMiddleware, modelIdWriteMiddleware, async (req, res) => {
  try {
    const { assemblyId, partId, name, modelId } = req.body; // modelId 추가
    if (assemblyId) {
      const asm = await repo.findOneBy({ id: assemblyId, type: 'assembly' });
      if (!asm) return res.status(404).json({ error: 'Assembly not found' });
      asm.name = name;
      await repo.save(asm);
      return res.json({ success: true, assembly: asm });
    }
    if (partId) {
      const part = await repo.findOneBy({ id: partId, type: 'part' });
      if (!part) return res.status(404).json({ error: 'Part not found' });
      part.name = name;
      await repo.save(part);
      return res.json({ success: true, part });
    }
    return res.status(400).json({ error: 'Invalid payload' });
  } catch (error) {
    console.error('Error updating node:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/tree - delete assembly or part
router.delete('/', authMiddleware, modelIdWriteMiddleware, async (req, res) => {
  try {
    const { type, id, modelId } = req.body; // modelId 추가
    if (type === 'assembly' || type === 'part') {
      const node = await repo.findOneBy({ id, type });
      if (!node) return res.status(404).json({ error: 'Node not found' });
      await repo.remove(node);
      return res.json({ success: true });
    }
    return res.status(400).json({ error: 'Invalid type' });
  } catch (error) {
    console.error('Error deleting node:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/tree - reorder assemblies or parts
router.patch('/', authMiddleware, modelIdWriteMiddleware, async (req, res) => {
  try {
    const { type, nodeId, assemblyId, fromIndex, toIndex, modelId } = req.body; // modelId 추가
    if (type === 'moveAssembly') {
      const assemblies = await repo.find({ where: { parentId: nodeId, type: 'assembly' }, order: { order: 'ASC' } });
      if (fromIndex >= assemblies.length || toIndex >= assemblies.length) {
        return res.status(400).json({ error: 'Invalid index' });
      }
      const [movedAssembly] = assemblies.splice(fromIndex, 1);
      assemblies.splice(toIndex, 0, movedAssembly);
      for (let i = 0; i < assemblies.length; i++) {
        assemblies[i].order = i + 1;
        await repo.save(assemblies[i]);
      }
      return res.json({ success: true });
    }
    if (type === 'movePart') {
      const parts = await repo.find({ where: { parentId: assemblyId, type: 'part' }, order: { order: 'ASC' } });
      if (fromIndex >= parts.length || toIndex >= parts.length) {
        return res.status(400).json({ error: 'Invalid index' });
      }
      const [movedPart] = parts.splice(fromIndex, 1);
      parts.splice(toIndex, 0, movedPart);
      for (let i = 0; i < parts.length; i++) {
        parts[i].order = i + 1;
        await repo.save(parts[i]);
      }
      return res.json({ success: true });
    }
    return res.status(400).json({ error: 'Invalid type' });
  } catch (error) {
    console.error('Error reordering nodes:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
