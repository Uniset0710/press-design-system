export interface User {
  id: number;
  username: string;
  role: 'admin' | 'user';
}

export interface TreeNode {
  id: number;
  name: string;
  type: 'press' | 'assembly' | 'part';
  children?: TreeNode[];
}

export interface ChecklistItem {
  id: number;
  partId: number;
  optionType: string;
  description: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
} 