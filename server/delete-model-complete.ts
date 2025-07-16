import { AppDataSource } from './src/database';
import { Model } from './src/entities/Model';
import { TreeNode } from './src/entities/TreeNode';
import { ChecklistItem } from './src/entities/ChecklistItem';
import { Comment } from './src/entities/Comment';
import { History } from './src/entities/History';
import { Attachment } from './src/entities/Attachment';

async function deleteModelComplete(modelId: number) {
  await AppDataSource.initialize();
  
  console.log(`🔍 기종 ID ${modelId} 완전 삭제 시작...`);
  
  try {
    // 1. 기종 정보 조회
    const modelRepo = AppDataSource.getRepository(Model);
    const model = await modelRepo.findOneBy({ id: modelId });
    
    if (!model) {
      console.log('❌ 기종을 찾을 수 없습니다.');
      return;
    }
    
    console.log(`📋 삭제할 기종: ${model.name} (${model.code})`);
    
    // 2. 관련 데이터 삭제 (역순으로 삭제)
    
    // 2-1. 첨부파일 삭제
    const attachmentRepo = AppDataSource.getRepository(Attachment);
    const attachments = await attachmentRepo.find({
      relations: ['checklistItem'],
      where: {
        checklistItem: {
          modelId: model.code
        }
      }
    });
    console.log(`📎 첨부파일 ${attachments.length}개 삭제`);
    await attachmentRepo.remove(attachments);
    
    // 2-2. 히스토리 삭제
    const historyRepo = AppDataSource.getRepository(History);
    const histories = await historyRepo.find({
      where: {
        entityType: 'checklist'
      }
    });
    // modelId가 포함된 히스토리만 필터링
    const filteredHistories = histories.filter(h => 
      h.changes && h.changes.includes(`"modelId":"${model.code}"`)
    );
    console.log(`📜 히스토리 ${filteredHistories.length}개 삭제`);
    await historyRepo.remove(filteredHistories);
    
    // 2-3. 댓글 삭제
    const commentRepo = AppDataSource.getRepository(Comment);
    const comments = await commentRepo.find({
      relations: ['checklistItem'],
      where: {
        checklistItem: {
          modelId: model.code
        }
      }
    });
    console.log(`💬 댓글 ${comments.length}개 삭제`);
    await commentRepo.remove(comments);
    
    // 2-4. 체크리스트 항목 삭제
    const checklistRepo = AppDataSource.getRepository(ChecklistItem);
    const checklistItems = await checklistRepo.find({
      where: {
        modelId: model.code
      }
    });
    console.log(`✅ 체크리스트 항목 ${checklistItems.length}개 삭제`);
    await checklistRepo.remove(checklistItems);
    
    // 2-5. 트리 노드 삭제
    const treeRepo = AppDataSource.getRepository(TreeNode);
    const treeNodes = await treeRepo.find({
      where: {
        model: model.code
      }
    });
    console.log(`🌳 트리 노드 ${treeNodes.length}개 삭제`);
    await treeRepo.remove(treeNodes);
    
    // 2-6. 기종 삭제
    console.log(`🗑️ 기종 삭제`);
    await modelRepo.remove(model);
    
    console.log(`✅ 기종 "${model.name}" 완전 삭제 완료!`);
    
  } catch (error) {
    console.error('❌ 삭제 중 오류 발생:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

// 사용법: node delete-model-complete.js <기종ID>
const modelId = process.argv[2];
if (!modelId) {
  console.log('사용법: node delete-model-complete.js <기종ID>');
  console.log('예시: node delete-model-complete.js 3');
  process.exit(1);
}

deleteModelComplete(parseInt(modelId)); 