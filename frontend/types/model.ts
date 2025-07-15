export interface Model {
  id: number;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Option {
  id: number;
  modelId: string;
  name: string;
  code: string;
  order: number;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateModelRequest {
  name: string;
  code: string;
  description?: string;
}

export interface UpdateModelRequest {
  name?: string;
  code?: string;
  description?: string;
  isActive?: boolean;
}

export interface CreateOptionRequest {
  modelId: string;
  name: string;
  code: string;
  description?: string;
}

export interface UpdateOptionRequest {
  name?: string;
  code?: string;
  description?: string;
  isActive?: boolean;
}

export interface ReorderOptionsRequest {
  modelId: string;
  optionIds: number[];
} 