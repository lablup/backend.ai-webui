import {findShadowRoot} from '../helper/FindShadowRoot.cy';

Cypress.Commands.add('createVfolder', (vfolderName: string) => {
  findShadowRoot('backend-ai-webui').find('#data').click();
  cy.wait(400);
  const createVfolderDialog = findShadowRoot('backend-ai-webui > backend-ai-data-view').find('#add-folder');
  const vfolderNameInput = findShadowRoot('backend-ai-webui > backend-ai-data-view > #add-folder-name').find('input');
  const createButton = findShadowRoot('backend-ai-webui > backend-ai-data-view').find('#add-button');
  createVfolderDialog.click();
  vfolderNameInput.type(vfolderName);
  createButton.click();
  cy.wait(5000);
  findShadowRoot('backend-ai-webui > backend-ai-data-view > backend-ai-storage-list')
    .find(`#controls[folder-name=${vfolderName}]`)
    .should('exist');
});