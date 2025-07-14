# 📈 press-design-system 대폭 개선 가이드

## 목차
1. [프로젝트 구조/폴더링 리팩터링](#1-프로젝트-구조폴더링-리팩터링)
2. [상태 관리/비즈니스 로직 개선](#2-상태-관리비즈니스-로직-개선)
3. [UI/UX 및 스타일링 개선](#3-uiux-및-스타일링-개선)
4. [테스트/품질 관리](#4-테스트품질-관리)
5. [코드 스타일/문서화](#5-코드-스타일문서화)
6. [실전 리팩터링/설계 예시](#6-실전-리팩터링설계-예시)
7. [개선 우선순위/로드맵](#7-개선-우선순위로드맵)
8. [참고/추천 자료](#8-참고추천-자료)

---

## 1. 프로젝트 구조/폴더링 리팩터링

### 1.1. 폴더 구조 표준화
- `frontend/` → 핵심 SPA/SSR 코드만 집중
- `components/`, `hooks/`, `context/`, `types/`, `lib/` 등 역할별 디렉토리 분리
- 예시:
  ```
  frontend/
    components/
      checklist/
      tree/
      common/
    hooks/
    context/
    types/
    lib/
    pages/ (or app/)
    public/
  ```

### 1.2. 파일 크기/관심사 분리
- 300~400라인 이상 컴포넌트는 반드시 분할
- Container/Presentational 패턴 적용

---

## 2. 상태 관리/비즈니스 로직 개선

### 2.1. 전역 상태 관리 도입
- Context API, Zustand, Jotai 등 도입
- 예: 선택 파트, 모달, 필터/정렬, 트리뷰 확장상태 등

### 2.2. 커스텀 훅 적극 활용
- 복잡한 useEffect, 필터/정렬, 트리뷰 상태 등은 `useXXX` 훅으로 분리

### 2.3. API/비동기 로직 분리
- API 호출, 데이터 가공은 `lib/` 또는 `hooks/`로 분리

---

## 3. UI/UX 및 스타일링 개선

### 3.1. Tailwind 클래스 최적화
- 중복/난립 클래스 정리, 공통 스타일은 컴포넌트/클래스 추출
- 테마/반응형/접근성(aria 등) 강화

### 3.2. 테이블/트리뷰 성능 최적화
- 대용량 데이터 대응: 가상화(react-virtualized 등) 도입 고려
- 컬럼 고정폭, 가로 스크롤 방지, 반응형 레이아웃

### 3.3. 모달/알림/피드백 UX 개선
- 모달 상태 전역 관리, ESC/바깥 클릭 닫기, 포커스 트랩 등

---

## 4. 테스트/품질 관리

### 4.1. 단위 테스트
- 유틸 함수, 커스텀 훅, 상태 로직, API 함수: Jest, React Testing Library

### 4.2. 컴포넌트/통합/E2E 테스트
- 주요 UI/로직 시나리오: Cypress, Playwright

### 4.3. 자동화/CI
- PR/커밋 시 테스트 자동 실행, 커버리지 측정

---

## 5. 코드 스타일/문서화

### 5.1. 코드 스타일 통일
- Prettier, ESLint, 커밋 훅 적용
- 네이밍, 타입, 주석, 커밋 메시지 규칙 명확화

### 5.2. 문서화
- README: 프로젝트 구조, 실행법, 개발 가이드, 컨벤션, 기여 방법 등
- 주요 컴포넌트/훅/유틸: JSDoc, 예제, 타입 설명

---

## 6. 실전 리팩터링/설계 예시

### 6.1. 커스텀 훅 예시
```ts
// hooks/useChecklistFilter.ts
import { useMemo } from 'react';
export function useChecklistFilter(items, filter, sort) {
  return useMemo(() => {
    let filtered = items;
    if (filter.author) filtered = filtered.filter(...);
    // ... 기타 필터/정렬
    return filtered;
  }, [items, filter, sort]);
}
```

### 6.2. Container/Presentational 분리 예시
```tsx
// ChecklistTableContainer.tsx
const ChecklistTableContainer = () => {
  const { items, filter, sort } = useChecklistContext();
  const filteredItems = useChecklistFilter(items, filter, sort);
  return <ChecklistTable items={filteredItems} />;
};
```

### 6.3. Context/Store 예시
```ts
// context/ChecklistContext.tsx
import { createContext, useContext, useState } from 'react';
const ChecklistContext = createContext(null);
export function useChecklistContext() { return useContext(ChecklistContext); }
export function ChecklistProvider({ children }) {
  const [state, setState] = useState(...);
  return <ChecklistContext.Provider value={{ state, setState }}>{children}</ChecklistContext.Provider>;
}
```

---

## 7. 개선 우선순위/로드맵

1. **대형 컴포넌트 분할 및 폴더 구조 정비**
2. **상태 관리 개선(Context/Store/커스텀 훅)**
3. **UI/UX 리팩터링(반응형, 접근성, 성능)**
4. **테스트 코드 도입 및 자동화**
5. **문서화/코드 스타일 통일**

---

## 8. 참고/추천 자료

- [React 공식 문서](https://react.dev/)
- [Next.js 공식 문서](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [Tailwind CSS Best Practices](https://tailwindcss.com/docs/reusing-styles)

---

**이 가이드를 기반으로 리팩터링/설계/테스트/문서화 등 단계별로 실천하면  
실무에서 확장성, 유지보수성, 협업 효율이 크게 향상됩니다!** 