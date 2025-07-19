export interface ModelOption {
  id: string;
  modelId: string;
  section: string;
  optionCode: string;
  optionName: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ModelOptionForm {
  optionCode: string;
  optionName: string;
  isActive: boolean;
}

export interface ReorderRequest {
  modelId: string;
  section: string;
  newOrder: string[];
} 