import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class AddModelOptions1709123456792 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ModelOption 테이블 생성
    await queryRunner.createTable(
      new Table({
        name: 'model_option',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'modelId',
            type: 'int',
          },
          {
            name: 'section',
            type: 'varchar',
          },
          {
            name: 'optionCode',
            type: 'varchar',
          },
          {
            name: 'optionName',
            type: 'varchar',
          },
          {
            name: 'order',
            type: 'int',
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['modelId'],
            referencedTableName: 'model',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('model_option');
  }
} 