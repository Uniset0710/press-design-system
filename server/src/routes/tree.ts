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
    
    console.log('Tree API called with modelId:', modelId);
    
    // modelId에 따라 press 노드 필터링
    let whereCondition: any = { type: 'press', parentId: IsNull() };
    if (modelId && typeof modelId === 'string') {
      whereCondition.model = modelId;
      console.log(`Filtering press nodes by modelId: ${modelId}`);
    }
    
    const roots = await repo.find({ 
      where: whereCondition, 
      order: { order: 'ASC' } 
    });
    
    console.log(`Found ${roots.length} press nodes for modelId: ${modelId}`);
    
    // 각 press 노드에 대해 assemblies/parts 구조로 트리 구성
    const data = await Promise.all(
      roots.map(async (root: TreeNode) => {
        // assemblies 조회 (같은 model 필터 적용)
        const assemblies = await repo.find({ 
          where: { 
            parentId: root.id, 
            type: 'assembly',
            model: (modelId && typeof modelId === 'string') ? modelId : root.model
          }, 
          order: { order: 'ASC' } 
        });
        
        console.log(`Found ${assemblies.length} assemblies for press node ${root.id} with modelId: ${modelId}`);
        
        // 각 assembly에 대해 parts 조회 (같은 model 필터 적용)
        const assemblyNodes = await Promise.all(
          assemblies.map(async (asm: TreeNode) => {
            const parts = await repo.find({ 
              where: { 
                parentId: asm.id, 
                type: 'part',
                model: (modelId && typeof modelId === 'string') ? modelId : asm.model
              }, 
              order: { order: 'ASC' } 
            });
            
            console.log(`Found ${parts.length} parts for assembly ${asm.id} with modelId: ${modelId}`);
            
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
    console.log('Tree POST 요청:', { nodeId, assemblyId, name, modelId });
    
    if (assemblyId) {
      // add part
      const asm = await repo.findOneBy({ id: assemblyId, type: 'assembly' });
      if (!asm) return res.status(404).json({ error: 'Assembly not found' });
      const maxOrderPart = await repo.findOne({ where: { parentId: assemblyId, type: 'part' }, order: { order: 'DESC' } });
      const newOrder = (maxOrderPart?.order || 0) + 1;
      const part = repo.create({ 
        name, 
        type: 'part', 
        parentId: assemblyId, 
        order: newOrder,
        model: modelId || asm.model // model 필드 설정
      });
      console.log('파트 생성:', { name, model: part.model, assemblyId });
      await repo.save(part);
      return res.json({ success: true, part });
    }
    if (nodeId) {
      // add assembly
      const press = await repo.findOneBy({ id: nodeId, type: 'press' });
      if (!press) return res.status(404).json({ error: 'Press node not found' });
      const maxOrderAssembly = await repo.findOne({ where: { parentId: nodeId, type: 'assembly' }, order: { order: 'DESC' } });
      const newOrder = (maxOrderAssembly?.order || 0) + 1;
      const asm = repo.create({ 
        name, 
        type: 'assembly', 
        parentId: nodeId, 
        order: newOrder,
        model: modelId || press.model // model 필드 설정
      });
      console.log('어셈블리 생성:', { name, model: asm.model, nodeId });
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
    console.log('Tree DELETE 요청:', { type, id, modelId });
    
    if (type === 'assembly' || type === 'part') {
      const node = await repo.findOneBy({ id, type });
      console.log('삭제할 노드 찾기:', { id, type, found: !!node });
      
      if (!node) {
        console.log('노드를 찾을 수 없음:', { id, type });
        return res.status(404).json({ error: 'Node not found' });
      }
      
      console.log('노드 삭제 시작:', { id: node.id, name: node.name, type: node.type });
      
      // 연관된 하위 항목들도 함께 삭제
      if (type === 'assembly') {
        // 어셈블리 삭제 시 하위 파트들도 삭제
        const childParts = await repo.find({ where: { parentId: id, type: 'part' } });
        console.log('하위 파트들 삭제:', childParts.length, '개');
        for (const part of childParts) {
          await repo.remove(part);
        }
      }
      
      await repo.remove(node);
      console.log('노드 삭제 완료:', { id: node.id, name: node.name });
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
