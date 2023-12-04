import { t } from 'testcafe';

import { ShadowSelector } from './helper';


class VFolderAddDialog {
  constructor() {
    this.newFolderButton = ShadowSelector('backend-ai-webui > backend-ai-data-view > #add-folder').find('button');
    this.folderNameInput = ShadowSelector('backend-ai-webui > backend-ai-data-view > #add-folder-name').find('input');
    this.confirmButton = ShadowSelector('backend-ai-webui > backend-ai-data-view > #add-button').find('button');
  }

  async open() {
    await t.click(this.newFolderButton);
  }

  async create(name, host, type) {
    // TODO: how to choose host and type dropdown?
    const vfolderControls = ShadowSelector('backend-ai-webui > backend-ai-data-view > backend-ai-storage-list').find(`#controls[folder-name="${name}"]`);
    await t
      .typeText(this.folderNameInput, name)
      .click(this.confirmButton)
      .expect(vfolderControls.exists).ok();
  }
}

class VFolderDeleteDialog {
  constructor() {
    this.folderNameInput = ShadowSelector('backend-ai-webui > backend-ai-data-view > backend-ai-storage-list > #delete-folder-name').find('input');
    this.confirmButton = ShadowSelector('backend-ai-webui > backend-ai-data-view > backend-ai-storage-list > #delete-button').find('button');
  }

  async open(name) {
    const vfolderControls = ShadowSelector('backend-ai-webui > backend-ai-data-view > backend-ai-storage-list').find(`#controls[folder-name="${name}"]`);
    const deleteButton = vfolderControls.child("mwc-icon-button[icon='delete']");
    await t.click(deleteButton);
  }

  async delete(name) {
    const folderControls = ShadowSelector('backend-ai-webui > backend-ai-data-view > backend-ai-storage-list').find(`#controls[folder-name="${name}"]`);
    await t
      .typeText(this.folderNameInput, name)
      .click(this.confirmButton)
      .expect(folderControls.exists).ok();
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
