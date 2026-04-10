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

  async fillCreateModal(fields: {
    name: string;
    vfolderTitle?: string;
    author?: string;
    title?: string;
    modelVersion?: string;
    description?: string;
    task?: string;
    category?: string;
    architecture?: string;
    license?: string;
    readme?: string;
    accessLevel?: 'Public' | 'Internal';
  }): Promise<void> {
    const modal = this.getCreateModal();
    await expect(modal).toBeVisible();

    await modal.getByRole('textbox', { name: 'Name' }).fill(fields.name);

    // Always select a VFolder: use specified title or pick the first available option
    await modal.getByRole('combobox').first().click();
    // Wait for the VFolder query to load options (BAIVFolderSelect uses network-only fetch on open)
    const dropdown = this.page
      .locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)')
      .first();
    await expect(dropdown).toBeVisible();
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

    if (fields.author) {
      await modal
        .getByRole('textbox', { name: 'Author (optional)' })
        .fill(fields.author);
    }
    if (fields.title) {
      await modal
        .getByRole('textbox', { name: 'Title (optional)' })
        .fill(fields.title);
    }
    if (fields.modelVersion) {
      await modal
        .getByRole('textbox', { name: 'Model Version (optional)' })
        .fill(fields.modelVersion);
    }
    if (fields.description) {
      await modal
        .getByRole('textbox', { name: 'Description (optional)' })
        .fill(fields.description);
    }
    if (fields.task) {
      await modal
        .getByRole('textbox', { name: 'Task (optional)' })
        .fill(fields.task);
    }
    if (fields.category) {
      await modal
        .getByRole('textbox', { name: 'Category (optional)' })
        .fill(fields.category);
    }
    if (fields.architecture) {
      await modal
        .getByRole('textbox', { name: 'Architecture (optional)' })
        .fill(fields.architecture);
    }
    if (fields.license) {
      await modal
        .getByRole('textbox', { name: 'License (optional)' })
        .fill(fields.license);
    }
    if (fields.readme) {
      await modal
        .getByRole('textbox', { name: 'README.md (optional)' })
        .fill(fields.readme);
    }
    // Access Level is required — select specified value or default to 'Internal'
    const accessLevel = fields.accessLevel ?? 'Internal';
    await modal.getByRole('combobox', { name: 'Access Level' }).click();
    await expect(
      this.page
        .locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)')
        .first(),
    ).toBeVisible();
    await this.page
      .locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)')
      .first()
      .locator('.ant-select-item-option')
      .filter({ hasText: accessLevel })
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

  // ── Helper: create via UI and return ─────────────────────────────────────

  async createModelCard(fields: {
    name: string;
    vfolderTitle?: string;
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
    await this.getDeleteConfirmButton().click();
    await expect(
      this.page.getByText('Model card has been deleted.'),
    ).toBeVisible();
  }
}
