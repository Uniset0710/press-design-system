# Components Documentation

이 문서는 press-design-system의 주요 컴포넌트들의 사용법과 API를 설명합니다.

## 📁 Directory Structure

```
components/
├── checklist/           # 체크리스트 관련 컴포넌트
│   ├── ChecklistTable.tsx
│   ├── ChecklistRow.tsx
│   ├── ChecklistFilterBar.tsx
│   ├── ChecklistInputForm.tsx
│   ├── ChecklistTableContainer.tsx
│   ├── EditForm.tsx
│   ├── ItemToolbar.tsx
│   ├── TextWithAttachments.tsx
│   └── __tests__/      # 테스트 파일들
├── tree/               # 트리 뷰 관련 컴포넌트
│   └── TreeView.tsx
├── modal/              # 모달 관련 컴포넌트
│   └── ChecklistItemModal.tsx
├── common/             # 공통 컴포넌트
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Textarea.tsx
│   ├── Select.tsx
│   ├── Modal.tsx
│   ├── Alert.tsx
│   ├── Loading.tsx
│   ├── Tooltip.tsx
│   └── __tests__/      # 테스트 파일들
├── ChecklistAttachments.tsx
├── ChecklistContent.tsx
└── README.md           # 이 파일
```

## 🧩 Components

### ChecklistTable

체크리스트 아이템들을 테이블 형태로 표시하는 컴포넌트입니다.

#### Props

```typescript
interface ChecklistTableProps {
  items: ChecklistItem[];           // 표시할 아이템 배열
  sectionTitle: string;             // 섹션 제목
  sortState?: {                     // 정렬 상태 (선택사항)
    column: 'author' | 'dueDate' | 'category' | 'priority' | null;
    order: 'asc' | 'desc';
  };
  onSort: (sectionTitle: string, column: 'author' | 'dueDate' | 'category' | 'priority') => void;
  onItemClick: (item: ChecklistItem) => void;
}
```

#### 사용 예시

```tsx
import ChecklistTable from '@/components/checklist/ChecklistTable';

const MyComponent = () => {
  const items = [
    {
      id: '1',
      text: '작업 1',
      author: 'John Doe',
      dueDate: '2024-01-15',
      // ... 기타 속성들
    }
  ];

  const handleSort = (sectionTitle: string, column: string) => {
    // 정렬 로직
  };

  const handleItemClick = (item: ChecklistItem) => {
    // 아이템 클릭 처리
  };

  return (
    <ChecklistTable
      items={items}
      sectionTitle="My Section"
      onSort={handleSort}
      onItemClick={handleItemClick}
    />
  );
};
```

### ChecklistRow

체크리스트 테이블의 개별 행을 렌더링하는 컴포넌트입니다.

#### Props

```typescript
interface ChecklistRowProps {
  item: ChecklistItem;
  onClick: () => void;
}
```

#### 사용 예시

```tsx
import ChecklistRow from '@/components/checklist/ChecklistRow';

const MyTable = () => {
  return (
    <table>
      <tbody>
        <ChecklistRow 
          item={checklistItem} 
          onClick={() => handleClick(item)} 
        />
      </tbody>
    </table>
  );
};
```

### ChecklistFilterBar

체크리스트 아이템들을 필터링하는 컴포넌트입니다.

#### Props

```typescript
interface ChecklistFilterBarProps {
  sectionTitle: string;
  filterValue: string;
  advFilter: {
    author: string;
    startDate: string;
    endDate: string;
    category: string;
    priority: string;
  };
  authors: string[];
  onFilterChange: (value: string) => void;
  onAdvancedFilterChange: (filter: AdvancedFilter) => void;
}
```

#### 사용 예시

```tsx
import ChecklistFilterBar from '@/components/checklist/ChecklistFilterBar';

const MyFilter = () => {
  const [filterValue, setFilterValue] = useState('');
  const [advFilter, setAdvFilter] = useState({
    author: '',
    startDate: '',
    endDate: '',
    category: '',
    priority: ''
  });

  return (
    <ChecklistFilterBar
      sectionTitle="My Section"
      filterValue={filterValue}
      advFilter={advFilter}
      authors={['John Doe', 'Jane Smith']}
      onFilterChange={setFilterValue}
      onAdvancedFilterChange={setAdvFilter}
    />
  );
};
```

### ChecklistItemModal

체크리스트 항목의 상세 정보를 모달로 표시하고 편집하는 컴포넌트입니다.

#### Props

```typescript
interface ChecklistItemModalProps {
  modalItem: ChecklistItem | null;
  modalEditMode: boolean;
  imagePreview: string | null;
  onClose: () => void;
  onEditModeToggle: () => void;
  onSave: () => void;
  onDelete: () => void;
  onItemChange: (item: ChecklistItem) => void;
  onFileUpload: (file: File) => void;
  onDeleteAttachment: (attachmentId: string) => void;
  onImagePreview: (url: string) => void;
  onImagePreviewClose: () => void;
  isAdmin?: boolean;
}
```

