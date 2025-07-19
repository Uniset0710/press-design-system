import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveOptionTypeConstraint1709123456796 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 기존 CHECK constraint 제거
    await queryRunner.query(`PRAGMA foreign_keys = OFF`);
    
    // 임시 테이블 생성 (constraint 없이)
    await queryRunner.query(`
      CREATE TABLE "checklist_item_temp" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "partId" integer NOT NULL,
        "section" varchar NOT NULL,
        "optionType" varchar NOT NULL,
        "description" varchar NOT NULL,
        "imageUrl" varchar,
        "author" varchar,
        "dueDate" date,
        "category" varchar,
        "priority" varchar,
        "model" varchar,
        "modelId" varchar,
        "createdAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
        "updatedAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
        "modelEntityId" integer
      )
    `);
    
    // 데이터 복사
    await queryRunner.query(`
      INSERT INTO "checklist_item_temp" 
      SELECT * FROM "checklist_item"
    `);
    
    // 기존 테이블 삭제
    await queryRunner.query(`DROP TABLE "checklist_item"`);
    
    // 새 테이블을 원래 이름으로 변경
    await queryRunner.query(`
      ALTER TABLE "checklist_item_temp" RENAME TO "checklist_item"
    `);
    
    await queryRunner.query(`PRAGMA foreign_keys = ON`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 롤백 시에는 원래 enum constraint를 다시 추가
    await queryRunner.query(`PRAGMA foreign_keys = OFF`);
    
    await queryRunner.query(`
      CREATE TABLE "checklist_item_old" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "partId" integer NOT NULL,
        "section" varchar NOT NULL,
        "optionType" varchar NOT NULL CHECK ("optionType" IN ('DTL', 'DTE', 'DL', 'DE', '2P', '4P')),
        "description" varchar NOT NULL,
        "imageUrl" varchar,
        "author" varchar,
        "dueDate" date,
        "category" varchar,
        "priority" varchar,
        "model" varchar,
        "modelId" varchar,
        "createdAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
        "updatedAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
        "modelEntityId" integer
      )
    `);
    
    await queryRunner.query(`
      INSERT INTO "checklist_item_old" 
      SELECT * FROM "checklist_item"
    `);
    
    await queryRunner.query(`DROP TABLE "checklist_item"`);
    await queryRunner.query(`ALTER TABLE "checklist_item_old" RENAME TO "checklist_item"`);
    
    await queryRunner.query(`PRAGMA foreign_keys = ON`);
  }
} 