import { AppDataSource } from './src/database';
import { ChecklistItem } from './src/entities/ChecklistItem';

async function checkChecklistModelData() {
  try {
    await AppDataSource.initialize();
    const repo = AppDataSource.getRepository(ChecklistItem);
    
    console.log('=== 체크리스트 아이템의 modelId 확인 ===');
    
    // 모든 체크리스트 아이템 확인
    const allItems = await repo.find({ 
      take: 10 // 처음 10개만 확인
    });
    console.log(`\n체크리스트 아이템 (처음 10개): ${allItems.length}개`);
    allItems.forEach(item => {
      console.log(`  - ID: ${item.id}, PartId: ${item.partId}, ModelId: ${item.modelId}, Description: ${item.description.substring(0, 50)}...`);
    });
    
    // LARGE_PRESS 모델의 체크리스트 아이템 확인
    const largePressItems = await repo.find({ 
      where: { modelId: 'LARGE_PRESS' },
      take: 10
    });
    console.log(`\nLARGE_PRESS 모델 체크리스트 아이템: ${largePressItems.length}개`);
    largePressItems.forEach(item => {
      console.log(`  - ID: ${item.id}, PartId: ${item.partId}, ModelId: ${item.modelId}, Description: ${item.description.substring(0, 50)}...`);
    });
    
    // 모델 ID 1의 체크리스트 아이템 확인
    const model1Items = await repo.find({ 
      where: { modelId: '1' },
      take: 10
    });
    console.log(`\n모델 ID 1 체크리스트 아이템: ${model1Items.length}개`);
    model1Items.forEach(item => {
      console.log(`  - ID: ${item.id}, PartId: ${item.partId}, ModelId: ${item.modelId}, Description: ${item.description.substring(0, 50)}...`);
    });
    
    // 고유한 modelId 값들 확인
    const uniqueModelIds = await repo
      .createQueryBuilder('item')
      .select('DISTINCT item.modelId', 'modelId')
      .getRawMany();
    
    console.log(`\n고유한 modelId 값들: ${uniqueModelIds.length}개`);
    uniqueModelIds.forEach(({ modelId }) => {
      console.log(`  - ${modelId}`);
    });
    
    await AppDataSource.destroy();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkChecklistModelData(); 