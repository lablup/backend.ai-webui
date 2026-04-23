// e2e/utils/classes/AdminModelCardPage.ts
import { webuiEndpoint } from '../test-util';
import { expect, Locator, Page } from '@playwright/test';

/**
 * Page Object Model for the Admin Model Card Management page.
 * Route: /admin-serving?tab=model-store
 * Requires: superadmin login
 */
export class AdminModelCardPage {
  readonly page: Page;
  readonly url: string;

  constructor(page: Page) {
    this.page = page;
    this.url = `${webuiEndpoint}/admin-serving?tab=model-store`;
  }

  // ── Navigation ──────────────────────────────────────────────────────────

  async goto(): Promise<void> {
    await this.page.goto(this.url);
    await this.waitForTableLoad();
  }

  async waitForTableLoad(): Promise<void> {
    await this.getCreateModelCardButton().waitFor({ state: 'visible' });
  }

  // ── Table locators ───────────────────────────────────────────────────────

  getTable(): Locator {
    return this.page.locator('table');
  }

  getDataRows(): Locator {
    return this.page.locator(
      'tbody tr:not(.ant-table-measure-row):not(.ant-table-placeholder)',
    );
  }

  private escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  getRowByName(name: string): Locator {
    return this.page.getByRole('row', {
      name: new RegExp(this.escapeRegExp(name)),
    });
  }

  getPaginationInfo(): Locator {
    return this.page.getByText(/\d+ - \d+ of \d+ items/);
  }

  // ── Toolbar / actions ────────────────────────────────────────────────────

  getCreateModelCardButton(): Locator {
    return this.page.getByRole('button', { name: 'Create Model Card' });
  }

  getRefreshButton(): Locator {
    return this.page.getByRole('button', { name: 'reload' });
  }

  getColumnSettingsButton(): Locator {
    return this.page
      .locator('.ant-table-footer')
      .getByRole('button', { name: 'setting' });
  }

  // ── Filter ───────────────────────────────────────────────────────────────

  getFilterSearchInput(): Locator {
    return this.page.getByRole('combobox', { name: 'Search' });
  }

  getFilterSearchButton(): Locator {
    return this.page.getByRole('button', { name: 'search' });
  }

  async applyNameFilter(value: string): Promise<void> {
    await this.getFilterSearchInput().fill(value);
    await this.getFilterSearchButton().click();
    await this.page.waitForURL(new RegExp(`filter=`));
  }

  async clearFilter(): Promise<void> {
    const closeIcon = this.page.getByRole('img', { name: 'Close' }).first();
    await closeIcon.click();
  }

  // ── Row actions ──────────────────────────────────────────────────────────

  getSettingButtonForRow(name: string): Locator {
    return this.getRowByName(name).getByRole('button', { name: 'setting' });
  }

  getTrashButtonForRow(name: string): Locator {
    return this.getRowByName(name).getByRole('button', { name: 'trash bin' });
  }

  async openEditModal(name: string): Promise<void> {
    await this.getSettingButtonForRow(name).click();
    await expect(this.getEditModal()).toBeVisible();
  }

  async clickDeleteForRow(name: string): Promise<void> {
    await this.getTrashButtonForRow(name).click();
    await expect(this.getDeleteConfirmDialog()).toBeVisible();
  }

  // ── Bulk selection ───────────────────────────────────────────────────────

  getHeaderCheckbox(): Locator {
    return this.page.getByRole('checkbox', { name: 'Select all' });
  }

  getRowCheckbox(name: string): Locator {
    return this.getRowByName(name).getByRole('checkbox');
  }

  getSelectionLabel(): Locator {
    return this.page.getByText(/\d+ selected/);
  }

  getBulkDeleteButton(): Locator {
    // Trash bin button in the toolbar area (sibling of the selection label, not inside table rows)
    return this.page
      .getByText(/\d+ selected/)
      .locator('..')
      .locator('..')
      .getByRole('button', { name: 'trash bin' });
  }

  // ── Modals ───────────────────────────────────────────────────────────────

  getCreateModal(): Locator {
    return this.page.getByRole('dialog', { name: 'Create Model Card' });
  }

  getEditModal(): Locator {
    return this.page.getByRole('dialog', { name: 'Edit Model Card' });
  }

  getDeleteConfirmDialog(): Locator {
    return this.page.getByRole('dialog', { name: 'Delete Model Card' });
  }

  getBulkDeleteConfirmDialog(): Locator {
    return this.page.getByRole('dialog', { name: 'Delete Model Cards' });
  }

  // ── Create Modal helpers ─────────────────────────────────────────────────

  getCreateModalNameInput(): Locator {
    return this.getCreateModal().getByRole('textbox', { name: 'Name' });
  }

