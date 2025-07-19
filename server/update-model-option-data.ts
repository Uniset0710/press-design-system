import { AppDataSource } from './src/database';

async function updateModelOptionData() {
  try {
    await AppDataSource.initialize();
    console.log('데이터베이스 연결 성공');

    // 기존 데이터의 modelId를 기종 코드로 변경
    console.log('model_option 테이블의 modelId를 기종 코드로 변경 중...');
    
    // 1 -> LARGE_PRESS로 변경
    const result1 = await AppDataSource.query(`
      UPDATE model_option 
      SET modelId = 'LARGE_PRESS' 
      WHERE modelId = '1'
    `);
    console.log('modelId 1 -> LARGE_PRESS 변경 완료');

    // 7 -> MEDIUM_PRESS로 변경 (실제 기종 코드에 맞게 수정 필요)
    const result2 = await AppDataSource.query(`
      UPDATE model_option 
      SET modelId = 'MEDIUM_PRESS' 
      WHERE modelId = '7'
    `);
    console.log('modelId 7 -> MEDIUM_PRESS 변경 완료');

    // 변경된 데이터 확인
    const options = await AppDataSource.query(`
      SELECT * FROM model_option ORDER BY modelId, section, "order"
    `);
    
    console.log('업데이트된 데이터:');
    options.forEach((option: any) => {
      console.log(`ID: ${option.id}, ModelId: ${option.modelId}, Section: ${option.section}, Code: ${option.optionCode}`);
    });

    console.log('데이터 업데이트 완료!');
  } catch (error) {
    console.error('오류 발생:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

updateModelOptionData(); 