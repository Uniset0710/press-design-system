describe('Password Flow', () => {
  beforeEach(() => {
    // Reset database state before each test
    cy.request('POST', 'http://localhost:3002/api/test/reset');
  });

  describe('Password Forgot Flow', () => {
    it('should complete password forgot flow successfully', () => {
      // Visit forgot password page
      cy.visit('/password/forgot');

      // Check page elements
      cy.get('h2').should('contain', '비밀번호 찾기');
      cy.get('label').should('contain', '사용자명');
      cy.get('button').should('contain', '비밀번호 재설정 이메일 발송');

      // Submit empty form
      cy.get('button[type="submit"]').click();
      cy.contains('사용자명을 입력해주세요').should('be.visible');

      // Enter valid username
      cy.get('input[name="username"]').type('admin');
      cy.get('button[type="submit"]').click();

      // Check success message
      cy.contains('이메일 발송 완료').should('be.visible');
      cy.contains('admin님의 등록된 이메일로 비밀번호 재설정 링크를 발송했습니다').should('be.visible');
    });

    it('should handle invalid username', () => {
      cy.visit('/password/forgot');

      // Enter invalid username
      cy.get('input[name="username"]').type('nonexistent');
      cy.get('button[type="submit"]').click();

      // Should still show success (security measure)
      cy.contains('이메일 발송 완료').should('be.visible');
    });

    it('should handle network error', () => {
      // Mock network error
      cy.intercept('POST', '/api/auth/forgot-password', { forceNetworkError: true });

      cy.visit('/password/forgot');
      cy.get('input[name="username"]').type('admin');
      cy.get('button[type="submit"]').click();

      cy.contains('서버 오류가 발생했습니다').should('be.visible');
    });
  });

  describe('Password Change Flow', () => {
    beforeEach(() => {
      // Login as admin
      cy.visit('/login');
      cy.get('input[name="username"]').type('admin');
      cy.get('input[name="password"]').type('admin123');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/model-select');
    });

    it('should change password successfully', () => {
      cy.visit('/password/change');

      // Check page elements
      cy.get('h2').should('contain', '비밀번호 변경');
      cy.get('label').should('contain', '현재 비밀번호');
      cy.get('label').should('contain', '새 비밀번호');
      cy.get('label').should('contain', '새 비밀번호 확인');

      // Submit empty form
      cy.get('button[type="submit"]').click();
      cy.contains('현재 비밀번호를 입력해주세요').should('be.visible');
      cy.contains('새 비밀번호를 입력해주세요').should('be.visible');
      cy.contains('새 비밀번호 확인을 입력해주세요').should('be.visible');

      // Enter weak password
      cy.get('input[name="newPassword"]').type('weak');
      cy.get('button[type="submit"]').click();
      cy.contains('비밀번호는 최소 8자 이상이어야 합니다').should('be.visible');

      // Enter mismatched passwords
      cy.get('input[name="newPassword"]').clear().type('StrongPass123!');
      cy.get('input[name="confirmPassword"]').type('DifferentPass123!');
      cy.get('button[type="submit"]').click();
      cy.contains('비밀번호가 일치하지 않습니다').should('be.visible');

      // Enter valid passwords
      cy.get('input[name="currentPassword"]').type('admin123');
      cy.get('input[name="newPassword"]').clear().type('NewStrongPass123!');
      cy.get('input[name="confirmPassword"]').clear().type('NewStrongPass123!');
      cy.get('button[type="submit"]').click();

      // Check success message
      cy.contains('비밀번호가 성공적으로 변경되었습니다').should('be.visible');
    });

    it('should handle wrong current password', () => {
      cy.visit('/password/change');

      cy.get('input[name="currentPassword"]').type('WrongPass123!');
      cy.get('input[name="newPassword"]').type('NewStrongPass123!');
      cy.get('input[name="confirmPassword"]').type('NewStrongPass123!');
      cy.get('button[type="submit"]').click();

      cy.contains('현재 비밀번호가 올바르지 않습니다').should('be.visible');
    });

    it('should redirect unauthenticated users', () => {
      // Logout
      cy.visit('/api/auth/signout');
      cy.visit('/password/change');

      // Should redirect to login
      cy.url().should('include', '/login');
    });
  });

  describe('Password Reset Flow', () => {
    it('should handle invalid reset token', () => {
      cy.visit('/password/reset?token=invalid-token');

      cy.contains('유효하지 않은 링크').should('be.visible');
      cy.contains('비밀번호 재설정 링크가 만료되었거나 유효하지 않습니다').should('be.visible');
    });

    it('should complete password reset flow with valid token', () => {
      // Mock valid token
      cy.intercept('GET', '/api/auth/validate-reset-token*', {
        statusCode: 200,
        body: { valid: true, userId: '1' }
      });

      cy.intercept('POST', '/api/auth/reset-password', {
        statusCode: 200,
        body: { message: '비밀번호가 성공적으로 재설정되었습니다' }
      });

      cy.visit('/password/reset?token=valid-token');

      // Wait for token validation
      cy.contains('새 비밀번호 설정').should('be.visible');

      // Submit empty form
      cy.get('button[type="submit"]').click();
      cy.contains('새 비밀번호를 입력해주세요').should('be.visible');
      cy.contains('새 비밀번호 확인을 입력해주세요').should('be.visible');

      // Enter weak password
      cy.get('input[name="newPassword"]').type('weak');
      cy.get('button[type="submit"]').click();
      cy.contains('비밀번호는 최소 8자 이상이어야 합니다').should('be.visible');

      // Enter mismatched passwords
      cy.get('input[name="newPassword"]').clear().type('StrongPass123!');
      cy.get('input[name="confirmPassword"]').type('DifferentPass123!');
      cy.get('button[type="submit"]').click();
      cy.contains('비밀번호가 일치하지 않습니다').should('be.visible');

      // Enter valid passwords
      cy.get('input[name="newPassword"]').clear().type('NewStrongPass123!');
      cy.get('input[name="confirmPassword"]').clear().type('NewStrongPass123!');
      cy.get('button[type="submit"]').click();

      // Check success message
      cy.contains('비밀번호 재설정 완료').should('be.visible');
      cy.contains('비밀번호가 성공적으로 재설정되었습니다').should('be.visible');
    });

    it('should handle API error during reset', () => {
      // Mock valid token but API error
      cy.intercept('GET', '/api/auth/validate-reset-token*', {
        statusCode: 200,
        body: { valid: true, userId: '1' }
      });

      cy.intercept('POST', '/api/auth/reset-password', {
        statusCode: 400,
        body: { error: '유효하지 않은 토큰입니다' }
      });

      cy.visit('/password/reset?token=valid-token');

      cy.contains('새 비밀번호 설정').should('be.visible');

      cy.get('input[name="newPassword"]').type('NewStrongPass123!');
      cy.get('input[name="confirmPassword"]').type('NewStrongPass123!');
      cy.get('button[type="submit"]').click();

      cy.contains('유효하지 않은 토큰입니다').should('be.visible');
    });
  });

  describe('Password Flow Integration', () => {
    it('should complete full password reset flow', () => {
      // 1. Start with forgot password
      cy.visit('/password/forgot');
      cy.get('input[name="username"]').type('admin');
      cy.get('button[type="submit"]').click();
      cy.contains('이메일 발송 완료').should('be.visible');

      // 2. Navigate to reset page (simulating email link)
      cy.visit('/password/reset?token=test-token');

      // 3. Complete password reset
      cy.get('input[name="newPassword"]').type('NewPassword123!');
      cy.get('input[name="confirmPassword"]').type('NewPassword123!');
      cy.get('button[type="submit"]').click();

      // 4. Verify success
      cy.contains('비밀번호 재설정 완료').should('be.visible');

      // 5. Navigate to login
      cy.get('a[href="/login"]').click();
      cy.url().should('include', '/login');
    });
  });
}); 