#### 사용 예시

```tsx
import ChecklistItemModal from '@/components/modal/ChecklistItemModal';

const MyModal = () => {
  const [modalItem, setModalItem] = useState<ChecklistItem | null>(null);
  const [modalEditMode, setModalEditMode] = useState(false);

  return (
    <ChecklistItemModal
      modalItem={modalItem}
      modalEditMode={modalEditMode}
      imagePreview={null}
      onClose={() => setModalItem(null)}
      onEditModeToggle={() => setModalEditMode(!modalEditMode)}
      onSave={handleSave}
      onDelete={handleDelete}
      onItemChange={setModalItem}
      onFileUpload={handleFileUpload}
      onDeleteAttachment={handleDeleteAttachment}
      onImagePreview={setImagePreview}
      onImagePreviewClose={() => setImagePreview(null)}
      isAdmin={isAdmin}
    />
  );
};
```

### TreeView

트리 구조의 데이터를 표시하는 컴포넌트입니다.

#### Props

```typescript
interface TreeViewProps {
  data: PressNode[];
  selectedPart: Part | null;
  onSelectPart: (part: Part) => void;
  onAddAssembly?: (parentId: string, name: string) => void;
  onAddPart?: (assemblyId: string, name: string) => void;
  onEditPart?: (partId: string, name: string) => void;
  onEditAssembly?: (assemblyId: string, name: string) => void;
  onDelete?: (id: string) => void;
  onReorder?: (dragId: string, dropId: string) => void;
  onToggleNode?: (id: string) => void;
  onToggleAssembly?: (id: string) => void;
  onSetAssemblyExpanded?: (expanded: Record<string, boolean>) => void;
  onSetNewPartName?: (name: string) => void;
  onSetSelectedAssemblyId?: (id: string) => void;
  onSetNewAssemblyName?: (name: string) => void;
  onSetSearchTerm?: (term: string) => void;
  onSetIsEditMode?: (mode: boolean) => void;
  onSetSidebarWidth?: (width: number) => void;
  newPartName: string;
  selectedAssemblyId: string;
  newAssemblyName: string;
  sidebarWidth: number;
  searchTerm: string;
  isEditMode: boolean;
  assemblyExpanded: Record<string, boolean>;
  isAdmin?: boolean;
}
```

### Common Components

#### Button

```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  'aria-label'?: string;
}
```

#### Input

```typescript
interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'date';
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  'aria-label'?: string;
  'aria-describedby'?: string;
}
```

#### Textarea

```typescript
interface TextareaProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  required?: boolean;
  autoFocus?: boolean;
  'aria-label'?: string;
  'aria-describedby'?: string;
}
```

#### Select

```typescript
interface SelectProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  'aria-label'?: string;
  'aria-describedby'?: string;
}
```

#### Modal

```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  'aria-label'?: string;
  'aria-describedby'?: string;
}
```

## 🎯 주요 변경사항

### ✅ 완료된 작업
- 중복 컴포넌트 제거 (`ChecklistItem.tsx`, `ChecklistItemComponent.tsx`)
- 실제 사용 중인 컴포넌트들만 유지
- 모든 테스트 통과 (233개 테스트)
- 접근성 속성 추가
- 반응형 디자인 적용

### 📋 현재 사용 중인 컴포넌트
- **체크리스트 편집**: `ChecklistItemModal` (모달 형태)
- **테이블 표시**: `ChecklistTable`, `ChecklistRow`
- **필터링**: `ChecklistFilterBar`
- **입력 폼**: `ChecklistInputForm`
- **공통 컴포넌트**: `Button`, `Input`, `Textarea`, `Select`, `Modal`, `Alert`, `Loading`, `Tooltip`

## 🚀 사용 가이드

### 체크리스트 편집 기능
현재 체크리스트 편집은 `ChecklistItemModal`을 통해 모달 형태로 제공됩니다:

1. **테이블에서 항목 클릭** → 모달 열림
2. **"수정" 버튼 클릭** → 편집 모드 활성화
3. **내용 편집** → 폼 필드들 편집
4. **"저장" 버튼 클릭** → 변경사항 저장

### 접근성
모든 컴포넌트는 WCAG 2.1 AA 기준을 준수하며 다음 기능을 제공합니다:
- 키보드 내비게이션 지원
- ARIA 속성 추가
- 스크린 리더 지원
- 포커스 관리

### 반응형 디자인
모든 컴포넌트는 모바일/태블릿/데스크탑에서 사용 가능하도록 설계되었습니다.

---

**마지막 업데이트**: 2024년 12월
**버전**: 2.0.0
**상태**: 중복 컴포넌트 제거 완료 ✅ 