require('@testing-library/jest-dom');
const { act } = require('react');

// React act 경고 해결
global.act = act;

// Mock fetch
global.fetch = jest.fn();

// Mock NextAuth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: {
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        permissions: ['checklist:read', 'checklist:write'],
      },
      accessToken: 'test-access-token',
    },
    status: 'authenticated',
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
  getSession: jest.fn(),
}));

// react-hot-toast 모킹: named, default, 직접 import 모두 지원
jest.mock('react-hot-toast', () => {
  const mockToast = {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
  };
  return {
    __esModule: true,
    toast: mockToast,      // named import
    default: mockToast,   // default import
    success: mockToast.success, // 직접 import
    error: mockToast.error,
    loading: mockToast.loading,
  };
});

// Mock XLSX
jest.mock('xlsx', () => ({
  utils: {
    json_to_sheet: jest.fn(),
    book_new: jest.fn(),
    book_append_sheet: jest.fn(),
  },
  writeFile: jest.fn(),
}));

// Console error 무시 (테스트 중 불필요한 경고 숨김)
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is deprecated')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
}); 