  getCreateModalVFolderSelect(): Locator {
    return this.getCreateModal().getByRole('combobox').first();
  }

  getCreateModalSubmitButton(): Locator {
    return this.getCreateModal().getByRole('button', {
      name: 'Create',
      exact: true,
    });
  }

  getCreateModalCancelButton(): Locator {
    return this.getCreateModal()
      .getByRole('button', { name: 'Cancel', exact: true })
      .last();
  }

  getFolderCreateDialog(): Locator {
    return this.page.getByRole('dialog', {
      name: 'Create a new storage folder',
    });
  }

  async createNewFolderViaPlus(folderName: string): Promise<void> {
    const modal = this.getCreateModal();
    // The "+" button is next to the Model Storage Folder select.
    // It has no accessible name (icon-only button with PlusIcon from lucide-react),
    // so we locate it by finding the button within the "Model Storage Folder" form item.
    await modal
      .locator('.ant-form-item')
      .filter({ hasText: 'Model Storage Folder' })
      .getByRole('button')
      .click();

    // After clicking "+", either:
    //   (a) a Popconfirm appears asking to "Change Project" first, or
    //   (b) the FolderCreateModal opens directly (project is already model-store).
    // Wait for whichever appears first so the direct-open path doesn't always pay
    // the full Popconfirm timeout. If the Popconfirm branch appears, click it and
    // then continue waiting for the folder dialog.
    const folderDialog = this.getFolderCreateDialog();
    const changeProjectButton = this.page.getByRole('button', {
      name: 'Change Project',
    });

    await expect(changeProjectButton.or(folderDialog)).toBeVisible({
      timeout: 5000,
    });

    if (await changeProjectButton.isVisible()) {
      await changeProjectButton.click();
    }

    await expect(folderDialog).toBeVisible({ timeout: 15000 });

    // initialValidate={true} calls validateFields() in afterOpenChange, which triggers
    // a re-render. Soft wait for the "required" error — it's not guaranteed to appear
    // before we fill, so we don't fail the test if it's absent.
    await expect(folderDialog.getByText('Folder name is required'))
      .toBeVisible({ timeout: 5000 })
      .catch(() => {});
    await folderDialog
      .locator('.ant-form-item')
      .filter({ hasText: 'Folder name' })
      .getByRole('textbox')
      .fill(folderName);
    await folderDialog
      .getByRole('button', { name: 'Create', exact: true })
      .click();
    await expect(folderDialog).toBeHidden({ timeout: 15000 });

    // onRequestClose asynchronously sets `vfolderId` in the Create Model Card form and
    // triggers a BAIVFolderSelect refetch. Assert the VFolder select reflects the
    // newly created folder name before proceeding so downstream submit steps don't
    // race the refetch.
    // In antd v6 with BAISelect, the selected value text is rendered directly inside
    // .ant-select-content (which gains .ant-select-content-has-value when a value is set).
    await expect(
      modal
        .locator('.ant-form-item')
        .filter({ hasText: 'Model Storage Folder' })
        .locator('.ant-select-content'),
    ).toContainText(folderName, { timeout: 15000 });
  }

  async fillCreateModal(fields: {
    name: string;
    vfolderTitle?: string;
    createNewFolderName?: string;
    author?: string;
    title?: string;
    modelVersion?: string;
    description?: string;
    task?: string;
    category?: string;
    architecture?: string;
    license?: string;
    readme?: string;
    accessLevel?: 'Public' | 'Private';
  }): Promise<void> {
    const modal = this.getCreateModal();
    await expect(modal).toBeVisible();

    await modal.getByRole('textbox', { name: 'Name' }).fill(fields.name);

    if (fields.createNewFolderName) {
      // Create a new folder via the "+" button — it will be auto-selected after creation
      await this.createNewFolderViaPlus(fields.createNewFolderName);
    } else {
      // Select an existing VFolder: use specified title or pick the first available option.
      // In antd v6 with BAISelect, clicking the .ant-select-content container reliably
      // opens the dropdown (clicking the raw combobox input does not open it).
      const vfolderFormItem = modal
        .locator('.ant-form-item')
        .filter({ hasText: 'Model Storage Folder' });
      await vfolderFormItem.locator('.ant-select-content').click();
      // Wait for the VFolder query to load options (BAIVFolderSelect uses network-only fetch on open)
      const dropdown = this.page
        .locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)')
        .first();
      await expect(dropdown).toBeVisible({ timeout: 10000 });
      // Wait for the "Total N items" footer to appear, indicating options have loaded
      await expect(dropdown.getByText(/Total \d+ items/)).toBeVisible({
        timeout: 10000,
      });
      if (fields.vfolderTitle) {
        await dropdown.getByTitle(fields.vfolderTitle).click();
      } else {
        await dropdown.locator('.ant-select-item-option').first().click();
      }
      // Wait for VFolder dropdown to fully close before interacting with other fields
      await expect(dropdown).toBeHidden();
    }

