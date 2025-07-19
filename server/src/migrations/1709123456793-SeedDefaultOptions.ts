import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedDefaultOptions1709123456793 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 기존 모델들 조회
    const models = await queryRunner.query('SELECT id FROM model WHERE isActive = true');
    
    const defaultOptions = [
      { code: 'DTL', name: 'DTL' },
      { code: 'DTE', name: 'DTE' },
      { code: 'DL', name: 'DL' },
      { code: 'DE', name: 'DE' },
      { code: '2P', name: '2P' },
      { code: '4P', name: '4P' }
    ];
    
    const sections = ['Design Check List', 'Machining Check List', 'Assembly Check List'];
    
    // 각 모델에 대해 기본 옵션 생성
    for (const model of models) {
      for (const section of sections) {
        for (let i = 0; i < defaultOptions.length; i++) {
          const option = defaultOptions[i];
          await queryRunner.query(
            `INSERT INTO model_option (modelId, section, optionCode, optionName, "order", "isActive") 
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [model.id, section, option.code, option.name, i, true]
          );
        }
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM model_option');
  }
} 