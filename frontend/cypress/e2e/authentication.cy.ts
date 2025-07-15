describe('인증 시스템', () => {
  beforeEach(() => {
    cy.visit('/login')
  })

  it('올바른 자격증명으로 로그인할 수 있어야 한다', () => {
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
    cy.url().should('not.include', '/login')
    cy.url().should('include', '/checklist')
  })

  it('잘못된 자격증명으로 로그인 시도 시 오류 메시지가 표시되어야 한다', () => {
    cy.intercept('POST', '/api/auth/callback/credentials', {
      statusCode: 401,
      body: {
        error: 'Invalid credentials'
      }
    }).as('loginFailure')

    cy.get('[data-testid="email-input"]').type('wrong@example.com')
    cy.get('[data-testid="password-input"]').type('wrongpassword')
    cy.get('[data-testid="login-button"]').click()

    cy.wait('@loginFailure')
    cy.get('[data-testid="error-message"]').should('be.visible')
    cy.get('[data-testid="error-message"]').should('contain', '로그인에 실패했습니다')
  })

  it('로그아웃할 수 있어야 한다', () => {
    // 먼저 로그인
    cy.intercept('GET', '/api/auth/session', {
      statusCode: 200,
      body: {
        user: {
          id: '1',
          email: 'admin@example.com',
          role: 'admin',
          model: 'PRESS'
        }
      }
    }).as('getSession')

    cy.login('admin@example.com', 'password')
    
    // 로그아웃
    cy.get('[data-testid="logout-button"]').click()
    
    // 로그인 페이지로 리다이렉트
    cy.url().should('include', '/login')
  })

  it('인증되지 않은 사용자는 보호된 페이지에 접근할 수 없어야 한다', () => {
    cy.intercept('GET', '/api/auth/session', {
      statusCode: 401,
      body: null
    }).as('getUnauthorizedSession')

    cy.visit('/checklist')
    
    // 로그인 페이지로 리다이렉트
    cy.url().should('include', '/login')
  })

  it('세션이 만료되면 자동으로 로그아웃되어야 한다', () => {
    // 로그인 후 세션 만료 시뮬레이션
    cy.intercept('GET', '/api/auth/session', {
      statusCode: 401,
      body: null
    }).as('getExpiredSession')

    cy.visit('/checklist')
    
    // 로그인 페이지로 리다이렉트
    cy.url().should('include', '/login')
    cy.get('[data-testid="error-message"]').should('contain', '세션이 만료되었습니다')
  })
}) 