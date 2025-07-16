import { AppDataSource } from './src/database';
import { TreeNode } from './src/entities/TreeNode';
import { ChecklistItem } from './src/entities/ChecklistItem';
import { Model } from './src/entities/Model';

async function checkResults() {
  await AppDataSource.initialize();
  
  const treeRepo = AppDataSource.getRepository(TreeNode);
  const checklistRepo = AppDataSource.getRepository(ChecklistItem);
  const modelRepo = AppDataSource.getRepository(Model);
  
  console.log('=== 마이그레이션 후 결과 확인 ===');
  
  // 모델별 트리 구조 확인
  const models = await modelRepo.find({ where: { isActive: true } });
  for (const model of models) {
    const pressNodes = await treeRepo.find({ where: { type: 'press', model: model.code } });
    const assemblies = await treeRepo.find({ where: { type: 'assembly', model: model.code } });
    const parts = await treeRepo.find({ where: { type: 'part', model: model.code } });
    
    console.log(`\n${model.name} (${model.code}):`);
    console.log(`  - Press: ${pressNodes.length}개`);
    console.log(`  - Assembly: ${assemblies.length}개`);
    console.log(`  - Part: ${parts.length}개`);
  }
  
  // 체크리스트 데이터 확인
  const checklistGroups = await checklistRepo
    .createQueryBuilder('item')
    .select('item.modelId, COUNT(*) as count')
    .groupBy('item.modelId')
    .getRawMany();
  
  console.log('\n=== 체크리스트 데이터 분포 ===');
  checklistGroups.forEach(group => {
    console.log(`ModelId: ${group.modelId || 'NULL'}, Count: ${group.count}`);
  });
  
  await AppDataSource.destroy();
}

checkResults().catch(console.error); 