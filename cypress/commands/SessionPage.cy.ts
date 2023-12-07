import { findShadowRoot } from '../helper/FindShadowRoot.cy';

Cypress.Commands.add(
  'launchSession',
  (
    environmnet: string,
    architecture: string,
    mountVfolderName: string,
    sessionName: string,
  ) => {
    findShadowRoot('backend-ai-webui').find('#session').click();
    cy.wait(400);
    const launchDialogOpenButton = findShadowRoot(
      'backend-ai-webui > backend-ai-session-view > backend-ai-session-launcher',
    ).find('#launch-session');
    launchDialogOpenButton.click();

    const versionSelect = findShadowRoot(
      'backend-ai-webui > backend-ai-session-view > backend-ai-session-launcher',
    ).find('#version');
    const selectedVersion = findShadowRoot(
      'backend-ai-webui > backend-ai-session-view > backend-ai-session-launcher',
    ).find(`mwc-list-item[id=${environmnet}][architecture=${architecture}]`);
    const sessionNameInput = findShadowRoot(
      'backend-ai-webui > backend-ai-session-view > backend-ai-session-launcher > #session-name',
    ).find('input');
    const nextButton = findShadowRoot(
      'backend-ai-webui > backend-ai-session-view > backend-ai-session-launcher',
    ).find('#next-button');
    const launchButton = findShadowRoot(
      'backend-ai-webui > backend-ai-session-view > backend-ai-session-launcher',
    ).find('#launch-button');
    versionSelect.click();
    cy.wait(500);
    selectedVersion.click();
    cy.wait(500);
    sessionNameInput.clear().type(sessionName);
    cy.wait(500);
    nextButton.click();
    cy.wait(500);
    const mountVfolder = findShadowRoot(
      'backend-ai-webui > backend-ai-session-view > backend-ai-session-launcher',
    )
      .find('#non-auto-mounted-folder-grid')
      .find(`div:contains(${mountVfolderName})`);
    mountVfolder.click();
    cy.wait(500);
    nextButton.click();
    cy.wait(500);
    const resourceGroupExtension = findShadowRoot(
      'backend-ai-webui > backend-ai-session-view > backend-ai-session-launcher',
    ).find('lablup-expansion[name="resource-group"]');
    const ramResourceInput = findShadowRoot(
      'backend-ai-webui > backend-ai-session-view > backend-ai-session-launcher > #mem-resource > #textfield',
    ).find('input');
    resourceGroupExtension.click();
    ramResourceInput.clear().type(2);
    nextButton.click();
    cy.wait(500);
    launchButton.click();
    cy.wait(10000);
    const appDialog = findShadowRoot(
      'backend-ai-webui > backend-ai-app-launcher > #app-dialog',
    ).find('mwc-icon-button[icon="close"]');
    appDialog.click();
    const sessionStatus = findShadowRoot(
      'backend-ai-webui > backend-ai-session-view > backend-ai-session-list',
    ).find(`#${sessionName}-status`);
    sessionStatus.should('exist');
  },
);

Cypress.Commands.add('deleteSession', (sessionName: string) => {
  findShadowRoot('backend-ai-webui').find('#session').click();
  cy.wait(400);
  const terminateDialogOpenButton = findShadowRoot(
    'backend-ai-webui > backend-ai-session-view > backend-ai-session-list',
  ).find(`#${sessionName}-power`);
  const deleteButton = findShadowRoot(
    'backend-ai-webui > backend-ai-session-view > backend-ai-session-list',
  )
    .find('#terminate-session-dialog')
    .find('mwc-button[class="ok"]');
  const finishedTab = findShadowRoot(
    'backend-ai-webui > backend-ai-session-view',
  ).find('mwc-tab[title="finished"]');
  terminateDialogOpenButton.click();
  deleteButton.click();
  cy.wait(5000);
  finishedTab.click();
  cy.wait(5000);
  findShadowRoot(
    'backend-ai-webui > backend-ai-session-view > backend-ai-session-list',
  )
    .find(`#${sessionName}-status`)
    .contains('TERMINATED');
});