    if (fields.author) {
      // In antd v6, Form.Item tooltip icons contribute to the accessible name.
      // Use the form item container to locate the textbox by label text instead.
      await modal
        .locator('.ant-form-item')
        .filter({ hasText: 'Author' })
        .getByRole('textbox')
        .fill(fields.author);
    }
    if (fields.title) {
      await modal
        .locator('.ant-form-item')
        .filter({ hasText: 'Title' })
        .getByRole('textbox')
        .fill(fields.title);
    }
    if (fields.modelVersion) {
      await modal
        .locator('.ant-form-item')
        .filter({ hasText: 'Model Version' })
        .getByRole('textbox')
        .fill(fields.modelVersion);
    }
    if (fields.description) {
      await modal
        .locator('.ant-form-item')
        .filter({ hasText: 'Description' })
        .getByRole('textbox')
        .fill(fields.description);
    }
    if (fields.task) {
      await modal
        .locator('.ant-form-item')
        .filter({ hasText: 'Task' })
        .getByRole('textbox')
        .fill(fields.task);
    }
    if (fields.category) {
      await modal
        .locator('.ant-form-item')
        .filter({ hasText: 'Category' })
        .getByRole('textbox')
        .fill(fields.category);
    }
    if (fields.architecture) {
      await modal
        .locator('.ant-form-item')
        .filter({ hasText: 'Architecture' })
        .getByRole('textbox')
        .fill(fields.architecture);
    }
    if (fields.license) {
      await modal
        .locator('.ant-form-item')
        .filter({ hasText: 'License' })
        .getByRole('textbox')
        .fill(fields.license);
    }
    if (fields.readme) {
      await modal
        .locator('.ant-form-item')
        .filter({ hasText: 'README.md' })
        .getByRole('textbox')
        .fill(fields.readme);
    }
    // Access Level is required — select specified value or default to 'Private' (INTERNAL)
    const accessLevel = fields.accessLevel ?? 'Private';
    // In antd v6, use the .ant-select-content to open the dropdown reliably.
    await modal
      .locator('.ant-form-item')
      .filter({ hasText: 'Access Level' })
      .locator('.ant-select-content')
      .click();
    // Ant Design Select renders the dropdown items as a portal outside the modal.
    // Use the visible dropdown portal (not the ARIA-virtual options inside the combobox)
    // to click the correct option.
    await this.page
      .locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)')
      .getByText(accessLevel, { exact: true })
      .click();
  }

  // ── Edit Modal helpers ───────────────────────────────────────────────────

  getEditModalNameInput(): Locator {
    return this.getEditModal().getByRole('textbox', { name: 'Name' });
  }

  getEditModalUpdateButton(): Locator {
    return this.getEditModal().getByRole('button', { name: 'Update' });
  }

  getEditModalCancelButton(): Locator {
    return this.getEditModal().getByRole('button', { name: 'Cancel' });
  }

  // ── Delete Confirm Dialog helpers ────────────────────────────────────────

  getDeleteConfirmInput(): Locator {
    return this.getDeleteConfirmDialog().getByRole('textbox');
  }

  getDeleteConfirmButton(): Locator {
    return this.getDeleteConfirmDialog().getByRole('button', {
      name: 'Delete',
    });
  }

  getDeleteCancelButton(): Locator {
    return this.getDeleteConfirmDialog().getByRole('button', {
      name: 'Cancel',
    });
  }

  getAlsoDeleteFolderCheckbox(): Locator {
    return this.getDeleteConfirmDialog().getByRole('checkbox').first();
  }

  getFolderNameLinkInDeleteDialog(): Locator {
    return this.getDeleteConfirmDialog().getByRole('link').first();
  }

  // ── Helper: create via UI and return ─────────────────────────────────────

  async createModelCard(fields: {
    name: string;
    vfolderTitle?: string;
    createNewFolderName?: string;
  }): Promise<void> {
    await this.getCreateModelCardButton().click();
    await expect(this.getCreateModal()).toBeVisible();
    await this.fillCreateModal(fields);
    await this.getCreateModalSubmitButton().click();
    await expect(
      this.page.getByText('Model card has been created.'),
    ).toBeVisible({ timeout: 15000 });
    await expect(this.getCreateModal()).toBeHidden();
  }

  async deleteModelCardByName(name: string): Promise<void> {
    await this.clickDeleteForRow(name);
    await this.getDeleteConfirmInput().fill(name);
    await this.getDeleteConfirmButton().click();
    await expect(
      this.page.getByText(/Model card has been deleted/),
    ).toBeVisible({ timeout: 30000 });
  }
}
