describe('비밀번호 관리 플로우', () => {
  beforeEach(() => {
    cy.visit('/login')
  })

  describe('비밀번호 변경', () => {
    it('로그인 후 비밀번호 변경이 가능해야 한다', () => {
      // 로그인
      cy.intercept('POST', '/api/auth/callback/credentials', {
        statusCode: 200,
        body: {
          user: {
            id: '1',
            email: 'admin@example.com',
            role: 'admin',
            model: 'PRESS'
          }
        }
      }).as('loginRequest')

      cy.get('[data-testid="email-input"]').type('admin@example.com')
      cy.get('[data-testid="password-input"]').type('password')
      cy.get('[data-testid="login-button"]').click()

      cy.wait('@loginRequest')
      cy.url().should('include', '/checklist')

      // 비밀번호 변경 페이지로 이동
      cy.visit('/password/change')

      // 현재 비밀번호 입력
      cy.get('[data-testid="current-password-input"]').type('password')
      
      // 새 비밀번호 입력
      cy.get('[data-testid="new-password-input"]').type('NewStrongPass123!')
      cy.get('[data-testid="confirm-password-input"]').type('NewStrongPass123!')
      
      // 비밀번호 변경 API 호출 모킹
      cy.intercept('POST', '/api/auth/change-password', {
        statusCode: 200,
        body: {
          message: '비밀번호가 성공적으로 변경되었습니다.'
        }
      }).as('changePasswordRequest')

      // 변경 버튼 클릭
      cy.get('[data-testid="change-password-button"]').click()

      cy.wait('@changePasswordRequest')
      cy.get('[data-testid="success-message"]').should('contain', '비밀번호가 성공적으로 변경되었습니다.')
    })

    it('잘못된 현재 비밀번호로 변경 시도 시 오류가 표시되어야 한다', () => {
      // 로그인
      cy.login('admin@example.com', 'password')
      cy.visit('/password/change')

      // 잘못된 현재 비밀번호 입력
      cy.get('[data-testid="current-password-input"]').type('wrongpassword')
      cy.get('[data-testid="new-password-input"]').type('NewStrongPass123!')
      cy.get('[data-testid="confirm-password-input"]').type('NewStrongPass123!')

      // API 오류 응답 모킹
      cy.intercept('POST', '/api/auth/change-password', {
        statusCode: 400,
        body: {
          error: '현재 비밀번호가 올바르지 않습니다.'
        }
      }).as('changePasswordError')

      cy.get('[data-testid="change-password-button"]').click()

      cy.wait('@changePasswordError')
      cy.get('[data-testid="error-message"]').should('contain', '현재 비밀번호가 올바르지 않습니다.')
    })

    it('약한 새 비밀번호로 변경 시도 시 유효성 검사 오류가 표시되어야 한다', () => {
      cy.login('admin@example.com', 'password')
      cy.visit('/password/change')

      // 약한 비밀번호 입력
      cy.get('[data-testid="current-password-input"]').type('password')
      cy.get('[data-testid="new-password-input"]').type('weak')
      cy.get('[data-testid="confirm-password-input"]').type('weak')

      cy.get('[data-testid="change-password-button"]').click()

      cy.get('[data-testid="validation-error"]').should('contain', '비밀번호는 최소 8자 이상이어야 합니다')
    })
  })

  describe('비밀번호 찾기', () => {
    it('비밀번호 찾기 이메일 발송이 가능해야 한다', () => {
      cy.visit('/password/forgot')

      // 유효한 이메일 입력
      cy.get('[data-testid="email-input"]').type('admin@example.com')

      // 이메일 발송 API 호출 모킹
      cy.intercept('POST', '/api/auth/forgot-password', {
        statusCode: 200,
        body: {
          message: '비밀번호 재설정 이메일이 발송되었습니다.'
        }
      }).as('forgotPasswordRequest')

      cy.get('[data-testid="send-email-button"]').click()

      cy.wait('@forgotPasswordRequest')
      cy.get('[data-testid="success-message"]').should('contain', '비밀번호 재설정 이메일이 발송되었습니다.')
    })

    it('존재하지 않는 이메일로 비밀번호 찾기 시도 시 오류가 표시되어야 한다', () => {
      cy.visit('/password/forgot')

      // 존재하지 않는 이메일 입력
      cy.get('[data-testid="email-input"]').type('nonexistent@example.com')

      // API 오류 응답 모킹
      cy.intercept('POST', '/api/auth/forgot-password', {
        statusCode: 404,
        body: {
          error: '해당 이메일로 등록된 사용자를 찾을 수 없습니다.'
        }
      }).as('forgotPasswordError')

      cy.get('[data-testid="send-email-button"]').click()

      cy.wait('@forgotPasswordError')
      cy.get('[data-testid="error-message"]').should('contain', '해당 이메일로 등록된 사용자를 찾을 수 없습니다.')
    })

    it('잘못된 이메일 형식으로 입력 시 유효성 검사 오류가 표시되어야 한다', () => {
      cy.visit('/password/forgot')

      // 잘못된 이메일 형식 입력
      cy.get('[data-testid="email-input"]').type('invalid-email')

      cy.get('[data-testid="send-email-button"]').click()

      cy.get('[data-testid="validation-error"]').should('contain', '올바른 이메일 주소를 입력해주세요')
    })
  })

  describe('비밀번호 재설정', () => {
    it('유효한 토큰으로 비밀번호 재설정이 가능해야 한다', () => {
      // 유효한 토큰으로 재설정 페이지 방문
      cy.visit('/password/reset?token=valid-token')

      // 새 비밀번호 입력
      cy.get('[data-testid="new-password-input"]').type('NewStrongPass123!')
      cy.get('[data-testid="confirm-password-input"]').type('NewStrongPass123!')

      // 재설정 API 호출 모킹
      cy.intercept('POST', '/api/auth/reset-password', {
        statusCode: 200,
        body: {
          message: '비밀번호가 성공적으로 재설정되었습니다.'
        }
      }).as('resetPasswordRequest')

      cy.get('[data-testid="reset-password-button"]').click()

      cy.wait('@resetPasswordRequest')
      cy.get('[data-testid="success-message"]').should('contain', '비밀번호가 성공적으로 재설정되었습니다.')
      
      // 로그인 페이지로 리다이렉트 확인
      cy.url().should('include', '/login')
    })

    it('유효하지 않은 토큰으로 재설정 시도 시 오류가 표시되어야 한다', () => {
      cy.visit('/password/reset?token=invalid-token')

      cy.get('[data-testid="new-password-input"]').type('NewStrongPass123!')
      cy.get('[data-testid="confirm-password-input"]').type('NewStrongPass123!')

      // API 오류 응답 모킹
      cy.intercept('POST', '/api/auth/reset-password', {
        statusCode: 400,
        body: {
          error: '유효하지 않은 토큰입니다.'
        }
      }).as('resetPasswordError')

      cy.get('[data-testid="reset-password-button"]').click()

      cy.wait('@resetPasswordError')
      cy.get('[data-testid="error-message"]').should('contain', '유효하지 않은 토큰입니다.')
    })

    it('만료된 토큰으로 재설정 시도 시 오류가 표시되어야 한다', () => {
      cy.visit('/password/reset?token=expired-token')

      cy.get('[data-testid="new-password-input"]').type('NewStrongPass123!')
      cy.get('[data-testid="confirm-password-input"]').type('NewStrongPass123!')

      // API 오류 응답 모킹
      cy.intercept('POST', '/api/auth/reset-password', {
        statusCode: 400,
        body: {
          error: '토큰이 만료되었습니다.'
        }
      }).as('resetPasswordExpired')

      cy.get('[data-testid="reset-password-button"]').click()

      cy.wait('@resetPasswordExpired')
      cy.get('[data-testid="error-message"]').should('contain', '토큰이 만료되었습니다.')
    })

    it('토큰이 없는 경우 오류가 표시되어야 한다', () => {
      cy.visit('/password/reset')

      cy.get('[data-testid="error-message"]').should('contain', '유효하지 않은 링크입니다.')
    })
  })

  describe('토큰 검증', () => {
    it('유효한 토큰 검증이 성공해야 한다', () => {
      cy.intercept('GET', '/api/auth/validate-reset-token?token=valid-token', {
        statusCode: 200,
        body: {
          valid: true
        }
      }).as('validateTokenSuccess')

      cy.visit('/password/reset?token=valid-token')

      cy.wait('@validateTokenSuccess')
      cy.get('[data-testid="new-password-input"]').should('be.visible')
    })

    it('유효하지 않은 토큰 검증이 실패해야 한다', () => {
      cy.intercept('GET', '/api/auth/validate-reset-token?token=invalid-token', {
        statusCode: 200,
        body: {
          valid: false
        }
      }).as('validateTokenFailure')

      cy.visit('/password/reset?token=invalid-token')

      cy.wait('@validateTokenFailure')
      cy.get('[data-testid="error-message"]').should('contain', '유효하지 않은 링크입니다.')
    })
  })

  describe('접근 제어', () => {
    it('인증되지 않은 사용자는 비밀번호 변경 페이지에 접근할 수 없어야 한다', () => {
      cy.visit('/password/change')

      // 로그인 페이지로 리다이렉트
      cy.url().should('include', '/login')
    })

    it('비밀번호 찾기 페이지는 인증 없이 접근 가능해야 한다', () => {
      cy.visit('/password/forgot')

      cy.get('[data-testid="email-input"]').should('be.visible')
      cy.get('[data-testid="send-email-button"]').should('be.visible')
    })
  })
}) 