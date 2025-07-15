// 감사 로그 타입 정의
export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId?: string;
  username?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: Record<string, any>;
  ip?: string;
  userAgent?: string;
  severity: 'low' | 'medium' | 'high';
  success: boolean;
  errorMessage?: string;
}

// 감사 로그 이벤트 타입
export type AuditEvent = 
  | 'user.login'
  | 'user.logout'
  | 'user.password_change'
  | 'checklist.create'
  | 'checklist.update'
  | 'checklist.delete'
  | 'checklist.view'
  | 'file.upload'
  | 'file.delete'
  | 'comment.create'
  | 'comment.update'
  | 'comment.delete'
  | 'model.create'
  | 'model.update'
  | 'model.delete'
  | 'option.create'
  | 'option.update'
  | 'option.delete'
  | 'system.error'
  | 'security.violation';

// 감사 로그 클래스
export class AuditLogger {
  private logs: AuditLogEntry[] = [];
  private maxLogs: number = 1000; // 최대 로그 수
  private isEnabled: boolean = true;

  constructor(maxLogs: number = 1000) {
    this.maxLogs = maxLogs;
  }

  // 로그 생성
  log(
    action: AuditEvent,
    resource: string,
    details: Record<string, any> = {},
    options: {
      userId?: string;
      username?: string;
      resourceId?: string;
      severity?: 'low' | 'medium' | 'high';
      success?: boolean;
      errorMessage?: string;
    } = {}
  ): void {
    if (!this.isEnabled) return;

    const entry: AuditLogEntry = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      userId: options.userId,
      username: options.username,
      action,
      resource,
      resourceId: options.resourceId,
      details,
      ip: this.getClientIP(),
      userAgent: this.getUserAgent(),
      severity: options.severity || 'low',
      success: options.success !== false,
      errorMessage: options.errorMessage,
    };

