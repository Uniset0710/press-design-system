import { MigrationInterface, QueryRunner } from "typeorm";

export class AddModelIdToChecklistItem1709123456791 implements MigrationInterface {
    name = 'AddModelIdToChecklistItem1709123456791'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "checklist_item" ADD "modelId" varchar`);
        await queryRunner.query(`CREATE INDEX "IDX_checklist_item_modelId" ON "checklist_item" ("modelId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_checklist_item_modelId"`);
        await queryRunner.query(`ALTER TABLE "checklist_item" DROP COLUMN "modelId"`);
    }
} 