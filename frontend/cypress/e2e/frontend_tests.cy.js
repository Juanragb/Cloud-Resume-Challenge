describe('Pruebas del frontend del contador', () => {
    const API_URL = Cypress.env('api_url');
    
    it('Debería mostrar el contador actualizado', () => {
      cy.intercept('GET', API_URL).as('getCounter');
      cy.visit("https://www.juanragarcia.me");
      cy.wait('@getCounter').then((interception) => {
        const counterValue = interception.response.body.visitas;
        cy.get('#visitCounter').should('have.text', counterValue.toString());
      });
    });
  });