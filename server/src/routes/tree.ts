import express from 'express';
import { AppDataSource } from '../database';
import { TreeNode } from '../entities/TreeNode';
import { IsNull } from 'typeorm';

const router = express.Router();
const repo = AppDataSource.getRepository(TreeNode);

// GET /api/tree - fetch all press nodes with nested assemblies and parts
router.get('/', async (req, res) => {
  const roots = await repo.find({
    where: { parentId: IsNull() },
    select: ['id', 'name'],
  });
  const data = await Promise.all(
    roots.map(async root => {
      const assemblies = await repo.find({
        where: { parentId: root.id, type: 'assembly' },
        select: ['id', 'name'],
      });
      const assemblyNodes = await Promise.all(
        assemblies.map(async asm => {
          const parts = await repo.find({
            where: { parentId: asm.id, type: 'part' },
            select: ['id', 'name'],
          });
          return { id: asm.id, name: asm.name, parts };
        })
      );
      return { id: root.id, name: root.name, assemblies: assemblyNodes };
    })
  );
  res.json(data);
});

// POST /api/tree - add assembly or part
router.post('/', async (req, res) => {
  const { nodeId, assemblyId, name } = req.body;
  if (assemblyId) {
    // add part
    const asm = await repo.findOneBy({ id: assemblyId, type: 'assembly' });
    if (!asm) return res.status(404).json({ message: 'Assembly not found' });
    const part = repo.create({ name, type: 'part', parentId: assemblyId });
    await repo.save(part);
    return res.json(part);
  }
  if (nodeId) {
    // add assembly
    const press = await repo.findOneBy({ id: nodeId, type: 'press' });
    if (!press)
      return res.status(404).json({ message: 'Press node not found' });
    const asm = repo.create({ name, type: 'assembly', parentId: nodeId });
    await repo.save(asm);
    return res.json(asm);
  }
  return res.status(400).json({ message: 'Invalid payload' });
});

// PUT /api/tree - rename assembly or part
router.put('/', async (req, res) => {
  const { assemblyId, partId, name } = req.body;
  if (assemblyId) {
    const asm = await repo.findOneBy({ id: assemblyId, type: 'assembly' });
    if (!asm) return res.status(404).json({ message: 'Assembly not found' });
    asm.name = name;
    await repo.save(asm);
    return res.json(asm);
  }
  if (partId) {
    const part = await repo.findOneBy({ id: partId, type: 'part' });
    if (!part) return res.status(404).json({ message: 'Part not found' });
    part.name = name;
    await repo.save(part);
    return res.json(part);
  }
  return res.status(400).json({ message: 'Invalid payload' });
});

// DELETE /api/tree - delete assembly or part
router.delete('/', async (req, res) => {
  const { type, id } = req.body;
  if (type === 'assembly' || type === 'part') {
    const node = await repo.findOneBy({ id, type });
    if (!node) return res.status(404).json({ message: 'Node not found' });
    await repo.remove(node);
    return res.json({ success: true });
  }
  return res.status(400).json({ message: 'Invalid type' });
});

// PATCH /api/tree - reorder (not implemented order in DB)
router.patch('/', (req, res) => {
  return res.status(501).json({ message: 'Reordering not implemented yet' });
});

export default router;
