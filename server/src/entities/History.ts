import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity()
export class History {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  entityType: "checklist" | "tree"; // 어떤 엔티티가 변경되었는지

  @Column()
  entityId: string; // 변경된 엔티티의 ID

  @Column()
  action: "create" | "update" | "delete"; // 수행된 작업

  @Column("text")
  changes: string; // JSON string of changes

  @Column()
  author: string;

  @CreateDateColumn()
  createdAt: Date;
} 