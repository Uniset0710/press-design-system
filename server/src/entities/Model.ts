import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ModelOption } from './ModelOption';

@Entity()
export class Model {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  name!: string; // 기종명 (예: Press A, Press B)

  @Column({ unique: true })
  code!: string; // 기종 코드 (예: PRESS_A, PRESS_B)

  @Column({ nullable: true })
  description?: string; // 기종 설명

  @Column({ type: 'int', default: 0 })
  order!: number; // 정렬 순서

  @Column({ type: 'boolean', default: true })
  isActive!: boolean; // 활성화 여부

  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt!: Date;

  // ModelOption과의 관계 (기종 코드로 연결되므로 관계 제거)
  // @OneToMany(() => ModelOption, option => option.model)
  // options: ModelOption[];

  constructor(partial: Partial<Model> = {}) {
    Object.assign(this, partial);
    this.isActive = partial.isActive ?? true;
    this.order = partial.order ?? 0;
  }
} 