import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Model } from './Model';

@Entity()
export class ModelOption {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  modelId: string;        // 기종 코드 (LARGE_PRESS, MEDIUM_PRESS 등)

  @Column()
  section: string;        // 섹션 (Design/Machining/Assembly)

  @Column()
  optionCode: string;     // 옵션 코드 (DTL, DTE, DL, DE, 2P, 4P)

  @Column()
  optionName: string;     // 옵션 이름 (한글 표시용)

  @Column()
  order: number;          // 정렬 순서 (드래그 앤 드롭용)

  @Column({ default: true })
  isActive: boolean;      // 활성화 여부

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // 관계 설정 (기종 코드로 연결)
  // @ManyToOne(() => Model, model => model.options)
  // @JoinColumn({ name: 'modelId' })
  // model: Model;
} 