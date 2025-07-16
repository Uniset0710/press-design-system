import { AppDataSource } from './src/database';
import { ChecklistItem } from './src/entities/ChecklistItem';
import { IsNull } from 'typeorm';

async function checkChecklistData() {
  await AppDataSource.initialize();
  const checklistRepo = AppDataSource.getRepository(ChecklistItem);
  
  console.log('=== 체크리스트 데이터 확인 ===');
  
  // 모든 체크리스트 항목 조회
  const allItems = await checklistRepo.find();
  console.log('총 체크리스트 항목 수:', allItems.length);
  
  // LARGE_PRESS 모델의 체크리스트 항목 조회
  const largePressItems = await checklistRepo.find({ 
    where: { modelId: 'LARGE_PRESS' } 
  });
  console.log('LARGE_PRESS 모델의 체크리스트 항목 수:', largePressItems.length);
  
  // modelId가 null인 항목들 조회
  const nullModelItems = await checklistRepo.find({ 
    where: { modelId: IsNull() } 
  });
  console.log('modelId가 null인 항목 수:', nullModelItems.length);
  
  // modelId가 null인 항목들을 LARGE_PRESS로 업데이트
  if (nullModelItems.length > 0) {
    console.log('\n=== modelId가 null인 항목들을 LARGE_PRESS로 업데이트 ===');
    for (const item of nullModelItems) {
      item.modelId = 'LARGE_PRESS';
      await checklistRepo.save(item);
      console.log(`체크리스트 항목 "${item.description}" (ID: ${item.id}) 업데이트됨`);
    }
  }
  
  // 업데이트 후 결과 확인
  const updatedLargePressItems = await checklistRepo.find({ 
    where: { modelId: 'LARGE_PRESS' } 
  });
  console.log('\n=== 업데이트 후 LARGE_PRESS 모델의 체크리스트 항목 수:', updatedLargePressItems.length);
  
  await AppDataSource.destroy();
}

checkChecklistData().catch(console.error); 