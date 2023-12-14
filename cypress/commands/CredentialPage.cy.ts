import { findShadowRoot } from '../helper/FindShadowRoot.cy';

Cypress.Commands.add(
  'addUser',
  (email: string, userName: string, password: string) => {
    findShadowRoot('backend-ai-webui').find('#credential').click();
    cy.wait(1000);
    const addUserButton = findShadowRoot(
      'backend-ai-webui > backend-ai-credential-view',
    ).find('#add-user');
    const userEmailInput = findShadowRoot(
      'backend-ai-webui > backend-ai-credential-view > #id_user_email',
    ).find('input');
    const userNameInput = findShadowRoot(
      'backend-ai-webui > backend-ai-credential-view > #id_user_name',
    ).find('input');
    const passwordInput = findShadowRoot(
      'backend-ai-webui > backend-ai-credential-view > #id_user_password',
    ).find('input');
    const confirmPasswordInput = findShadowRoot(
      'backend-ai-webui > backend-ai-credential-view > #id_user_confirm',
    ).find('input');
    const createUserButton = findShadowRoot(
      'backend-ai-webui > backend-ai-credential-view',
    ).find('#create-user-button');
    const credentialsTab = findShadowRoot(
      'backend-ai-webui > backend-ai-credential-view',
    ).find('#mdc-tab-2');
    addUserButton.click();
    cy.wait(500);
    userEmailInput.type(email);
    cy.wait(500);
    userNameInput.type(userName);
    cy.wait(500);
    passwordInput.type(password);
    cy.wait(500);
    confirmPasswordInput.type(password);
    cy.wait(500);
    createUserButton.click();
    cy.wait(2000);
    findShadowRoot(
      'backend-ai-webui > backend-ai-credential-view > #active-user-list',
    )
      .find('vaadin-grid-cell-content')
      .filter(`:contains(${email})`)
      .should('exist');
    credentialsTab.click();
    cy.wait(500);
    findShadowRoot(
      'backend-ai-webui > backend-ai-credential-view > #active-credential-list',
    )
      .find('vaadin-grid-cell-content')
      .filter(`:contains(${email})`)
      .should('exist');
  },
);

Cypress.Commands.add('deleteUser', (email: string) => {
  findShadowRoot('backend-ai-webui').find('#credential').click();
  cy.wait(1000);
  const userTab = findShadowRoot(
    'backend-ai-webui > backend-ai-credential-view',
  ).find('#mdc-tab-1');
  const deleteUserButton = findShadowRoot(
    'backend-ai-webui > backend-ai-credential-view > #active-user-list',
  )
    .find(`div[user-id="${email}"]`)
    .find('mwc-icon-button[icon="delete_forever"]');
  const agreeButton = findShadowRoot(
    'backend-ai-webui > backend-ai-credential-view > #active-user-list',
  ).find('#deleteOk');
  const userInactiveSubTab = findShadowRoot(
    'backend-ai-webui > backend-ai-credential-view',
  ).find('#mdc-tab-5');
  const credentialsTab = findShadowRoot(
    'backend-ai-webui > backend-ai-credential-view',
  ).find('#mdc-tab-2');
  const credentialInactiveSubTab = findShadowRoot(
    'backend-ai-webui > backend-ai-credential-view',
  ).find('#mdc-tab-7');
  userTab.click();
  cy.wait(500);
  deleteUserButton.click();
  cy.wait(500);
  agreeButton.click();
  cy.wait(2000);
  findShadowRoot(
    'backend-ai-webui > backend-ai-credential-view > #active-user-list',
  )
    .find('vaadin-grid-cell-content')
    .filter(`:contains(${email})`)
    .should('not.exist');
  userInactiveSubTab.click();
  cy.wait(500);
  findShadowRoot(
    'backend-ai-webui > backend-ai-credential-view > #inactive-user-list',
  )
    .find('vaadin-grid-cell-content')
    .filter(`:contains(${email})`)
    .should('exist');
  credentialsTab.click();
  cy.wait(500);
  credentialInactiveSubTab.click();
  cy.wait(500);
  findShadowRoot(
    'backend-ai-webui > backend-ai-credential-view > #inactive-credential-list',
  )
    .find('vaadin-grid-cell-content')
    .filter(`:contains(${email})`)
    .should('exist');
  /*
  const userEmailInput = findShadowRoot(
    'backend-ai-webui > backend-ai-credential-view > #id_user_email',
  ).find('input');
  const userNameInput = findShadowRoot(
    'backend-ai-webui > backend-ai-credential-view > #id_user_name',
  ).find('input');
  const passwordInput = findShadowRoot(
    'backend-ai-webui > backend-ai-credential-view > #id_user_password',
  ).find('input');
  const confirmPasswordInput = findShadowRoot(
    'backend-ai-webui > backend-ai-credential-view > #id_user_confirm',
  ).find('input');
  const createUserButton = findShadowRoot(
    'backend-ai-webui > backend-ai-credential-view',
  ).find('#create-user-button');
  addUserButton.click();
  cy.wait(500);
  userEmailInput.type(email);
  cy.wait(500);
  userNameInput.type(userName);
  cy.wait(500);
  passwordInput.type(password);
  cy.wait(500);
  confirmPasswordInput.type(password);
  cy.wait(500);
  createUserButton.click();
  cy.wait(2000);
  findShadowRoot(
    'backend-ai-webui > backend-ai-credential-view > #active-user-list',
  )
    .find('vaadin-grid-cell-content')
    .filter(`:contains(${email})`)
    .should('exist');
  findShadowRoot('backend-ai-webui > backend-ai-credential-view')
    .find('#mdc-tab-2')
    .click();
  cy.wait(500);
  findShadowRoot(
    'backend-ai-webui > backend-ai-credential-view > backend-ai-credential-list',
  )
    .find('vaadin-grid-cell-content')
    .filter(`:contains(${email})`)
    .should('exist');
    */
});
