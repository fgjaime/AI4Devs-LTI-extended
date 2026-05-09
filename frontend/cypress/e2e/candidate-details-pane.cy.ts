describe('Candidate details pane responsive width', () => {
  const API_URL = Cypress.env('API_URL') || 'http://localhost:3010';

  it('uses desktop and mobile widths and closes with Escape', () => {
    cy.request(`${API_URL}/positions`).then((positionsResponse) => {
      expect(positionsResponse.status).to.eq(200);
      const positions = positionsResponse.body as Array<{ id: number }>;
      expect(positions.length).to.be.greaterThan(0);
      const positionId = positions[0].id;

      cy.request(`${API_URL}/positions/${positionId}/candidates`).then((candidatesResponse) => {
        expect(candidatesResponse.status).to.eq(200);
        const candidates = candidatesResponse.body as Array<unknown>;
        expect(candidates.length).to.be.greaterThan(0);

        cy.viewport(1280, 800);
        cy.visit(`/positions/${positionId}`);
        cy.get('.card.mb-2', { timeout: 15000 }).first().click();

        cy.get('.offcanvas.candidate-details-offcanvas.offcanvas-end', { timeout: 15000 })
          .should('be.visible')
          .invoke('outerWidth')
          .should('be.gte', 640)
          .and('be.lt', 1000);

        cy.get('body').type('{esc}');
        cy.get('.offcanvas.candidate-details-offcanvas.offcanvas-end').should('not.exist');

        cy.viewport(375, 667);
        cy.get('.card.mb-2', { timeout: 15000 }).first().click();
        cy.get('.offcanvas.candidate-details-offcanvas.offcanvas-end', { timeout: 15000 })
          .should('be.visible')
          .invoke('outerWidth')
          .should('eq', 375);
      });
    });
  });
});
