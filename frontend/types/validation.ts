import { z } from 'zod';

// 체크리스트 아이템 검증 스키마
export const ChecklistItemSchema = z.object({
  id: z.string().optional(),
  taskName: z.string().min(1, '작업명은 필수입니다'),
  section: z.string().min(1, '섹션은 필수입니다'),
  options: z.array(z.string()).default([]),
  description: z.string().optional(),
  author: z.string().optional(),
  dueDate: z.string().optional(),
  category: z.string().optional(),
  priority: z.string().optional(),
  completed: z.boolean().default(false),
  partId: z.string().min(1, '파트 ID는 필수입니다'),
});

// 체크리스트 생성 요청 스키마
export const CreateChecklistRequestSchema = z.object({
  taskName: z.string().min(1, '작업명은 필수입니다'),
  section: z.string().min(1, '섹션은 필수입니다'),
  options: z.array(z.string()).default([]),
  description: z.string().optional(),
  author: z.string().optional(),
  dueDate: z.string().optional(),
  category: z.string().optional(),
  priority: z.string().optional(),
  partId: z.string().min(1, '파트 ID는 필수입니다'),
});

// 체크리스트 수정 요청 스키마
export const UpdateChecklistRequestSchema = z.object({
  taskName: z.string().min(1, '작업명은 필수입니다').optional(),
  section: z.string().min(1, '섹션은 필수입니다').optional(),
  options: z.array(z.string()).optional(),
  description: z.string().optional(),
  author: z.string().optional(),
  dueDate: z.string().optional(),
  category: z.string().optional(),
  priority: z.string().optional(),
  completed: z.boolean().optional(),
});

// 트리 노드 검증 스키마
export const TreeNodeSchema = z.object({
  id: z.string(),
  name: z.string().min(1, '이름은 필수입니다'),
  type: z.enum(['press', 'assembly', 'part']),
  parentId: z.string().optional(),
  order: z.number().default(0),
});

// 어셈블리 생성 요청 스키마
export const CreateAssemblyRequestSchema = z.object({
  nodeId: z.string().min(1, '노드 ID는 필수입니다'),
  name: z.string().min(1, '어셈블리 이름은 필수입니다'),
});

// 파트 생성 요청 스키마
export const CreatePartRequestSchema = z.object({
  assemblyId: z.string().min(1, '어셈블리 ID는 필수입니다'),
  name: z.string().min(1, '파트 이름은 필수입니다'),
});

// 트리 노드 수정 요청 스키마
export const UpdateTreeNodeRequestSchema = z.object({
  partId: z.string().optional(),
  assemblyId: z.string().optional(),
  name: z.string().min(1, '이름은 필수입니다'),
});

// 트리 노드 삭제 요청 스키마
export const DeleteTreeNodeRequestSchema = z.object({
  type: z.enum(['part', 'assembly']),
  id: z.string().min(1, 'ID는 필수입니다'),
});

// 파일 업로드 검증 스키마
export const FileUploadSchema = z.object({
  file: z.instanceof(File),
  itemId: z.string().min(1, '아이템 ID는 필수입니다'),
});

// API 응답 스키마
export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: dataSchema,
    message: z.string(),
    success: z.boolean(),
  });

// 에러 응답 스키마
export const ErrorResponseSchema = z.object({
  error: z.string(),
  statusCode: z.number().optional(),
});

// 타입 추론
export type ChecklistItem = z.infer<typeof ChecklistItemSchema>;
export type CreateChecklistRequest = z.infer<typeof CreateChecklistRequestSchema>;
export type UpdateChecklistRequest = z.infer<typeof UpdateChecklistRequestSchema>;
export type TreeNode = z.infer<typeof TreeNodeSchema>;
export type CreateAssemblyRequest = z.infer<typeof CreateAssemblyRequestSchema>;
export type CreatePartRequest = z.infer<typeof CreatePartRequestSchema>;
export type UpdateTreeNodeRequest = z.infer<typeof UpdateTreeNodeRequestSchema>;
export type DeleteTreeNodeRequest = z.infer<typeof DeleteTreeNodeRequestSchema>;
export type FileUploadRequest = z.infer<typeof FileUploadSchema>;
export type ApiResponse<T> = z.infer<ReturnType<typeof ApiResponseSchema<z.ZodType<T>>>>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

// 검증 함수들
export const validateChecklistItem = (data: unknown): ChecklistItem => {
  return ChecklistItemSchema.parse(data);
};

export const validateCreateChecklistRequest = (data: unknown): CreateChecklistRequest => {
  return CreateChecklistRequestSchema.parse(data);
};

export const validateUpdateChecklistRequest = (data: unknown): UpdateChecklistRequest => {
  return UpdateChecklistRequestSchema.parse(data);
};

export const validateTreeNode = (data: unknown): TreeNode => {
  return TreeNodeSchema.parse(data);
};

export const validateCreateAssemblyRequest = (data: unknown): CreateAssemblyRequest => {
  return CreateAssemblyRequestSchema.parse(data);
};

export const validateCreatePartRequest = (data: unknown): CreatePartRequest => {
  return CreatePartRequestSchema.parse(data);
};

export const validateUpdateTreeNodeRequest = (data: unknown): UpdateTreeNodeRequest => {
  return UpdateTreeNodeRequestSchema.parse(data);
};

export const validateDeleteTreeNodeRequest = (data: unknown): DeleteTreeNodeRequest => {
  return DeleteTreeNodeRequestSchema.parse(data);
};

export const validateFileUpload = (data: unknown): FileUploadRequest => {
  return FileUploadSchema.parse(data);
}; 