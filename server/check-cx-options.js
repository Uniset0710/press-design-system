const { AppDataSource } = require('./src/database');
const { ModelOption } = require('./src/entities/ModelOption');

async function checkCXOptions() {
  try {
    await AppDataSource.initialize();
    const repo = AppDataSource.getRepository(ModelOption);
    
    console.log('=== CX 모델 옵션 확인 ===');
    
    // CX 모델의 옵션 조회
    const cxOptions = await repo.find({ where: { modelId: 'CX' } });
    console.log(`CX 모델 옵션: ${cxOptions.length}개`);
    
    cxOptions.forEach(opt => {
      console.log(`- ${opt.section}: ${opt.optionCode} (${opt.optionName})`);
    });
    
    // 모든 모델 ID 확인
    const allModelIds = await repo
      .createQueryBuilder('option')
      .select('DISTINCT option.modelId', 'modelId')
      .getRawMany();
    
    console.log('\n=== 모든 모델 ID ===');
    allModelIds.forEach(item => {
      console.log(`- ${item.modelId}`);
    });
    
    await AppDataSource.destroy();
  } catch (error) {
    console.error('오류:', error);
  }
}

checkCXOptions(); 