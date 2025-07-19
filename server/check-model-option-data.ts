import { AppDataSource } from './src/database';

async function checkModelOptionData() {
  try {
    await AppDataSource.initialize();
    console.log('데이터베이스 연결 성공');

    // 업데이트된 데이터 확인
    const options = await AppDataSource.query(`
      SELECT * FROM model_option ORDER BY modelId, section, "order"
    `);
    
    console.log('업데이트된 model_option 데이터:');
    console.log('총 레코드 수:', options.length);
    console.log('');
    
    options.forEach((option: any) => {
      console.log(`ID: ${option.id}`);
      console.log(`ModelId: ${option.modelId} (타입: ${typeof option.modelId})`);
      console.log(`Section: ${option.section}`);
      console.log(`Code: ${option.optionCode}`);
      console.log(`Name: ${option.optionName}`);
      console.log(`Order: ${option.order}`);
      console.log(`Active: ${option.isActive}`);
      console.log('---');
    });

    console.log('데이터 확인 완료!');
  } catch (error) {
    console.error('오류 발생:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

checkModelOptionData(); 