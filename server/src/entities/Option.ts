import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Option {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  modelId!: string; // 기종 ID

  @Column()
  name!: string; // 옵션명 (예: DTL, DTE, DL)

  @Column()
  code!: string; // 옵션 코드

  @Column({ type: 'int', default: 0 })
  order!: number; // 정렬 순서

  @Column({ nullable: true })
  description?: string; // 옵션 설명

  @Column({ type: 'boolean', default: true })
  isActive!: boolean; // 활성화 여부

  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt!: Date;

  constructor(partial: Partial<Option> = {}) {
    Object.assign(this, partial);
    this.isActive = partial.isActive ?? true;
    this.order = partial.order ?? 0;
  }
} 