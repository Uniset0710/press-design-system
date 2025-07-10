import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class TreeNode {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({
    type: 'varchar',
    enum: ['press', 'assembly', 'part']
  })
  type!: 'press' | 'assembly' | 'part';

  @Column({ nullable: true })
  parentId!: number | null;

  @ManyToOne(() => TreeNode, node => node.children, { nullable: true })
  parent?: TreeNode;

  @OneToMany(() => TreeNode, node => node.parent)
  children!: TreeNode[];

  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt!: Date;

  constructor(partial: Partial<TreeNode> = {}) {
    Object.assign(this, partial);
    // NOTE: Do not initialize relation properties to default values (TypeORM requirement)
    // this.children = partial.children || [];
    // this.parentId = partial.parentId || null;
    // timestamps are auto-managed
  }
} 