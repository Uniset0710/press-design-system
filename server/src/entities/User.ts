import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  username!: string;

  @Column()
  password!: string;

  @Column({
    type: 'varchar',
    enum: ['admin', 'user'],
    default: 'user'
  })
  role!: 'admin' | 'user';

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;

  constructor(partial: Partial<User> = {}) {
    Object.assign(this, partial);
    this.role = partial.role || 'user';
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
} 