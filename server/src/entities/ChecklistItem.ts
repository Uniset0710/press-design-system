import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { TreeNode } from './TreeNode';
import { Comment } from './Comment';
import { Model } from './Model';

@Entity()
export class ChecklistItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  partId!: number;

  @ManyToOne(() => TreeNode)
  part!: TreeNode;

  @Column()
  section!: string;

  @Column({
    type: 'varchar',
  })
  optionType!: string;

  @Column()
  description!: string;

  @Column({ nullable: true })
  imageUrl?: string;

  @Column({ nullable: true })
  author?: string;

  @Column({ type: 'date', nullable: true })
  dueDate?: Date;

  @Column({ nullable: true })
  category?: string;

  @Column({ nullable: true })
  priority?: string;

  @Column({ nullable: true })
  model?: string; // 체크리스트 항목이 속한 모델 (기존 호환성)

  @Column({ nullable: true })
  modelId?: string; // 기종별 필터링을 위한 모델 ID

  @ManyToOne(() => Model, { nullable: true })
  modelEntity?: Model; // 기종 엔티티와의 관계

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;

  @OneToMany(() => Comment, comment => comment.checklistItem)
  comments!: Comment[];

  constructor(partial: Partial<ChecklistItem> = {}) {
    Object.assign(this, partial);
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}
