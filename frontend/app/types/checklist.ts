export interface AttachmentData {
  id: string;
  checklistItemId: string;
  filename: string;
  mimeType: string;
  url?: string;
  uri?: string;
  isTemp?: boolean;
  createdAt?: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  section: string;
  partId: number;
  optionType: string;
  description: string;
  attachments?: AttachmentData[];
  createdAt?: string;
  updatedAt?: string;
  author?: string;
  dueDate?: string;
  category?: string;
  priority?: string;
  completed?: boolean;
  options?: string[]; // 옵션 필터링을 위한 필드 추가
}

export type ChecklistData = Record<string, ChecklistItem[]>; 