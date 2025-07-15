import { renderHook, waitFor } from '@testing-library/react';
import { useChecklistData } from '../useChecklistData';
import { checklistApiRequest } from '../../utils/errorHandler';

// Mock the checklistApiRequest function
jest.mock('../../utils/errorHandler', () => ({
  checklistApiRequest: jest.fn(),
}));

const mockChecklistApiRequest = checklistApiRequest as jest.MockedFunction<typeof checklistApiRequest>;

describe('useChecklistData with modelId', () => {
  const mockSession = {
    accessToken: 'test-token',
    user: { name: 'Test User' }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch checklist data with modelId when provided', async () => {
    const mockData = {
      DTL: [{ id: '1', text: 'Test item', section: 'Design Check List' }],
      DTE: []
    };

    mockChecklistApiRequest.mockResolvedValue(mockData);

    const { result } = renderHook(() => 
      useChecklistData('123', mockSession, 'model-1')
    );

    await waitFor(() => {
      expect(result.current.checklistData['Design Check List']).toHaveLength(1);
    });
    expect(result.current.checklistData['Design Check List'][0]).toEqual({
      id: '1',
      text: 'Test item',
      section: 'Design Check List',
      optionType: 'DTL',
    });
  });

  it('should fetch checklist data without modelId when not provided', async () => {
    const mockData = {
      DTL: [{ id: '1', text: 'Test item', section: 'Design Check List' }],
      DTE: []
    };

    mockChecklistApiRequest.mockResolvedValue(mockData);

    const { result } = renderHook(() => 
      useChecklistData('123', mockSession)
    );

    await waitFor(() => {
      expect(mockChecklistApiRequest).toHaveBeenCalledWith(
        '/api/checklist/123',
        undefined,
        expect.objectContaining({
          headers: { Authorization: 'Bearer test-token' }
        }),
        mockSession
      );
    });
  });

  it('should use different cache keys for different modelIds', async () => {
    const mockData1 = { DTL: [{ id: '1', text: 'Item 1', section: 'Design Check List' }] };
    const mockData2 = { DTL: [{ id: '2', text: 'Item 2', section: 'Design Check List' }] };

    mockChecklistApiRequest
      .mockResolvedValueOnce(mockData1)
      .mockResolvedValueOnce(mockData2);

    const { result: result1 } = renderHook(() => 
      useChecklistData('123', mockSession, 'model-1')
    );

    const { result: result2 } = renderHook(() => 
      useChecklistData('123', mockSession, 'model-2')
    );

    await waitFor(() => {
      expect(result1.current.checklistData['Design Check List']).toHaveLength(1);
      expect(result2.current.checklistData['Design Check List']).toHaveLength(1);
    });

    expect(result1.current.checklistData['Design Check List'][0].text).toBe('Item 1');
    expect(result2.current.checklistData['Design Check List'][0].text).toBe('Item 2');
  });

  it('should handle API errors gracefully', async () => {
    mockChecklistApiRequest.mockRejectedValue(new Error('API Error'));

    const { result } = renderHook(() => 
      useChecklistData('123', mockSession, 'model-1')
    );

    await waitFor(() => {
      expect(result.current.checklistData).toEqual({
        'Design Check List': [],
        'Machining Check List': [],
        'Assembly Check List': []
      });
    });
  });
}); 