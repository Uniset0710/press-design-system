import { AppDataSource } from './src/database';
import { Model } from './src/entities/Model';

async function checkModels() {
  try {
    await AppDataSource.initialize();
    const repo = AppDataSource.getRepository(Model);
    
    console.log('=== 모델 데이터 확인 ===');
    
    // 모든 모델 확인
    const allModels = await repo.find();
    console.log(`\n전체 모델: ${allModels.length}개`);
    allModels.forEach(model => {
      console.log(`  - ID: ${model.id}, Name: ${model.name}, Code: ${model.code}, Active: ${model.isActive}`);
    });
    
    // 활성화된 모델만 확인
    const activeModels = await repo.find({ 
      where: { isActive: true } 
    });
    console.log(`\n활성화된 모델: ${activeModels.length}개`);
    activeModels.forEach(model => {
      console.log(`  - ID: ${model.id}, Name: ${model.name}, Code: ${model.code}, Active: ${model.isActive}`);
    });
    
    await AppDataSource.destroy();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkModels(); 