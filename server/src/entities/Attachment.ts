import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ChecklistItem } from './ChecklistItem';

@Entity()
export class Attachment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  checklistItemId!: number;

  @ManyToOne(() => ChecklistItem, checklist => checklist.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'checklistItemId' })
  checklistItem!: ChecklistItem;

  @Column()
  filename!: string;

  @Column()
  mimeType!: string;

  @Column('blob')
  data!: Buffer;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  constructor(partial: Partial<Attachment> = {}) {
    Object.assign(this, partial);
    this.createdAt = new Date();
  }
} 