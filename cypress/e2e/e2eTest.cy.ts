import '../commands/LoginPage.cy';
import '../commands/UserDropdown.cy';
import '../commands/DataStoragePage.cy';
import '../commands/SessionPage.cy';

describe('Initial cypress E2E test', () => {
  beforeEach(() => {
    cy.viewport(1280, 800);
    cy.visit('http://localhost:9081'); //방문할 페이지
  });

  it('localhost E2E test', () => {
    cy.login('test2@lablup.com', 'test123!', 'http://127.0.0.1:8090');
    cy.wait(400);
    //cy.createVfolder('test-e2eTest');
    //cy.deleteVfolder('test-e2eTest');
    cy.launchSession('3\\.9-ubuntu20\\.04', 'aarch64', 'test', 'tttt');
  });
});
