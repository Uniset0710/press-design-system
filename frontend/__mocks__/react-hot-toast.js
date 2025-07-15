const mockToast = {
  error: jest.fn(),
  success: jest.fn(),
  loading: jest.fn(),
  dismiss: jest.fn(),
};
module.exports = {
  __esModule: true,
  default: mockToast,
  toast: mockToast,
  error: mockToast.error,
  success: mockToast.success,
  loading: mockToast.loading,
  dismiss: mockToast.dismiss,
  Toaster: jest.fn(() => null),
}; 