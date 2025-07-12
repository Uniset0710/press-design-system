import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { TreeNode } from './TreeNode';
import { Comment } from './Comment';

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
    enum: ['DTL', 'DTE', 'DL', 'DE', '2P', '4P'],
  })
  optionType!: 'DTL' | 'DTE' | 'DL' | 'DE' | '2P' | '4P';

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
