describe('Pruebas para la API del contador de visitas', () => {
  const API_URL = Cypress.env('api_url');

  // Verificar inicialización del contador
  it('Verifica el valor del contador', () => {
    cy.request(API_URL).then((response) => {
      expect(response.body.visitas).to.be.a('number');
      expect(response.body.visitas).to.be.gte(0); // Verifica que el contador sea >= 0
    });
  });


  it('No debería incrementar el contador más de una vez por el mismo visitante', () => {
    // Estado inicial
    cy.request(API_URL).then((firstResponse) => {
      const initialCount = firstResponse.body.visitas;

        cy.request(API_URL).then((secondResponse) => {
          expect(secondResponse.status).to.eq(200);
          expect(secondResponse.body.visitas).to.eq(initialCount);

        cy.request(API_URL).then((thirdResponse) => {
          expect(thirdResponse.status).to.eq(200);
          expect(thirdResponse.body.visitas).to.eq(initialCount);
        });
      });
    });
  });


  // Manejo de errores con entrada incorrecta
  it('Debería manejar solicitudes malformateadas', () => {
    cy.request({
      method: 'POST', // Metodo no soportado
      url: API_URL,
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.be.oneOf([400, 404, 405]); // Esperamos un error 400 (Bad Request) o 405 (Method Not Allowed)
    });
  });

});




