import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  username!: string;

  @Column({ nullable: true })
  email?: string; // 이메일 필드 추가

  @Column()
  password!: string;

  @Column({
    type: 'varchar',
    enum: ['admin', 'user'],
    default: 'user',
  })
  role!: 'admin' | 'user';

  @Column({ nullable: true })
  model?: string; // 사용자가 접근할 수 있는 모델

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
