import {ClientFunction, Selector, t} from 'testcafe';

import {JSAction, ShadowSelector} from './helper';


class VFolderAddDialog {
  constructor() {
    this.dialog = ShadowSelector('backend-ai-webui > backend-ai-data-view > #add-folder-dialog');
    this.newFolderButton = ShadowSelector('backend-ai-webui > backend-ai-data-view > #add-folder');
    this.folderNameInput = ShadowSelector('backend-ai-webui > backend-ai-data-view > #add-folder-name > paper-input-container');
    this.confirmButton = ShadowSelector('backend-ai-webui > backend-ai-data-view > #add-button');
  }

  async open() {
    await t.click(this.newFolderButton);
  }

  async create(name, host, type) {
    // TODO: how to choose host and type dropdown?
    const folderControls = ShadowSelector(`backend-ai-webui > backend-ai-data-view > #controls[folder-id="${name}"]`);
    await t
      .typeText(this.folderNameInput, name)
      .click(this.confirmButton)
      .expect(folderControls.exists).ok();
  }
}

class VFolderDeleteDialog {
  constructor() {
    this.dialog = ShadowSelector('backend-ai-webui > backend-ai-data-view > #delete-folder-dialog');
    this.folderNameInput = ShadowSelector('backend-ai-webui > backend-ai-data-view > #delete-folder-name > paper-input-container');
    this.confirmButton = ShadowSelector('backend-ai-webui > backend-ai-data-view > #delete-button');
  }

  async open(name) {
    const deleteButton = ShadowSelector(`backend-ai-webui > backend-ai-data-view > #controls[folder-id="${name}"]`).child('paper-icon-button[icon="delete"]');
    await t
      // .click(deleteButton);
      .expect(JSAction.click(deleteButton)).ok()
  }

  async delete(name) {
    const folderControls = ShadowSelector(`backend-ai-webui > backend-ai-data-view > #controls[folder-id="${name}"]`);
    await t
      .typeText(this.folderNameInput, name)
      .click(this.confirmButton)
      .expect(folderControls.exists).notOk();
  }
}

class VFolderPage {
  constructor() {
    this.addDialog = new VFolderAddDialog();
    this.deleteDialog = new VFolderDeleteDialog();
  }

  async createFolder(name, host='local', type='user') {
    await this.addDialog.open();
    await this.addDialog.create(name, host, type)
  }

  async deleteFolder(name) {
    await this.deleteDialog.open(name);
    await this.deleteDialog.delete(name);
  }

  async checkVFolderExistence(name) {
    const folderControls = ShadowSelector(`backend-ai-webui > backend-ai-data-view > #controls[folder-id="${name}"]`);
    await t.expect(folderControls.exists).ok();
  }
}

export default new VFolderPage();
