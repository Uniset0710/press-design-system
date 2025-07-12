import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { ChecklistItem } from './ChecklistItem';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  content: string;

  @Column()
  author: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => ChecklistItem, item => item.comments, {
    onDelete: 'CASCADE',
  })
  checklistItem: ChecklistItem;
}
