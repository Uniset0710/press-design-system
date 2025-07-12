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
│   └── __tests__/      # 테스트 파일들
├── tree/               # 트리 뷰 관련 컴포넌트
│   └── TreeView.tsx
├── modal/              # 모달 관련 컴포넌트
├── common/             # 공통 컴포넌트
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

### TreeView

트리 구조의 데이터를 표시하는 컴포넌트입니다.

#### Props

```typescript
interface TreeViewProps {
  data: TreeNode[];
  openNodes: Set<string>;
  openAssemblies: Set<string>;
  onNodeToggle: (nodeId: string) => void;
  onAssemblyToggle: (assemblyId: string) => void;
  onNodeClick: (node: TreeNode) => void;
  searchTerm?: string;
}
```

#### 사용 예시

```tsx
import TreeView from '@/components/tree/TreeView';

const MyTreeView = () => {
  const [openNodes, setOpenNodes] = useState(new Set());
  const [openAssemblies, setOpenAssemblies] = useState(new Set());

  const handleNodeToggle = (nodeId: string) => {
    const newOpenNodes = new Set(openNodes);
    if (newOpenNodes.has(nodeId)) {
      newOpenNodes.delete(nodeId);
    } else {
      newOpenNodes.add(nodeId);
    }
    setOpenNodes(newOpenNodes);
  };

  return (
    <TreeView
      data={treeData}
      openNodes={openNodes}
      openAssemblies={openAssemblies}
      onNodeToggle={handleNodeToggle}
      onAssemblyToggle={handleAssemblyToggle}
      onNodeClick={handleNodeClick}
    />
  );
};
```

## 🧪 Testing

모든 주요 컴포넌트는 단위 테스트가 작성되어 있습니다.

### 테스트 실행

```bash
# 전체 테스트 실행
npm test

# Checklist 관련 테스트만 실행
npm test -- --testPathPatterns="checklist"

# TreeView 테스트만 실행
npm test -- --testPathPatterns="TreeView"
```

### 테스트 커버리지

- ✅ ChecklistTable: 렌더링, 정렬, 클릭 이벤트
- ✅ ChecklistRow: 데이터 표시, 클릭 이벤트, 첨부파일 표시
- ✅ ChecklistFilterBar: 필터 입력, 드롭다운 선택, 이벤트 핸들링
- ✅ TreeView: 노드 토글, 검색, 클릭 이벤트

## 🎨 Styling

모든 컴포넌트는 Tailwind CSS를 사용하여 스타일링되어 있습니다.

### 주요 스타일 클래스

- **테이블**: `w-full text-sm border-collapse`
- **행**: `bg-white cursor-pointer hover:bg-blue-50`
- **헤더**: `bg-blue-100`
- **필터**: `p-1 border rounded`

## 🔧 Development

### 컴포넌트 추가 시 체크리스트

1. **타입 정의**: TypeScript 인터페이스 작성
2. **Props 검증**: 필수/선택 props 명확히 구분
3. **테스트 작성**: 렌더링, 이벤트, 엣지 케이스 테스트
4. **문서화**: 사용법과 예시 코드 작성
5. **스타일링**: Tailwind CSS 클래스 적용

### 코드 품질 기준

- ✅ TypeScript 사용
- ✅ 단위 테스트 작성
- ✅ Props 인터페이스 정의
- ✅ 에러 핸들링
- ✅ 접근성 고려
- ✅ 반응형 디자인

## 📝 Notes

- 모든 컴포넌트는 Context API를 통해 상태를 관리합니다
- 첨부파일 기능은 별도 컴포넌트로 분리되어 있습니다
- 필터링과 정렬은 커스텀 훅으로 관리됩니다
- 트리 뷰의 확장/축소 상태는 상위 컴포넌트에서 관리됩니다 