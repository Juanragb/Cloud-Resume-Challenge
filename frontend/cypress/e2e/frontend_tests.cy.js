
describe('Pruebas del frontend del contador', () => {

    it('Debería mostrar el contador actualizado', () => {
      cy.intercept('GET', '**/api/http_trigger').as('getCounter');
      cy.visit('http://localhost:3000/frontend/main.html');
      cy.wait('@getCounter').then((interception) => {
        const counterValue = interception.response.body.visitas;
        cy.get('#visitCounter').should('have.text', counterValue.toString());
      });
    });
  });