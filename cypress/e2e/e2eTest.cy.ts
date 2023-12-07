import '../commands/LoginPage.cy';
import '../commands/DataStoragePage.cy';
import '../commands/SessionPage.cy';

const generateRandomString = (
  length = 6,
  chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
) => {
  let result = '';
  for (let i = length; i > 0; --i)
    result += chars[Math.floor(Math.random() * chars.length)];
  return result;
};

describe('Initial cypress E2E test', () => {
  beforeEach(() => {
    cy.viewport(1280, 800);
    cy.visit('http://localhost:9081'); //방문할 페이지
  });

  it('localhost E2E test', () => {
    cy.login('test@lablup.com', 'test123!', 'http://127.0.0.1:8090');
    cy.wait(400);
    const vfolderName = generateRandomString();
    const sessionName = generateRandomString();
    cy.createVfolder(vfolderName);
    cy.launchSession(
      '3\\.9-ubuntu20\\.04',
      'aarch64',
      vfolderName,
      sessionName,
    );
    cy.deleteSession(sessionName);
    cy.deleteVfolder(vfolderName);
  });
});
