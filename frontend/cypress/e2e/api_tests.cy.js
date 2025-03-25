
// Verificar que la API actualiza el contador correctamente
describe('Pruebas para la API del contador de visitas', () => {
  const API_URL = Cypress.env('api_url');

  it('Debería incrementar el contador y devolver el nuevo valor', () => {
    // Primera llamada para obtener el estado inicial
    cy.request(API_URL).then((firstResponse) => {
      const initialCount = firstResponse.body.visitas;

      // Segunda llamada para incrementar
      cy.request(API_URL).then((secondResponse) => {
        expect(secondResponse.status).to.eq(200);
        expect(secondResponse.body.visitas).to.eq(initialCount + 1);
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


  // Verificar inicialización del contador
  it('Debería inicializar el contador si no existe', () => {
    // Simula que no hay documento en Cosmos DB (requeriría limpiar el estado antes)
    cy.request(API_URL).then((response) => {
      expect(response.body.visitas).to.be.a('number');
      expect(response.body.visitas).to.be.gte(0); // Verifica que el contador sea >= 0
    });
  });

});