    this.logs.push(entry);
    this.trimLogs();
    this.persistLog(entry);
  }

  // 로그 조회
  getLogs(filters?: {
    userId?: string;
    action?: AuditEvent;
    resource?: string;
    severity?: 'low' | 'medium' | 'high';
    startDate?: string;
    endDate?: string;
    success?: boolean;
  }): AuditLogEntry[] {
    let filteredLogs = [...this.logs];

    if (filters?.userId) {
      filteredLogs = filteredLogs.filter(log => log.userId === filters.userId);
    }

    if (filters?.action) {
      filteredLogs = filteredLogs.filter(log => log.action === filters.action);
    }

    if (filters?.resource) {
      filteredLogs = filteredLogs.filter(log => log.resource === filters.resource);
    }

    if (filters?.severity) {
      filteredLogs = filteredLogs.filter(log => log.severity === filters.severity);
    }

    if (filters?.startDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp >= filters.startDate!);
    }

    if (filters?.endDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp <= filters.endDate!);
    }

    if (filters?.success !== undefined) {
      filteredLogs = filteredLogs.filter(log => log.success === filters.success);
    }

    return filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // 사용자 활동 조회
  getUserActivity(userId: string, days: number = 30): AuditLogEntry[] {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return this.getLogs({
      userId,
      startDate: startDate.toISOString(),
    });
  }

  // 보안 이벤트 조회
  getSecurityEvents(severity: 'medium' | 'high' = 'high'): AuditLogEntry[] {
    return this.getLogs({
      severity,
      action: 'security.violation',
    });
  }

  // 실패한 작업 조회
  getFailedOperations(): AuditLogEntry[] {
    return this.getLogs({
      success: false,
    });
  }

  // 로그 통계
  getStats(): {
    totalLogs: number;
    successRate: number;
    securityEvents: number;
    recentActivity: number;
  } {
    const totalLogs = this.logs.length;
    const successfulLogs = this.logs.filter(log => log.success).length;
    const securityEvents = this.logs.filter(log => 
      log.action === 'security.violation' || log.severity === 'high'
    ).length;
    const recentActivity = this.logs.filter(log => {
      const logDate = new Date(log.timestamp);
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      return logDate > oneDayAgo;
    }).length;

    return {
      totalLogs,
      successRate: totalLogs > 0 ? (successfulLogs / totalLogs) * 100 : 0,
      securityEvents,
      recentActivity,
    };
  }

  // 로그 내보내기
  exportLogs(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      return this.exportToCSV();
    }
    return JSON.stringify(this.logs, null, 2);
  }

  // 로그 초기화
  clearLogs(): void {
    this.logs = [];
  }

  // 로거 활성화/비활성화
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  // 로그 보존 기간 설정
  setMaxLogs(maxLogs: number): void {
    this.maxLogs = maxLogs;
    this.trimLogs();
  }

  // 개인정보 보호를 위한 로그 정리
  cleanupSensitiveData(): void {
    this.logs = this.logs.map(log => ({
      ...log,
      details: this.removeSensitiveData(log.details),
    }));
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private trimLogs(): void {
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  private persistLog(entry: AuditLogEntry): void {
    // 로컬 스토리지에 저장 (실제로는 서버로 전송)
    try {
      const existingLogs = localStorage.getItem('audit_logs');
      const logs = existingLogs ? JSON.parse(existingLogs) : [];
      logs.push(entry);
      
      // 최대 100개까지만 저장
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }
      
      localStorage.setItem('audit_logs', JSON.stringify(logs));
    } catch (error) {
      console.error('Failed to persist audit log:', error);
    }
  }

  private getClientIP(): string {
    // 실제로는 서버에서 IP를 가져와야 함
    return 'client-ip';
  }

  private getUserAgent(): string {
    return typeof navigator !== 'undefined' ? navigator.userAgent : 'server';
  }

  private exportToCSV(): string {
    if (this.logs.length === 0) return '';

    const headers = ['ID', 'Timestamp', 'User ID', 'Username', 'Action', 'Resource', 'Resource ID', 'Severity', 'Success', 'Error Message'];
    const rows = this.logs.map(log => [
      log.id,
      log.timestamp,
      log.userId || '',
      log.username || '',
      log.action,
      log.resource,
      log.resourceId || '',
      log.severity,
      log.success ? 'true' : 'false',
      log.errorMessage || '',
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    return csvContent;
  }

  private removeSensitiveData(details: Record<string, any>): Record<string, any> {
    const sensitiveKeys = ['password', 'token', 'secret', 'key', 'authorization'];
    const cleaned = { ...details };

    for (const key of sensitiveKeys) {
      if (cleaned[key]) {
        cleaned[key] = '[REDACTED]';
      }
    }

    return cleaned;
  }
}

// 전역 감사 로거 인스턴스
export const auditLogger = new AuditLogger();

// 편의 함수들
export const logUserLogin = (userId: string, username: string, success: boolean, errorMessage?: string) => {
  const logger = new AuditLogger();
  logger.log('user.login', 'auth', {
    method: 'credentials',
  }, {
    userId,
    username,
    success,
    errorMessage,
    severity: success ? 'low' : 'medium',
  });
};

export const logUserLogout = (userId: string, username: string) => {
  const logger = new AuditLogger();
  logger.log('user.logout', 'auth', {}, {
    userId,
    username,
    success: true,
  });
};

export const logChecklistAction = (
  action: 'checklist.create' | 'checklist.update' | 'checklist.delete' | 'checklist.view',
  checklistId: string,
  userId: string,
  username: string,
  details: Record<string, any> = {},
  success: boolean = true,
  errorMessage?: string
) => {
  const logger = new AuditLogger();
  logger.log(action, 'checklist', details, {
    userId,
    username,
    resourceId: checklistId,
    success,
    errorMessage,
    severity: action === 'checklist.delete' ? 'medium' : 'low',
  });
};

export const logFileAction = (
  action: 'file.upload' | 'file.delete',
  fileId: string,
  fileName: string,
  userId: string,
  username: string,
  fileSize?: number,
  success: boolean = true,
  errorMessage?: string
) => {
  const logger = new AuditLogger();
  logger.log(action, 'file', {
    fileName,
    fileSize,
  }, {
    userId,
    username,
    resourceId: fileId,
    success,
    errorMessage,
    severity: 'low',
  });
};

export const logSecurityViolation = (
  violation: string,
  userId?: string,
  username?: string,
  details: Record<string, any> = {}
) => {
  const logger = new AuditLogger();
  logger.log('security.violation', 'security', {
    violation,
    ...details,
  }, {
    userId,
    username,
    severity: 'high',
    success: false,
  });
};

export const logSystemError = (
  error: Error,
  context: string,
  userId?: string,
  username?: string
) => {
  const logger = new AuditLogger();
  logger.log('system.error', 'system', {
    error: error.message,
    stack: error.stack,
    context,
  }, {
    userId,
    username,
    severity: 'medium',
    success: false,
    errorMessage: error.message,
  });
}; 