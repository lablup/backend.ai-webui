import { findShadowRoot } from '../helper/FindShadowRoot.cy';

Cypress.Commands.add(
  'launchSession',
  (
    environmnet: string,
    architecture: string,
    sessionName: string,
    mountVfolderName: string,
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
    sessionNameInput.clear().type(sessionName);
    nextButton.click();
    const mountVfolder = findShadowRoot(
      'backend-ai-webui > backend-ai-session-view > backend-ai-session-launcher',
    )
      .find('#non-auto-mounted-folder-grid')
      .find(`div:contains(${mountVfolderName})`);
    mountVfolder.click();
    nextButton.click();
    const resourceGroupExtension = findShadowRoot(
      'backend-ai-webui > backend-ai-session-view > backend-ai-session-launcher',
    ).find('lablup-expansion[name="resource-group"]');
    const ramResourceInput = findShadowRoot(
      'backend-ai-webui > backend-ai-session-view > backend-ai-session-launcher > #mem-resource > #textfield',
    ).find('input');
    resourceGroupExtension.click();
    ramResourceInput.clear().type(2);
    nextButton.click();
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
});
