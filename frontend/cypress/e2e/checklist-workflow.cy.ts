describe('체크리스트 워크플로우', () => {
  beforeEach(() => {
    // 테스트 데이터 설정
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

    cy.intercept('GET', '/api/checklist/*', {
      statusCode: 200,
      body: {
        DTL: [
          {
            id: '1',
            text: '기존 체크리스트 항목',
            section: 'Design Check List',
            author: '테스트 사용자',
            dueDate: '2024-01-15'
          }
        ],
        DTE: []
      }
    }).as('getChecklist')
  })

  it('로그인 후 체크리스트 항목을 추가하고 완료 처리할 수 있어야 한다', () => {
    // 로그인
    cy.login('admin@example.com', 'password')
    
    // 기종 선택
    cy.selectModel('PRESS')
    
    // 새 항목 추가
    cy.addChecklistItem('새로운 작업', 'Design Check List')
    
    // 추가된 항목 확인
    cy.get('[data-testid="checklist-table"]')
      .should('contain', '새로운 작업')
    
    // 완료 처리
    cy.get('[data-testid="checkbox-1"]').click()
    cy.get('[data-testid="checkbox-1"]').should('be.checked')
  })

  it('권한이 없는 사용자는 편집 기능을 사용할 수 없어야 한다', () => {
    // 일반 사용자로 로그인
    cy.intercept('GET', '/api/auth/session', {
      statusCode: 200,
      body: {
        user: {
          id: '2',
          email: 'user@example.com',
          role: 'user',
          model: 'PRESS'
        }
      }
    }).as('getUserSession')

    cy.login('user@example.com', 'password')
    cy.visit('/checklist')
    
    // 편집 버튼이 보이지 않아야 함
    cy.get('[data-testid="edit-button"]').should('not.exist')
    cy.get('[data-testid="add-item-button"]').should('not.exist')
  })

  it('체크리스트 항목을 수정할 수 있어야 한다', () => {
    cy.login('admin@example.com', 'password')
    cy.selectModel('PRESS')
    
    // 기존 항목 수정
    cy.get('[data-testid="edit-item-1"]').click()
    cy.get('[data-testid="item-text-input"]').clear().type('수정된 작업')
    cy.get('[data-testid="save-button"]').click()
    
    // 수정된 내용 확인
    cy.contains('수정된 작업').should('be.visible')
  })

  it('체크리스트 항목을 삭제할 수 있어야 한다', () => {
    cy.login('admin@example.com', 'password')
    cy.selectModel('PRESS')
    
    // 항목 삭제
    cy.deleteChecklistItem('1')
    
    // 삭제된 항목이 보이지 않아야 함
    cy.contains('기존 체크리스트 항목').should('not.exist')
  })

  it('필터링 기능이 정상적으로 작동해야 한다', () => {
    cy.login('admin@example.com', 'password')
    cy.selectModel('PRESS')
    
    // DTL 옵션 필터 선택
    cy.get('[data-testid="option-filter-DTL"]').click()
    
    // 필터링된 결과 확인
    cy.get('[data-testid="checklist-table"]')
      .should('contain', '기존 체크리스트 항목')
    
    // DTE 옵션 필터 선택 (빈 결과)
    cy.get('[data-testid="option-filter-DTE"]').click()
    cy.get('[data-testid="checklist-table"]')
      .should('not.contain', '기존 체크리스트 항목')
  })

  it('검색 기능이 정상적으로 작동해야 한다', () => {
    cy.login('admin@example.com', 'password')
    cy.selectModel('PRESS')
    
    // 검색어 입력
    cy.get('[data-testid="search-input"]').type('기존')
    
    // 검색 결과 확인
    cy.get('[data-testid="checklist-table"]')
      .should('contain', '기존 체크리스트 항목')
    
    // 존재하지 않는 검색어
    cy.get('[data-testid="search-input"]').clear().type('존재하지않는항목')
    cy.get('[data-testid="checklist-table"]')
      .should('not.contain', '기존 체크리스트 항목')
  })
}) 