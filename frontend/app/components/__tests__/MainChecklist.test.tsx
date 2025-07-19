import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import MainChecklist from '../MainChecklist';
import { ChecklistItem } from '@/types/checklist';
import { Model } from '@/types/model';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

// Mock useModelOptions hook
jest.mock('@/hooks/useModelOptions', () => ({
  useModelOptions: jest.fn(),
}));

// Mock getModelFromCookies
jest.mock('@/utils/cookieUtils', () => ({
  getModelFromCookies: jest.fn(() => ({ code: 'TEST_MODEL' })),
}));

// Mock toast
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;
const mockUseModelOptions = require('@/hooks/useModelOptions').useModelOptions as jest.Mock;

describe('MainChecklist Component', () => {
  const mockSession = {
    data: {
      user: { name: 'Test User' },
      accessToken: 'mock-token',
    },
  };

  const mockPart: Model = {
    id: 1,
    name: 'Test Part',
    code: 'TEST001',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockChecklistData: Record<string, ChecklistItem[]> = {
    'Design Check List': [
      {
        id: '1',
        text: 'Test Item 1',
        author: 'Test User',
        dueDate: '2024-01-01',
        category: 'General',
        priority: 'Medium',
        completed: false,
        optionType: 'DTL',
        section: 'Design Check List',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    ],
  };

  const mockSetChecklistData = jest.fn();
  const mockSetAttachmentsCache = jest.fn();
  const mockOnFileUpload = jest.fn();
  const mockOnDeleteAttachment = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSession.mockReturnValue(mockSession as any);
    
    // Mock useModelOptions for different sections
    mockUseModelOptions
      .mockReturnValueOnce({
        options: [{ optionCode: 'DTL' }, { optionCode: 'DTE' }],
        loading: false,
      })
      .mockReturnValueOnce({
        options: [{ optionCode: 'MCL1' }, { optionCode: 'MCL2' }],
        loading: false,
      })
      .mockReturnValueOnce({
        options: [{ optionCode: 'ASM1' }, { optionCode: 'ASM2' }],
        loading: false,
      });
  });

  describe('기존 기능 보존 테스트', () => {
    it('컴포넌트가 정상적으로 렌더링되어야 함', () => {
      render(
        <MainChecklist
          selectedPart={mockPart}
          selectedPartId="1"
          checklistData={mockChecklistData}
          setChecklistData={mockSetChecklistData}
          attachmentsCache={{}}
          setAttachmentsCache={mockSetAttachmentsCache}
          onFileUpload={mockOnFileUpload}
          onDeleteAttachment={mockOnDeleteAttachment}
          isAdmin={true}
        />
      );

      expect(screen.getByText('Test Part')).toBeInTheDocument();
      expect(screen.getByText('Part ID: 1')).toBeInTheDocument();
    });

    it('섹션 탭이 정상적으로 표시되어야 함', () => {
      render(
        <MainChecklist
          selectedPart={mockPart}
          selectedPartId="1"
          checklistData={mockChecklistData}
          setChecklistData={mockSetChecklistData}
          attachmentsCache={{}}
          setAttachmentsCache={mockSetAttachmentsCache}
          onFileUpload={mockOnFileUpload}
          onDeleteAttachment={mockOnDeleteAttachment}
          isAdmin={true}
        />
      );

      // getAllByText를 사용하여 중복 요소 처리
      expect(screen.getAllByText('Design Check List')).toHaveLength(2); // select option + button
      expect(screen.getByText('Machining Check List')).toBeInTheDocument();
      expect(screen.getByText('Assembly Check List')).toBeInTheDocument();
    });

    it('입력 폼이 정상적으로 표시되어야 함', () => {
      render(
        <MainChecklist
          selectedPart={mockPart}
          selectedPartId="1"
          checklistData={mockChecklistData}
          setChecklistData={mockSetChecklistData}
          attachmentsCache={{}}
          setAttachmentsCache={mockSetAttachmentsCache}
          onFileUpload={mockOnFileUpload}
          onDeleteAttachment={mockOnDeleteAttachment}
          isAdmin={true}
        />
      );

      expect(screen.getByLabelText('섹션을 선택하세요')).toBeInTheDocument();
      expect(screen.getByLabelText('체크리스트 항목 내용을 입력하세요')).toBeInTheDocument();
      expect(screen.getByLabelText('담당자 이름을 입력하세요')).toBeInTheDocument();
    });
  });

  describe('섹션별 옵션 로딩 테스트', () => {
    it('Design Check List 섹션의 옵션이 정상적으로 로드되어야 함', () => {
      render(
        <MainChecklist
          selectedPart={mockPart}
          selectedPartId="1"
          checklistData={mockChecklistData}
          setChecklistData={mockSetChecklistData}
          attachmentsCache={{}}
          setAttachmentsCache={mockSetAttachmentsCache}
          onFileUpload={mockOnFileUpload}
          onDeleteAttachment={mockOnDeleteAttachment}
          isAdmin={true}
        />
      );

      expect(mockUseModelOptions).toHaveBeenCalledWith('TEST_MODEL', 'Design Check List');
      expect(mockUseModelOptions).toHaveBeenCalledWith('TEST_MODEL', 'Machining Check List');
      expect(mockUseModelOptions).toHaveBeenCalledWith('TEST_MODEL', 'Assembly Check List');
    });
  });

  describe('기존 데이터 구조 보존 테스트', () => {
    it('기존 checklistData 구조가 유지되어야 함', () => {
      const { rerender } = render(
        <MainChecklist
          selectedPart={mockPart}
          selectedPartId="1"
          checklistData={mockChecklistData}
          setChecklistData={mockSetChecklistData}
          attachmentsCache={{}}
          setAttachmentsCache={mockSetAttachmentsCache}
          onFileUpload={mockOnFileUpload}
          onDeleteAttachment={mockOnDeleteAttachment}
          isAdmin={true}
        />
      );

      // 컴포넌트가 정상적으로 렌더링되는지 확인
      expect(screen.getAllByText('Test Item 1')).toHaveLength(2); // 중복 요소 처리

      // 데이터 구조가 변경되지 않았는지 확인
      expect(mockSetChecklistData).not.toHaveBeenCalled();
    });
  });
}); 