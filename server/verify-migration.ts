import { AppDataSource } from './src/database';
import { TreeNode } from './src/entities/TreeNode';
import { ChecklistItem } from './src/entities/ChecklistItem';
import { Model } from './src/entities/Model';

async function verifyMigration() {
  await AppDataSource.initialize();
  
  const treeRepo = AppDataSource.getRepository(TreeNode);
  const checklistRepo = AppDataSource.getRepository(ChecklistItem);
  const modelRepo = AppDataSource.getRepository(Model);
  
  console.log('=== 마이그레이션 검증 ===');
  
  // 1. 모델별 트리 구조 독립성 확인
  const models = await modelRepo.find({ where: { isActive: true } });
  console.log('\n1. 모델별 트리 구조:');
  
  for (const model of models) {
    const pressNodes = await treeRepo.find({ where: { type: 'press', model: model.code } });
    const assemblies = await treeRepo.find({ where: { type: 'assembly', model: model.code } });
    const parts = await treeRepo.find({ where: { type: 'part', model: model.code } });
    
    console.log(`${model.name} (${model.code}): Press ${pressNodes.length}개, Assembly ${assemblies.length}개, Part ${parts.length}개`);
  }
  
  // 2. 체크리스트 데이터 분리 확인
  console.log('\n2. 체크리스트 데이터 분리:');
  const checklistGroups = await checklistRepo
    .createQueryBuilder('item')
    .select('item.modelId, COUNT(*) as count')
    .groupBy('item.modelId')
    .getRawMany();
  
  checklistGroups.forEach(group => {
    console.log(`ModelId: ${group.modelId || 'NULL'}, Count: ${group.count}`);
  });
  
  // 3. 모델별 데이터 중복 확인
  console.log('\n3. 모델별 데이터 중복 확인:');
  for (const model of models) {
    const otherModels = models.filter(m => m.code !== model.code);
    
    for (const otherModel of otherModels) {
      const modelPressNodes = await treeRepo.find({ where: { type: 'press', model: model.code } });
      const otherModelPressNodes = await treeRepo.find({ where: { type: 'press', model: otherModel.code } });
      
      const modelChecklistItems = await checklistRepo.find({ where: { modelId: model.code } });
      const otherModelChecklistItems = await checklistRepo.find({ where: { modelId: otherModel.code } });
      
      console.log(`${model.code} vs ${otherModel.code}: Press 중복 ${modelPressNodes.length === otherModelPressNodes.length ? '있음' : '없음'}, Checklist 중복 ${modelChecklistItems.length === otherModelChecklistItems.length ? '있음' : '없음'}`);
    }
  }
  
  await AppDataSource.destroy();
  console.log('\n=== 검증 완료 ===');
}

verifyMigration().catch(console.error); 