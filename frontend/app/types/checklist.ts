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
}

export type ChecklistData = Record<string, ChecklistItem[]>; 