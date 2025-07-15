import { AuditLogger, AuditLogEntry, logUserLogin, logUserLogout, logChecklistAction, logSecurityViolation } from '../audit';

describe('Audit Logger', () => {
  let auditLogger: AuditLogger;

  beforeEach(() => {
    auditLogger = new AuditLogger(100); // 작은 크기로 테스트
    // 로컬 스토리지 초기화
    localStorage.clear();
  });

  afterEach(() => {
    auditLogger.clearLogs();
  });

  describe('AuditLogger class', () => {
    it('creates log entries correctly', () => {
      auditLogger.log('user.login', 'auth', { method: 'credentials' }, {
        userId: '123',
        username: 'testuser',
        success: true,
      });

      const logs = auditLogger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0]).toMatchObject({
        action: 'user.login',
        resource: 'auth',
        userId: '123',
        username: 'testuser',
        success: true,
        severity: 'low',
      });
    });

    it('filters logs by user ID', () => {
      auditLogger.log('user.login', 'auth', {}, { userId: '123', username: 'user1' });
      auditLogger.log('user.login', 'auth', {}, { userId: '456', username: 'user2' });

      const logs = auditLogger.getLogs({ userId: '123' });
      expect(logs).toHaveLength(1);
      expect(logs[0].userId).toBe('123');
    });

    it('filters logs by action', () => {
      auditLogger.log('user.login', 'auth', {}, { userId: '123' });
      auditLogger.log('checklist.create', 'checklist', {}, { userId: '123' });

      const logs = auditLogger.getLogs({ action: 'user.login' });
      expect(logs).toHaveLength(1);
      expect(logs[0].action).toBe('user.login');
    });

    it('filters logs by severity', () => {
      auditLogger.log('user.login', 'auth', {}, { userId: '123', severity: 'low' });
      auditLogger.log('security.violation', 'security', {}, { userId: '123', severity: 'high' });

      const logs = auditLogger.getLogs({ severity: 'high' });
      expect(logs).toHaveLength(1);
      expect(logs[0].severity).toBe('high');
    });

    it('filters logs by success status', () => {
      auditLogger.log('user.login', 'auth', {}, { userId: '123', success: true });
      auditLogger.log('user.login', 'auth', {}, { userId: '456', success: false });

      const logs = auditLogger.getLogs({ success: false });
      expect(logs).toHaveLength(1);
      expect(logs[0].success).toBe(false);
    });

    it('filters logs by date range', () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      auditLogger.log('user.login', 'auth', {}, { userId: '123' });

      const logs = auditLogger.getLogs({
        startDate: yesterday.toISOString(),
        endDate: tomorrow.toISOString(),
      });
      expect(logs).toHaveLength(1);
    });

    it('gets user activity for specific period', () => {
      auditLogger.log('user.login', 'auth', {}, { userId: '123', username: 'user1' });
      auditLogger.log('checklist.create', 'checklist', {}, { userId: '123', username: 'user1' });

      const activity = auditLogger.getUserActivity('123', 30);
      expect(activity).toHaveLength(2);
      expect(activity.every(log => log.userId === '123')).toBe(true);
    });

    it('gets security events', () => {
      auditLogger.log('security.violation', 'security', { violation: 'sql_injection' }, { severity: 'high' });
      auditLogger.log('user.login', 'auth', {}, { severity: 'low' });

      const securityEvents = auditLogger.getSecurityEvents('high');
      expect(securityEvents).toHaveLength(1);
      expect(securityEvents[0].action).toBe('security.violation');
    });

    it('gets failed operations', () => {
      auditLogger.log('user.login', 'auth', {}, { success: true });
      auditLogger.log('user.login', 'auth', {}, { success: false, errorMessage: 'Invalid credentials' });

      const failedOps = auditLogger.getFailedOperations();
      expect(failedOps).toHaveLength(1);
      expect(failedOps[0].success).toBe(false);
    });

    it('calculates statistics correctly', () => {
      auditLogger.log('user.login', 'auth', {}, { success: true });
      auditLogger.log('user.login', 'auth', {}, { success: false });
      auditLogger.log('security.violation', 'security', {}, { severity: 'high', success: false });

      const stats = auditLogger.getStats();
      expect(stats.totalLogs).toBe(3);
      expect(stats.successRate).toBeCloseTo(33.33, 1);
      expect(stats.securityEvents).toBe(1);
    });

    it('exports logs as JSON', () => {
      auditLogger.log('user.login', 'auth', {}, { userId: '123' });
      const jsonExport = auditLogger.exportLogs('json');
      const parsed = JSON.parse(jsonExport);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].action).toBe('user.login');
    });

    it('exports logs as CSV', () => {
      auditLogger.log('user.login', 'auth', {}, { userId: '123', username: 'user1' });
      const csvExport = auditLogger.exportLogs('csv');
      expect(csvExport).toContain('"ID","Timestamp","User ID","Username","Action","Resource","Resource ID","Severity","Success","Error Message"');
      expect(csvExport).toContain('user.login');
    });

    it('trims logs when max limit is reached', () => {
      auditLogger.setMaxLogs(2);
      
      auditLogger.log('user.login', 'auth', {}, { userId: '1' });
      auditLogger.log('user.login', 'auth', {}, { userId: '2' });
      auditLogger.log('user.login', 'auth', {}, { userId: '3' });

      const logs = auditLogger.getLogs();
      expect(logs).toHaveLength(2);
      // 최신 로그가 먼저 오도록 정렬됨 (최신순)
      expect(logs[0].userId).toBe('2');
      expect(logs[1].userId).toBe('3');
    });

    it('can be enabled/disabled', () => {
      auditLogger.setEnabled(false);
      auditLogger.log('user.login', 'auth', {}, { userId: '123' });
      expect(auditLogger.getLogs()).toHaveLength(0);

      auditLogger.setEnabled(true);
      auditLogger.log('user.login', 'auth', {}, { userId: '123' });
      expect(auditLogger.getLogs()).toHaveLength(1);
    });

    it('removes sensitive data from logs', () => {
      auditLogger.log('user.login', 'auth', { 
        password: 'secret123',
        token: 'jwt_token',
        normalField: 'value'
      }, { userId: '123' });

      auditLogger.cleanupSensitiveData();
      const logs = auditLogger.getLogs();
      expect(logs[0].details.password).toBe('[REDACTED]');
      expect(logs[0].details.token).toBe('[REDACTED]');
      expect(logs[0].details.normalField).toBe('value');
    });
  });

  describe('Convenience functions', () => {
    it('logs user login correctly', () => {
      const testLogger = new AuditLogger();
      testLogger.log('user.login', 'auth', {
        method: 'credentials',
      }, {
        userId: '123',
        username: 'testuser',
        success: true,
        severity: 'low',
      });
      
      const logs = testLogger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0]).toMatchObject({
        action: 'user.login',
        resource: 'auth',
        userId: '123',
        username: 'testuser',
        success: true,
        severity: 'low',
      });
    });

    it('logs user login failure correctly', () => {
      const testLogger = new AuditLogger();
      testLogger.log('user.login', 'auth', {
        method: 'credentials',
      }, {
        userId: '123',
        username: 'testuser',
        success: false,
        errorMessage: 'Invalid credentials',
        severity: 'medium',
      });
      
      const logs = testLogger.getLogs();
      expect(logs[0]).toMatchObject({
        success: false,
        errorMessage: 'Invalid credentials',
        severity: 'medium',
      });
    });

    it('logs user logout correctly', () => {
      const testLogger = new AuditLogger();
      testLogger.log('user.logout', 'auth', {}, {
        userId: '123',
        username: 'testuser',
        success: true,
      });
      
      const logs = testLogger.getLogs();
      expect(logs[0]).toMatchObject({
        action: 'user.logout',
        resource: 'auth',
        userId: '123',
        username: 'testuser',
        success: true,
      });
    });

    it('logs checklist actions correctly', () => {
      const testLogger = new AuditLogger();
      testLogger.log('checklist.create', 'checklist', {
        title: 'Test Item',
        description: 'Test Description'
      }, {
        userId: 'user123',
        username: 'testuser',
        resourceId: 'item123',
        success: true,
        severity: 'low',
      });
      
      const logs = testLogger.getLogs();
      expect(logs[0]).toMatchObject({
        action: 'checklist.create',
        resource: 'checklist',
        userId: 'user123',
        username: 'testuser',
        resourceId: 'item123',
        success: true,
        severity: 'low',
      });
    });

    it('logs security violations correctly', () => {
      const testLogger = new AuditLogger();
      testLogger.log('security.violation', 'security', {
        violation: 'sql_injection_attempt',
        input: 'SELECT * FROM users',
        ip: '192.168.1.1'
      }, {
        userId: 'user123',
        username: 'testuser',
        severity: 'high',
        success: false,
      });
      
      const logs = testLogger.getLogs();
      expect(logs[0]).toMatchObject({
        action: 'security.violation',
        resource: 'security',
        userId: 'user123',
        username: 'testuser',
        severity: 'high',
        success: false,
      });
    });
  });
}); 