import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddModelFields1709123456790 implements MigrationInterface {
  name = 'AddModelFields1709123456790';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // User 테이블에 model 필드 추가
    await queryRunner.query(`
      ALTER TABLE "user" 
      ADD COLUMN "model" varchar NULL
    `);

    // TreeNode 테이블에 model 필드 추가
    await queryRunner.query(`
      ALTER TABLE "tree_node" 
      ADD COLUMN "model" varchar NULL
    `);

    // ChecklistItem 테이블에 model 필드 추가
    await queryRunner.query(`
      ALTER TABLE "checklist_item" 
      ADD COLUMN "model" varchar NULL
    `);

    // 기존 데이터에 기본 모델 값 설정 (예: 'PRESS')
    await queryRunner.query(`
      UPDATE "user" 
      SET "model" = 'PRESS' 
      WHERE "model" IS NULL
    `);

    await queryRunner.query(`
      UPDATE "tree_node" 
      SET "model" = 'PRESS' 
      WHERE "model" IS NULL
    `);

    await queryRunner.query(`
      UPDATE "checklist_item" 
      SET "model" = 'PRESS' 
      WHERE "model" IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // User 테이블에서 model 필드 제거
    await queryRunner.query(`
      ALTER TABLE "user" 
      DROP COLUMN "model"
    `);

    // TreeNode 테이블에서 model 필드 제거
    await queryRunner.query(`
      ALTER TABLE "tree_node" 
      DROP COLUMN "model"
    `);

    // ChecklistItem 테이블에서 model 필드 제거
    await queryRunner.query(`
      ALTER TABLE "checklist_item" 
      DROP COLUMN "model"
    `);
  }
} 