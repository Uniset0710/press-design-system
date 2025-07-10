import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCommentsAndHistory1709123456789 implements MigrationInterface {
    name = 'AddCommentsAndHistory1709123456789'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "comment" (
                "id" varchar PRIMARY KEY NOT NULL,
                "content" text NOT NULL,
                "author" varchar NOT NULL,
                "createdAt" datetime NOT NULL DEFAULT (datetime('now')),
                "checklistItemId" integer,
                CONSTRAINT "FK_comment_checklist_item" FOREIGN KEY ("checklistItemId") REFERENCES "checklist_item" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "history" (
                "id" varchar PRIMARY KEY NOT NULL,
                "entityType" varchar NOT NULL,
                "entityId" varchar NOT NULL,
                "action" varchar NOT NULL,
                "changes" text NOT NULL,
                "author" varchar NOT NULL,
                "createdAt" datetime NOT NULL DEFAULT (datetime('now'))
            )
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_comment_checklist_item" ON "comment" ("checklistItemId")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_history_entity" ON "history" ("entityType", "entityId")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_history_entity"`);
        await queryRunner.query(`DROP INDEX "IDX_comment_checklist_item"`);
        await queryRunner.query(`DROP TABLE "history"`);
        await queryRunner.query(`DROP TABLE "comment"`);
    }
} 