describe('i18n — English default locale', () => {
  it('shows English heading on Recruiter Dashboard (/)', () => {
    cy.visit('/');
    cy.contains('Recruiter Dashboard').should('be.visible');
  });

  it('shows English heading on Positions (/positions)', () => {
    cy.visit('/positions');
    cy.contains('Positions').should('be.visible');
  });

  it('shows English heading on Add Candidate (/add-candidate)', () => {
    cy.visit('/add-candidate');
    cy.contains('Add Candidate').should('be.visible');
  });
});
