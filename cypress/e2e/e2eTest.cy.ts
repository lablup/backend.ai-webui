import '../commands/LoginPage.cy';
import '../commands/UserDropdown.cy';

describe('Initial cypress E2E test', () => {
  beforeEach(() => {
    cy.viewport(1280,800);
    cy.visit('http://localhost:9081'); //방문할 페이지
  });

  it('user profile change test', () => {
    cy.login("test2@lablup.com", "test123!").then(() => {
      cy.wait(4000);
      cy.userProfileChange("test2222", "test123!", "test123@").then(() =>{
        cy.logout().then(() => {
          cy.login("test2@lablup.com", "test123@");
        });
      })
    });
  });
});