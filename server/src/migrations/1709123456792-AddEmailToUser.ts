import { MigrationInterface, QueryRunner } from typeorm";

export class AddEmailToUser1709123456792plements MigrationInterface[object Object]  name = AddEmailToUser1709123456792

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE useremail character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE user" DROP COLUMNemail"`);
    }
} 