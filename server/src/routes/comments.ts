import { Router } from "express";
import { AppDataSource } from "../database";
import { Comment } from "../entities/Comment";
import { ChecklistItem } from "../entities/ChecklistItem";
import { History } from "../entities/History";

const router = Router();

// 코멘트 추가
router.post("/:itemId", async (req, res) => {
  const { content, author } = req.body;
  const itemId = Number(req.params.itemId);
  if (isNaN(itemId)) return res.status(400).json({ error: "Invalid itemId" });

  const checklistRepo = AppDataSource.getRepository(ChecklistItem);
  const item = await checklistRepo.findOneBy({ id: itemId });
  if (!item) return res.status(404).json({ error: "Item not found" });

  const commentRepo = AppDataSource.getRepository(Comment);
  const comment = commentRepo.create({
    content,
    author,
    checklistItem: item
  });
  await commentRepo.save(comment);

  const historyRepo = AppDataSource.getRepository(History);
  await historyRepo.save(historyRepo.create({
    entityType: "checklist",
    entityId: String(itemId),
    action: "update",
    changes: JSON.stringify({ message: "코멘트가 추가되었습니다.", commentId: comment.id }),
    author
  }));

  return res.json(comment);
});

// 코멘트 목록 조회
router.get("/:itemId", async (req, res) => {
  const itemId = Number(req.params.itemId);
  if (isNaN(itemId)) return res.status(400).json({ error: "Invalid itemId" });
  const commentRepo = AppDataSource.getRepository(Comment);
  const comments = await commentRepo.find({
    where: { checklistItem: { id: itemId } },
    order: { createdAt: "DESC" },
    relations: ["checklistItem"]
  });
  return res.json(comments);
});

// 히스토리 조회
router.get("/history/:entityType/:entityId", async (req, res) => {
  const { entityType, entityId } = req.params;
  // entityType은 'checklist' | 'tree' 타입이어야 함
  if (entityType !== "checklist" && entityType !== "tree") {
    return res.status(400).json({ error: "Invalid entityType" });
  }
  const historyRepo = AppDataSource.getRepository(History);
  const history = await historyRepo.find({
    where: { entityType: entityType as "checklist" | "tree", entityId: String(entityId) },
    order: { createdAt: "DESC" }
  });
  return res.json(history);
});

// 코멘트 삭제
router.delete('/:commentId', async (req, res) => {
  const commentId = req.params.commentId;
  const commentRepo = AppDataSource.getRepository(Comment);
  const historyRepo = AppDataSource.getRepository(History);
  const comment = await commentRepo.findOne({ where: { id: commentId }, relations: ['checklistItem'] });
  if (!comment) return res.status(404).json({ error: 'Comment not found' });
  const checklistItemId = comment.checklistItem?.id;
  await commentRepo.remove(comment);
  if (checklistItemId) {
    await historyRepo.save(historyRepo.create({
      entityType: 'checklist',
      entityId: String(checklistItemId),
      action: 'update',
      changes: JSON.stringify({ message: '코멘트가 삭제되었습니다.', commentId }),
      author: comment.author || 'unknown',
    }));
  }
  return res.json({ success: true, id: commentId });
});

export default router; 