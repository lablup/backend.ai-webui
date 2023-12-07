import { findShadowRoot } from '../helper/FindShadowRoot.cy';

Cypress.Commands.add('createVfolder', (vfolderName: string) => {
  findShadowRoot('backend-ai-webui').find('#data').click();
  cy.wait(400);
  const createDialogOpenButton = findShadowRoot(
    'backend-ai-webui > backend-ai-data-view',
  ).find('#add-folder');
  const vfolderNameInput = findShadowRoot(
    'backend-ai-webui > backend-ai-data-view > #add-folder-name',
  ).find('input');
  const createButton = findShadowRoot(
    'backend-ai-webui > backend-ai-data-view',
  ).find('#add-button');
  createDialogOpenButton.click();
  vfolderNameInput.type(vfolderName);
  createButton.click();
  cy.wait(5000);
  findShadowRoot(
    'backend-ai-webui > backend-ai-data-view > backend-ai-storage-list',
  )
    .find(`#controls[folder-name=${vfolderName}]`)
    .should('exist');
});

Cypress.Commands.add('deleteVfolder', (vfolderName: string) => {
  findShadowRoot('backend-ai-webui').find('#data').click();
  cy.wait(400);
  const deleteDialogOpenButton = findShadowRoot(
    'backend-ai-webui > backend-ai-data-view > backend-ai-storage-list',
  )
    .find(`#controls[folder-name=${vfolderName}]`)
    .find('mwc-icon-button[icon="delete"]');
  const deleteVfolderNameInput = findShadowRoot(
    'backend-ai-webui > backend-ai-data-view > backend-ai-storage-list > #delete-folder-name',
  ).find('input');
  const deleteButton = findShadowRoot(
    'backend-ai-webui > backend-ai-data-view > backend-ai-storage-list',
  ).find('#delete-button');
  deleteDialogOpenButton.click();
  deleteVfolderNameInput.type(vfolderName);
  deleteButton.click();
  findShadowRoot(
    'backend-ai-webui > backend-ai-data-view > backend-ai-storage-list',
  )
    .find(
      `lablup-shields[folder-name=${vfolderName}][description="deleted-complete"]`,
    )
    .should('exist');
});
