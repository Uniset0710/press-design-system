import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeModelOptionModelIdType1709123456795 implements MigrationInterface {
    name = 'ChangeModelOptionModelIdType1709123456795'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 외래 키 제약 조건 제거
        await queryRunner.query(`PRAGMA foreign_keys = OFF`);
        
        // 임시 테이블 생성
        await queryRunner.query(`
            CREATE TABLE "temporary_model_option" (
                "id" uuid PRIMARY KEY NOT NULL DEFAULT (uuid_generate_v4()),
                "modelId" varchar NOT NULL,
                "section" varchar NOT NULL,
                "optionCode" varchar NOT NULL,
                "optionName" varchar NOT NULL,
                "order" int NOT NULL,
                "isActive" boolean NOT NULL DEFAULT (true),
                "createdAt" timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP),
                "updatedAt" timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP)
            )
        `);
        
        // 데이터 복사 (modelId를 문자열로 변환)
        await queryRunner.query(`
            INSERT INTO "temporary_model_option" ("id", "modelId", "section", "optionCode", "optionName", "order", "isActive", "createdAt", "updatedAt")
            SELECT 
                "id",
                CASE 
                    WHEN "modelId" = 1 THEN 'LARGE_PRESS'
                    WHEN "modelId" = 7 THEN 'MEDIUM_PRESS'
                    ELSE CAST("modelId" AS varchar)
                END as "modelId",
                "section",
                "optionCode",
                "optionName",
                "order",
                "isActive",
                "createdAt",
                "updatedAt"
            FROM "model_option"
        `);
        
        // 기존 테이블 삭제
        await queryRunner.query(`DROP TABLE "model_option"`);
        
        // 새 테이블 이름 변경
        await queryRunner.query(`ALTER TABLE "temporary_model_option" RENAME TO "model_option"`);
        
        // 외래 키 제약 조건 다시 활성화
        await queryRunner.query(`PRAGMA foreign_keys = ON`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 롤백: 다시 숫자 타입으로 변경
        await queryRunner.query(`PRAGMA foreign_keys = OFF`);
        
        // 임시 테이블 생성
        await queryRunner.query(`
            CREATE TABLE "temporary_model_option" (
                "id" uuid PRIMARY KEY NOT NULL DEFAULT (uuid_generate_v4()),
                "modelId" int NOT NULL,
                "section" varchar NOT NULL,
                "optionCode" varchar NOT NULL,
                "optionName" varchar NOT NULL,
                "order" int NOT NULL,
                "isActive" boolean NOT NULL DEFAULT (true),
                "createdAt" timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP),
                "updatedAt" timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP),
                CONSTRAINT "FK_9e13e4d4bdd92dd217a18e493ae" FOREIGN KEY ("modelId") REFERENCES "model" ("id") ON DELETE CASCADE
            )
        `);
        
        // 데이터 복사 (문자열을 숫자로 변환)
        await queryRunner.query(`
            INSERT INTO "temporary_model_option" ("id", "modelId", "section", "optionCode", "optionName", "order", "isActive", "createdAt", "updatedAt")
            SELECT 
                "id",
                CASE 
                    WHEN "modelId" = 'LARGE_PRESS' THEN 1
                    WHEN "modelId" = 'MEDIUM_PRESS' THEN 7
                    ELSE CAST("modelId" AS int)
                END as "modelId",
                "section",
                "optionCode",
                "optionName",
                "order",
                "isActive",
                "createdAt",
                "updatedAt"
            FROM "model_option"
        `);
        
        // 기존 테이블 삭제
        await queryRunner.query(`DROP TABLE "model_option"`);
        
        // 새 테이블 이름 변경
        await queryRunner.query(`ALTER TABLE "temporary_model_option" RENAME TO "model_option"`);
        
        // 외래 키 제약 조건 다시 활성화
        await queryRunner.query(`PRAGMA foreign_keys = ON`);
    }
} 