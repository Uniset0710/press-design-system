import {
  sanitizeInput,
  validateEmail,
  validatePassword,
  validateFileUpload,
  validateSqlInjection,
  generateCsrfToken,
  validateCsrfToken,
  RateLimiter,
  truncateInput,
  validateFileExtension,
  validateUrl,
  maskSensitiveData
} from '../security';

describe('Security Utils', () => {
  describe('sanitizeInput', () => {
    it('removes HTML tags', () => {
      const input = '<script>alert("xss")</script>Hello World';
      const result = sanitizeInput(input);
      expect(result).toBe('Hello World');
    });

    it('escapes special characters', () => {
      const input = '<>&"\'/';
      const result = sanitizeInput(input);
      expect(result).toBe('&amp;&quot;&#x27;&#x2F;');
    });

    it('trims whitespace', () => {
      const input = '  Hello World  ';
      const result = sanitizeInput(input);
      expect(result).toBe('Hello World');
    });

    it('handles empty input', () => {
      expect(sanitizeInput('')).toBe('');
      expect(sanitizeInput(null as any)).toBe('');
    });
  });

  describe('validateEmail', () => {
    it('validates correct email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
    });

    it('rejects invalid email addresses', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('validates strong passwords', () => {
      const result = validatePassword('StrongPass123!');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('rejects weak passwords', () => {
      const result = validatePassword('weak');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('checks for required password criteria', () => {
      const result = validatePassword('password');
      expect(result.errors).toContain('대문자가 포함되어야 합니다.');
      expect(result.errors).toContain('숫자가 포함되어야 합니다.');
      expect(result.errors).toContain('특수문자가 포함되어야 합니다.');
    });
  });

  describe('validateFileUpload', () => {
    it('validates acceptable files', () => {
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      const result = validateFileUpload(file);
      expect(result.isValid).toBe(true);
    });

    it('rejects files that are too large', () => {
      const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.pdf', { type: 'application/pdf' });
      const result = validateFileUpload(largeFile);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('파일 크기는 10MB 이하여야 합니다.');
    });

    it('rejects unsupported file types', () => {
      const file = new File(['test'], 'test.exe', { type: 'application/x-msdownload' });
      const result = validateFileUpload(file);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('지원하지 않는 파일 형식입니다.');
    });

    it('validates filename characters', () => {
      const file = new File(['test'], 'test<script>.pdf', { type: 'application/pdf' });
      const result = validateFileUpload(file);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('파일명에 특수문자가 포함되어 있습니다.');
    });
  });

  describe('validateSqlInjection', () => {
    it('allows normal input', () => {
      expect(validateSqlInjection('Hello World')).toBe(true);
      expect(validateSqlInjection('user@example.com')).toBe(true);
    });

    it('detects SQL injection attempts', () => {
      expect(validateSqlInjection('SELECT * FROM users')).toBe(false);
      expect(validateSqlInjection('DROP TABLE users')).toBe(false);
      expect(validateSqlInjection('1 OR 1=1')).toBe(false);
    });
  });

  describe('CSRF Token', () => {
    it('generates unique tokens', () => {
      const token1 = generateCsrfToken();
      const token2 = generateCsrfToken();
      expect(token1).not.toBe(token2);
      expect(token1.length).toBe(64);
    });

    it('validates correct tokens', () => {
      const token = generateCsrfToken();
      expect(validateCsrfToken(token, token)).toBe(true);
    });

    it('rejects incorrect tokens', () => {
      const token1 = generateCsrfToken();
      const token2 = generateCsrfToken();
      expect(validateCsrfToken(token1, token2)).toBe(false);
    });
  });

  describe('RateLimiter', () => {
    let rateLimiter: RateLimiter;

    beforeEach(() => {
      rateLimiter = new RateLimiter(2, 1000); // 2 requests per second
    });

    it('allows requests within limit', () => {
      expect(rateLimiter.isAllowed('user1')).toBe(true);
      expect(rateLimiter.isAllowed('user1')).toBe(true);
    });

    it('blocks requests over limit', () => {
      expect(rateLimiter.isAllowed('user1')).toBe(true);
      expect(rateLimiter.isAllowed('user1')).toBe(true);
      expect(rateLimiter.isAllowed('user1')).toBe(false);
    });

    it('resets user limits', () => {
      expect(rateLimiter.isAllowed('user1')).toBe(true);
      rateLimiter.reset('user1');
      expect(rateLimiter.isAllowed('user1')).toBe(true);
    });

    it('tracks different users separately', () => {
      expect(rateLimiter.isAllowed('user1')).toBe(true);
      expect(rateLimiter.isAllowed('user2')).toBe(true);
      expect(rateLimiter.isAllowed('user1')).toBe(true);
      expect(rateLimiter.isAllowed('user2')).toBe(true);
    });
  });

  describe('truncateInput', () => {
    it('truncates long input', () => {
      const longInput = 'a'.repeat(100);
      const result = truncateInput(longInput, 50);
      expect(result.length).toBe(50);
      expect(result).toBe('a'.repeat(50));
    });

    it('keeps short input unchanged', () => {
      const shortInput = 'Hello World';
      const result = truncateInput(shortInput, 50);
      expect(result).toBe(shortInput);
    });

    it('handles empty input', () => {
      expect(truncateInput('', 10)).toBe('');
      expect(truncateInput(null as any, 10)).toBe('');
    });
  });

  describe('validateFileExtension', () => {
    it('validates allowed extensions', () => {
      expect(validateFileExtension('test.pdf', ['pdf', 'doc'])).toBe(true);
      expect(validateFileExtension('test.DOC', ['pdf', 'doc'])).toBe(true);
    });

    it('rejects disallowed extensions', () => {
      expect(validateFileExtension('test.exe', ['pdf', 'doc'])).toBe(false);
      expect(validateFileExtension('test', ['pdf', 'doc'])).toBe(false);
    });
  });

  describe('validateUrl', () => {
    it('validates correct URLs', () => {
      expect(validateUrl('https://example.com')).toBe(true);
      expect(validateUrl('http://localhost:3000')).toBe(true);
    });

    it('rejects invalid URLs', () => {
      expect(validateUrl('not-a-url')).toBe(false);
      expect(validateUrl('')).toBe(false);
    });
  });

  describe('maskSensitiveData', () => {
    it('masks email addresses', () => {
      expect(maskSensitiveData('user@example.com', 'email')).toBe('u***@example.com');
    });

    it('masks phone numbers', () => {
      expect(maskSensitiveData('01012345678', 'phone')).toBe('010****5678');
    });

    it('masks credit card numbers', () => {
      expect(maskSensitiveData('1234567890123456', 'creditCard')).toBe('1234********3456');
    });
  });
}); 