import DOMPurify from 'dompurify';

// XSS 방어를 위한 HTML 정리
export const sanitizeHtml = (dirty: string): string => {
  if (typeof window !== 'undefined') {
    return DOMPurify.sanitize(dirty);
  }
  // 서버 사이드에서는 기본 정리만 수행
  return dirty.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
};

// 입력값 검증 및 정리
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  // 스크립트 태그 제거
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  // 모든 태그 제거
  sanitized = sanitized.replace(/<[^>]*>/g, '');
  // 특수문자 이스케이프 (순서 중요: & -> < -> > -> " -> ' -> /)
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
  sanitized = sanitized.trim();
  return sanitized;
};

// 이메일 검증
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// 비밀번호 강도 검증
export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('비밀번호는 최소 8자 이상이어야 합니다.');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('대문자가 포함되어야 합니다.');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('소문자가 포함되어야 합니다.');
  }
  
  if (!/\d/.test(password)) {
    errors.push('숫자가 포함되어야 합니다.');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('특수문자가 포함되어야 합니다.');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// 파일 업로드 검증
export const validateFileUpload = (file: File): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  
  if (file.size > maxSize) {
    errors.push('파일 크기는 10MB 이하여야 합니다.');
  }
  
  if (!allowedTypes.includes(file.type)) {
    errors.push('지원하지 않는 파일 형식입니다.');
  }
  
  // 파일명 검증
  const fileName = file.name;
  if (fileName.length > 255) {
    errors.push('파일명이 너무 깁니다.');
  }
  
  if (!/^[a-zA-Z0-9가-힣\s\-_\.]+$/.test(fileName)) {
    errors.push('파일명에 특수문자가 포함되어 있습니다.');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// SQL Injection 방어를 위한 문자열 검증
export const validateSqlInjection = (input: string): boolean => {
  const sqlKeywords = [
    'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE', 'ALTER',
    'UNION', 'OR', 'AND', 'EXEC', 'EXECUTE', 'SCRIPT', 'VBSCRIPT'
  ];
  
  const upperInput = input.toUpperCase();
  // 정확한 키워드 매칭만 체크
  return !sqlKeywords.some(keyword => 
    upperInput.includes(keyword) && 
    (upperInput.includes(` ${keyword} `) || 
     upperInput.startsWith(keyword) || 
     upperInput.endsWith(keyword))
  );
};

// CSRF 토큰 생성
export const generateCsrfToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// CSRF 토큰 검증
export const validateCsrfToken = (token: string, storedToken: string): boolean => {
  return token === storedToken;
};

// Rate Limiting을 위한 간단한 구현
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private maxRequests: number;
  private windowMs: number;
  
  constructor(maxRequests: number = 100, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }
  
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const userRequests = this.requests.get(identifier) || [];
    
    // 오래된 요청 제거
    const recentRequests = userRequests.filter(time => now - time < this.windowMs);
    
    if (recentRequests.length >= this.maxRequests) {
      return false;
    }
    
    recentRequests.push(now);
    this.requests.set(identifier, recentRequests);
    return true;
  }
  
  reset(identifier: string): void {
    this.requests.delete(identifier);
  }
}

// 보안 헤더 설정
export const getSecurityHeaders = (): Record<string, string> => {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
  };
};

// 로깅을 위한 보안 이벤트 추적
export const logSecurityEvent = (
  event: string,
  details: Record<string, any>,
  severity: 'low' | 'medium' | 'high' = 'low'
): void => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    details,
    severity,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
    ip: 'client-ip' // 실제로는 서버에서 IP를 가져와야 함
  };
  
  console.log('Security Event:', logEntry);
  
  // 실제 프로덕션에서는 보안 로그 서비스로 전송
  if (severity === 'high') {
    // 높은 심각도의 이벤트는 즉시 알림
    console.error('HIGH SECURITY ALERT:', logEntry);
  }
};

// 입력값 길이 제한
export const truncateInput = (input: string, maxLength: number): string => {
  if (!input) return '';
  return input.length > maxLength ? input.substring(0, maxLength) : input;
};

// 파일 확장자 검증
export const validateFileExtension = (filename: string, allowedExtensions: string[]): boolean => {
  const extension = filename.split('.').pop()?.toLowerCase();
  return extension ? allowedExtensions.includes(extension) : false;
};

// URL 검증
export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// 민감한 정보 마스킹
export const maskSensitiveData = (data: string, type: 'email' | 'phone' | 'creditCard'): string => {
  switch (type) {
    case 'email':
      const [local, domain] = data.split('@');
      return `${local.charAt(0)}***@${domain}`;
    case 'phone':
      return data.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
    case 'creditCard':
      return data.replace(/(\d{4})\d{8}(\d{4})/, '$1********$2');
    default:
      return data;
  }
}; 