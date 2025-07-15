// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom command for login
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login')
  cy.get('[data-testid="email-input"]').type(email)
  cy.get('[data-testid="password-input"]').type(password)
  cy.get('[data-testid="login-button"]').click()
  cy.url().should('not.include', '/login')
})

// Custom command for logout
Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="logout-button"]').click()
  cy.url().should('include', '/login')
})

// Custom command for model selection
Cypress.Commands.add('selectModel', (modelId: string) => {
  cy.get('[data-testid="model-selector"]').select(modelId)
  cy.url().should('include', `modelId=${modelId}`)
})

// Custom command for adding checklist item
Cypress.Commands.add('addChecklistItem', (text: string, section: string) => {
  cy.get('[data-testid="add-item-button"]').click()
  cy.get('[data-testid="item-text-input"]').type(text)
  cy.get('[data-testid="section-select"]').select(section)
  cy.get('[data-testid="save-button"]').click()
  cy.contains(text).should('be.visible')
})

// Custom command for deleting checklist item
Cypress.Commands.add('deleteChecklistItem', (itemId: string) => {
  cy.get(`[data-testid="delete-item-${itemId}"]`).click()
  cy.get('[data-testid="confirm-delete-button"]').click()
  cy.get(`[data-testid="item-${itemId}"]`).should('not.exist')
}) 