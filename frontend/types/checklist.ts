export interface AttachmentData {
  id: string; // DB ID 또는 'temp-{uuid}'
  checklistItemId: string;
  filename: string;
  mimeType: string;
  /** 서버가 주는 정식 URL (예: /uploads/123.png) */
  url: string;
  /** temp 단계에서만 쓰는 data:image/... */
  uri?: string;
  size?: number; // 파일 크기 (bytes)
  createdAt?: string; // 생성일시
  isTemp?: true; // 업로드 중 표시용
}

export interface ChecklistItem {
  id: string;
  text: string;
  section: string;
  partId: number;
  optionType: string;
  description: string;
  attachments: AttachmentData[]; // 필수 필드, 빈 배열 기본값
  model?: string; // 체크리스트 항목이 속한 모델
}

export type ChecklistData = Record<string, ChecklistItem[]>;

// API 응답 타입
export interface AttachmentResponse {
  id: string;
  url: string;
  checklistItemId: string;
  filename: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

// 사용자 타입 정의
export interface User {
  id: number;
  username: string;
  role: 'admin' | 'user';
  model?: string;
}

// 커스텀 에러 클래스
export class NetworkError extends Error {
  constructor(
    message: string,
    public originalError: TypeError
  ) {
    super(message);
    this.name = 'NetworkError';
  }
}
