require('@testing-library/jest-dom');

// React 19 호환성을 위한 설정
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// React Testing Library 설정
global.TextEncoder = require('util').TextEncoder;
global.TextDecoder = require('util').TextDecoder; 