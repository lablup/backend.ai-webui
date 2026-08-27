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
    return this.page.getByRole('button', { name: 'Table Settings' });
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
    // The filter chip's close affordance is a button labeled "Close" (not an
    // icon-only `img` role) as of the row-action UI refresh in FR-3331.
    const closeButton = this.page
      .getByRole('button', { name: 'Close' })
      .first();
    await closeButton.click();
  }

  // ── Row actions ──────────────────────────────────────────────────────────

  getSettingButtonForRow(name: string): Locator {
    // The row edit action is a lucide `SquarePenIcon` (FR-3331) with the
    // action title exposed as the button's `aria-label` by BAINameActionCell,
    // so it can be targeted by its accessible name.
    return this.getRowByName(name).getByRole('button', {
      name: 'Edit',
      exact: true,
    });
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
    // The VFolder picker is Astryx `ComplexSelector` (`aria-haspopup="dialog"`),
    // which renders role="button" (not "combobox") with its accessible name
    // taken from the field label via `aria-labelledby`.
    return this.getCreateModal().getByRole('button', {
      name: 'Model Storage Folder',
    });
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
    // The "+" button is next to the Model Storage Folder select. It carries
    // no explicit label, so `BAIButton` falls back to its generic icon-only
    // placeholder accessible name (`general.button.Action` -> "Action",
    // packages/backend.ai-ui/src/components/BAIButton.tsx). Scoping to that
    // name (rather than a bare `getByRole('button')`) disambiguates it from
    // the VFolder select's own trigger button, which sits in the same form
    // item and is named after the field label ("Model Storage Folder").
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
      .locator('[data-bai-form-item]')
      .filter({ hasText: 'Model Storage Folder' })
      .getByRole('button', { name: 'Action', exact: true });

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
      .locator('[data-bai-form-item]')
      .filter({ hasText: 'Folder name' })
      .getByRole('textbox')
      .fill(folderName);
    await folderDialog
      .getByRole('button', { name: 'Create', exact: true })
      .click();
    await expect(folderDialog).toBeHidden({ timeout: 15000 });

    // After folder dialog closes, the onRequestClose handler calls setFieldsValue and
    // vfolderSelectRef.current?.refetch(). Due to a known issue where the GlobalID type
    // mismatch can cause the form value to not map to a valid UUID for the mutation, we
    // re-open the VFolder dropdown and explicitly select the newly-created folder by name.
    // This ensures the form field has the correct VirtualFolderNode GlobalID value.
    const vfolderFormItem = modal
      .locator('[data-bai-form-item]')
      .filter({ hasText: 'Model Storage Folder' });
    // The picker is Astryx `ComplexSelector`: its trigger is role="button"
    // (named after the field label via `aria-labelledby`), and opening it
    // pops a nested role="dialog" (also named after the field label)
    // containing a search box and a role="listbox" of role="option" rows.
    const vfolderTrigger = vfolderFormItem.getByRole('button', {
      name: 'Model Storage Folder',
    });

    // Wait briefly for the refetch to complete before re-opening the dropdown
    await expect(vfolderTrigger).toBeVisible({ timeout: 15000 });

    // Re-open the dropdown to ensure the correct option is selected by name
    await vfolderTrigger.click();
    const dropdown = this.page.getByRole('dialog', {
      name: 'Model Storage Folder',
    });
    await expect(dropdown).toBeVisible({ timeout: 10000 });
    // Wait for the refetched options to load (the new folder should appear)
    await expect(dropdown.getByRole('option').first()).toBeVisible({
      timeout: 15000,
    });
    // Click the option matching the folder name
    await dropdown
      .getByRole('option', { name: folderName, exact: true })
      .click();
    // Wait for dropdown to close
    await expect(dropdown).toBeHidden({ timeout: 10000 });
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
      // The picker is Astryx `ComplexSelector` — its role="button" trigger
      // (named after the field label) opens a nested role="dialog" holding a
      // search box and a role="listbox" of role="option" rows.
      const vfolderFormItem = modal
        .locator('[data-bai-form-item]')
        .filter({ hasText: 'Model Storage Folder' });
      const vfolderTrigger = vfolderFormItem.getByRole('button', {
        name: 'Model Storage Folder',
      });
      await vfolderTrigger.click();
      // Wait for the VFolder query to load options (BAIVFolderSelect uses network-only fetch on open)
      const dropdown = this.page.getByRole('dialog', {
        name: 'Model Storage Folder',
      });
      await expect(dropdown).toBeVisible({ timeout: 10000 });
      // Wait for the first option to be visible, indicating the options have loaded.
      await expect(dropdown.getByRole('option').first()).toBeVisible({
        timeout: 10000,
      });
      if (fields.vfolderTitle) {
        await dropdown
          .getByRole('option', { name: fields.vfolderTitle, exact: true })
          .click();
      } else {
        await dropdown.getByRole('option').first().click();
      }
      // Wait for VFolder dropdown to fully close before interacting with other fields
      await expect(dropdown).toBeHidden();
    }

    if (fields.author) {
      // In antd v6, Form.Item tooltip icons contribute to the accessible name.
      // Use the form item container to locate the textbox by label text instead.
      await modal
        .locator('[data-bai-form-item]')
        .filter({ hasText: 'Author' })
        .getByRole('textbox')
        .fill(fields.author);
    }
    if (fields.title) {
      await modal
        .locator('[data-bai-form-item]')
        .filter({ hasText: 'Title' })
        .getByRole('textbox')
        .fill(fields.title);
    }
    if (fields.modelVersion) {
      await modal
        .locator('[data-bai-form-item]')
        .filter({ hasText: 'Model Version' })
        .getByRole('textbox')
        .fill(fields.modelVersion);
    }
    if (fields.description) {
      await modal
        .locator('[data-bai-form-item]')
        .filter({ hasText: 'Description' })
        .getByRole('textbox')
        .fill(fields.description);
    }
    if (fields.task) {
      await modal
        .locator('[data-bai-form-item]')
        .filter({ hasText: 'Task' })
        .getByRole('textbox')
        .fill(fields.task);
    }
    if (fields.category) {
      await modal
        .locator('[data-bai-form-item]')
        .filter({ hasText: 'Category' })
        .getByRole('textbox')
        .fill(fields.category);
    }
    if (fields.architecture) {
      await modal
        .locator('[data-bai-form-item]')
        .filter({ hasText: 'Architecture' })
        .getByRole('textbox')
        .fill(fields.architecture);
    }
    if (fields.license) {
      await modal
        .locator('[data-bai-form-item]')
        .filter({ hasText: 'License' })
        .getByRole('textbox')
        .fill(fields.license);
    }
    if (fields.readme) {
      await modal
        .locator('[data-bai-form-item]')
        .filter({ hasText: 'README.md' })
        .getByRole('textbox')
        .fill(fields.readme);
    }
    // Access Level is required — select specified value or default to 'Private' (INTERNAL)
    const accessLevel = fields.accessLevel ?? 'Private';
    // Access Level is a plain Astryx `Selector` (role="combobox" trigger,
    // role="listbox"/"option" popup) — unlike the VFolder `ComplexSelector`.
    await modal
      .locator('[data-bai-form-item]')
      .filter({ hasText: 'Access Level' })
      .getByRole('combobox')
      .click();
    await this.page
      .getByRole('option', { name: accessLevel, exact: true })
      .click();
  }

  // ── Edit Modal helpers ───────────────────────────────────────────────────

  getEditModalNameInput(): Locator {
    return this.getEditModal().getByRole('textbox', { name: 'Name' });
  }

  getEditModalSaveButton(): Locator {
    return this.getEditModal().getByRole('button', { name: 'Save' });
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
