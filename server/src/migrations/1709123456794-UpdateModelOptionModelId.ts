import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateModelOptionModelId1709123456794 implements MigrationInterface {
    name = 'UpdateModelOptionModelId1709123456794'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 기존 데이터의 modelId를 기종 코드로 변경
        // 1 -> LARGE_PRESS, 7 -> 다른 기종 코드로 변경
        await queryRunner.query(`
            UPDATE model_option 
            SET modelId = 'LARGE_PRESS' 
            WHERE modelId = '1'
        `);
        
        // 다른 기종이 있다면 해당 코드로 변경
        // 예: 7 -> MEDIUM_PRESS (실제 기종 코드에 맞게 수정)
        await queryRunner.query(`
            UPDATE model_option 
            SET modelId = 'MEDIUM_PRESS' 
            WHERE modelId = '7'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 롤백: 기종 코드를 다시 숫자로 변경
        await queryRunner.query(`
            UPDATE model_option 
            SET modelId = '1' 
            WHERE modelId = 'LARGE_PRESS'
        `);
        
        await queryRunner.query(`
            UPDATE model_option 
            SET modelId = '7' 
            WHERE modelId = 'MEDIUM_PRESS'
        `);
    }
} 