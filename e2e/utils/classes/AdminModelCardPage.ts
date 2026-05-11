// e2e/utils/classes/AdminModelCardPage.ts
import { webuiEndpoint } from '../test-util';
import { expect, Locator, Page } from '@playwright/test';

/**
 * Page Object Model for the Admin Model Card Management page.
 * Route: /admin-deployments?tab=model-store-management
 * Requires: superadmin login
 */
export class AdminModelCardPage {
  readonly page: Page;
  readonly url: string;

  constructor(page: Page) {
    this.page = page;
    this.url = `${webuiEndpoint}/admin-deployments?tab=model-store-management`;
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
    return this.getRowByName(name).getByRole('button', { name: 'delete' });
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
    // Delete button in the toolbar area (sibling of the selection label, not inside table rows)
    return this.page
      .getByText(/\d+ selected/)
      .locator('..')
      .locator('..')
      .getByRole('button', { name: 'delete' });
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
    // After clicking "+", either:
    //   (a) a Popconfirm appears asking to "Change Project" first, or
    //   (b) the FolderCreateModal opens directly (project is already model-store).
    //
    // Parallel test workers share the admin user's server-side current-project state.
    // A concurrent worker can change the project between our click and the state checks,
    // causing the Popconfirm to appear/disappear unpredictably. We use a retry loop
    // (up to 5 iterations) that handles all combinations:
    //   - Folder dialog → break immediately
    //   - Popconfirm → click "Change Project" (short timeout to fail fast if blocked)
    //     → break (setIsOpenCreateFolderModal was scheduled; waitFor below handles it)
    //   - Click blocked by folder dialog overlay → break if dialog in DOM, else retry
    //   - Neither visible (race condition) → next iteration clicks "+" again
    const folderDialog = this.getFolderCreateDialog();
    const changeProjectButton = this.page.getByRole('button', {
      name: 'Change Project',
    });
    const plusButton = modal
      .locator('.ant-form-item')
      .filter({ hasText: 'Model Storage Folder' })
      .getByRole('button');

    for (let attempt = 0; attempt < 5; attempt++) {
      // Use count() > 0 (DOM presence) rather than isVisible() to detect the folder
      // dialog. isVisible() returns false while the modal's open animation runs (the
      // dialog element has zero bounding-box during the zoom-in animation), but the
      // Popconfirm behind it can still have isVisible() = true because the CSS overlay
      // stacking does not affect CSS visibility. count() > 0 reliably detects the dialog
      // from the moment React renders it — including during animation — and prevents us
      // from clicking "Change Project" or "+" while the dialog is opening on top.
      if ((await folderDialog.count()) > 0) {
        break; // Folder dialog is in DOM (opening or fully open) — wait for it below
      }

      // Click "+" to open the dialog or popconfirm
      await plusButton.click();

      try {
        await expect(changeProjectButton.or(folderDialog)).toBeVisible({
          timeout: 10000,
        });
      } catch {
        continue; // Neither appeared — retry
      }

      if ((await folderDialog.count()) > 0) {
        break; // Folder dialog appeared in DOM (possibly still animating) — wait below
      }

      if (await changeProjectButton.isVisible()) {
        try {
          // Use a short timeout so we fail fast if the folder dialog has appeared
          // between our count() check and now, and its ant-modal-wrap overlay
          // intercepts pointer events before the click lands.
          await changeProjectButton.click({ timeout: 3000 });
          // Clicked successfully. The onConfirm handler scheduled
          // setIsOpenCreateFolderModal(true) via startTransition alongside
          // setCurrentProject. Break here — the waitFor below will wait for
          // the deferred state update to commit and the dialog to appear.
          break;
        } catch {
          // Click was blocked (folder dialog overlay intercepted pointer events)
          // or the button disappeared (another worker changed the project back).
          if ((await folderDialog.count()) > 0) {
            break; // Dialog already in DOM — wait for it below
          }
          // Otherwise, next iteration will click "+" again to retry.
        }
      }
      // If neither button was visible (race: project changed between the "or" check
      // and count/isVisible), the next iteration will click "+" again.
    }

    await expect(folderDialog).toBeVisible({ timeout: 30000 });

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

  getAlsoDeleteFoldersBulkCheckbox(): Locator {
    // The "Also delete the associated model folders" checkbox renders the label
    // as a sibling <span>, not as children of <Checkbox>, so the input has no
    // accessible name. The bulk dialog contains only one checkbox (items list
    // uses role="listitem", confirmText uses textbox), so .first() is safe.
    return this.getBulkDeleteConfirmDialog().getByRole('checkbox').first();
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
    // Under parallel load, fill() may not immediately trigger React's onChange,
    // keeping the Delete button disabled. Wait for it to be enabled before clicking.
    await expect(this.getDeleteConfirmButton()).toBeEnabled({ timeout: 10000 });
    await this.getDeleteConfirmButton().click();
    await expect(
      this.page.getByText(/Model card has been deleted/),
    ).toBeVisible({ timeout: 30000 });
  }
}
