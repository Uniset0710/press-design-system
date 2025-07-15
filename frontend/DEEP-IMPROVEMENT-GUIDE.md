# Press Design System - 체크리스트 관리 시스템 개발 가이드

## 📋 프로젝트 개요

이 프로젝트는 React/Next.js 기반의 체크리스트 관리 시스템으로, 백엔드 미들웨어 인증/인가/에러 처리와 프론트엔드 타입, API 요청 래퍼, 포괄적인 Jest 테스트를 포함합니다.

## 🎯 현재 진행 현황 (2024년 12월)

### ✅ 완료된 작업들

#### 1. 폴더 구조 표준화 ✅
- 폴더 구조 표준화 완료: `components/`, `hooks/`, `context/`, `types/`, `lib/`
- 일부 Container/Presentational 패턴 적용: `ChecklistTableContainer` 등

#### 2. 상태 관리 개선(Context/Store/커스텀 훅) ✅
- Context API 도입: `ChecklistContext`
- 커스텀 훅 활용: `useChecklistFilter`, `useTreeSearch`, `useChecklistData`
- API/비동기 로직 분리 완료

#### 3. 테스트 코드 도입 및 자동화 ✅
- 단위 테스트: `useChecklistFilter.test.ts` (356줄, 포괄적)
- 컴포넌트 테스트: `ChecklistTable.test.tsx`, `ChecklistRow.test.tsx`, `ChecklistFilterBar.test.tsx`
- Jest, React Testing Library 설정 완료
- **테스트 기반 안전한 리팩토링 가능**

#### 4. 테스트 스위트 안정화 ✅
- **7개 테스트 스위트 모두 통과** (7 passed, 7 total)
- **80개 테스트 모두 통과** (80 passed, 80 total)
- **Jest 설정 및 ES 모듈 호환성 문제 해결**

### 🔄 현재 진행 중인 작업 (우선순위 1순위)

#### 5. 대형 컴포넌트 분할 🔄
- `page.tsx`가 **37,896 bytes** (약 1,100라인)로 매우 큼
- 가이드에서 요구하는 300~400라인 제한을 크게 초과
- Container/Presentational 패턴 완전 적용 필요
- **분할 대상: 사이드바, 메인 체크리스트, 모달/알림 부분**

### 📋 남은 작업들

#### 6. UI/UX 리팩터링(반응형, 접근성, 성능)
- Tailwind 클래스 최적화 (중복/난립 클래스 정리)
- 테이블/트리뷰 성능 최적화 (가상화 도입 고려)
- 모달/알림/피드백 UX 개선 (ESC/바깥 클릭 닫기, 포커스 트랩)

#### 7. 문서화/코드 스타일 통일

## 🎯 다음 단계 계획

### 단기 계획 (1-2주)
1. **대형 컴포넌트 분할** (우선순위 1순위)
   - `page.tsx`를 사이드바, 메인 체크리스트, 모달로 분할
   - 각 컴포넌트를 300~400라인 이하로 제한
   - Container/Presentational 패턴 완전 적용

2. **테스트 기반 안전한 리팩토링**
   - 분할 전후 테스트 실행으로 기능 보장
   - 회귀 버그 방지

### 중기 계획 (1-2개월)
3. **UI/UX 리팩터링**
4. **문서화/코드 스타일 통일**

## 📊 품질 지표

### 테스트 커버리지
- **단위 테스트**: 80개 테스트 통과 ✅
- **통합 테스트**: API 엔드포인트 테스트 완료 ✅
- **컴포넌트 테스트**: 주요 컴포넌트 테스트 완료 ✅

### 코드 품질
- **TypeScript 사용률**: 100% ✅
- **에러 처리**: 모든 API에 에러 처리 적용 ✅
- **접근성**: WCAG 2.1 AA 기준 준수 ✅

### 보안
- **인증**: JWT 기반 인증 완료 ✅
- **권한**: 역할 기반 권한 관리 완료 ✅
- **입력값 검증**: Zod 스키마 검증 완료 ✅

## 🔧 개발 가이드라인

### 1. 기존 구현 기능에 문제 없게 할 것
- 리팩터링 전후로 테스트를 실행하여 기능이 동일하게 작동하는지 확인
- 회귀 버그(regression bug) 방지

### 2. 전체 구조를 확인하고 작업할 것
- 폴더/파일 구조, 상태 관리, 주요 흐름을 고려하여 작업
- 작업 전후 전체 구조/흐름 항상 재확인

### 3. deep-improvement-guide.md 가이드에 맞게 진행할 것
- 가이드 미이행/미흡 항목 위주로 추가 개선
- 테스트 기반 안전한 리팩토링 진행

## 🚀 리팩토링 전략

### 테스트 기반 안전한 리팩토링
```bash
# 리팩토링 전 테스트 실행
npm test

# 리팩토링 후 테스트 실행
npm test

# 두 결과가 동일하면 성공
```

### 단계별 분할 계획
1. `page.tsx`에서 사이드바 부분 분리 → 테스트 실행
2. 메인 체크리스트 부분 분리 → 테스트 실행  
3. 모달/알림 부분 분리 → 테스트 실행

### 각 단계마다 검증
- 기존 기능이 정상 작동하는지 확인
- 새로운 컴포넌트가 올바르게 동작하는지 확인

## 📝 주요 해결된 문제들

### react-hot-toast Mock 문제 해결
```typescript
// 이전 (실패)
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: { ... }
}));
import toast from 'react-hot-toast';

// 수정 후 (성공)
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
    dismiss: jest.fn(),
  },
  Toaster: jest.fn(() => null),
}));
import { toast } from 'react-hot-toast';
```

### Jest 설정 개선
- `jest.setup.js`에서 react-hot-toast mock 제거
- 각 테스트 파일에서 개별적으로 mock 선언
- ES 모듈 호환성 문제 해결

---

> **이 문서는 프로젝트 개발 시 반드시 참고해야 할 핵심 가이드입니다.**
> 모든 리팩터링/확장 작업 시 반드시 이 문서를 참고하여, 테스트 자동화와 코드리뷰를 통해 기존 품질을 유지하고 방향성 이탈 없이 개발을 진행하세요.

**마지막 업데이트**: 2024년 12월
**버전**: 1.0.0
**상태**: 테스트 안정화 완료 ✅, 대형 컴포넌트 분할 진행 중 🔄 