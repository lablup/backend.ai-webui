// spec: e2e/.agent-output/test-plan-e2e-coverage-gaps.md
//
// Coverage gap this file fills: e2e/session/session-creation.spec.ts always
// selects the "minimum" resource preset when launching a session, so the
// custom-resource-input path in the launcher's step 2 (Environments &
// Resource allocation) has never been exercised. This file drives that path
// directly without launching a session -- the launcher's review step
// (reached via "Skip to review") is rendered entirely client-side from form
// state and never touches the cluster, so verifying a custom value reaches
// it is a safe, fast way to confirm the custom-resource flow works
// end-to-end within the form. No session is created, so no cleanup is
// needed.
//
// Key findings from live manual verification (deviations from the initial
// assumptions):
// 1. The CPU/Memory/Shared Memory inputs are NOT disabled while a named
//    preset (e.g. "Minimum requirements") is selected -- they are always
//    editable. Typing a new value into any of them automatically switches
//    the "Resource Presets" selector to "Custom allocation", rather than
//    requiring the user to first explicitly pick "Custom allocation" from
//    the dropdown.
// 2. On this account/environment/resource-group combination, every concrete
//    resource preset other than "Minimum requirements" (cpu-only,
//    cuda01-small, cuda02-medium, cuda03-large) renders as a disabled option
//    in the "Resource Presets" dropdown (confirmed live, reopening the
//    dropdown repeatedly, no tooltip explains why). Only "Minimum
//    requirements" is selectable, so the "switch preset -> fields reset"
//    scenario below reselects "Minimum requirements" (reverting a custom
//    edit) rather than a concrete GPU/CPU preset.
import { loginAsAdmin, navigateTo } from '../utils/test-util';
import { getFormItemControlByLabel } from '../utils/test-util-antd';
import { test, expect } from '@playwright/test';

test.describe(
  'Session Launcher Custom Resource Allocation',
  { tag: ['@regression', '@session', '@functional'] },
  () => {
    test.beforeEach(async ({ page, request }) => {
      await loginAsAdmin(page, request);

      // 1. Navigate to /session/start and fill in a session name.
      await navigateTo(page, 'session/start');
      const sessionNameInput = page.locator('#sessionName');
      await expect(sessionNameInput).toBeVisible({ timeout: 30_000 });
      await sessionNameInput.fill(`e2e-custom-resource-${Date.now()}`);

      // 2. Click "Environments & Resource allocation" to go to step 2.
      await page
        .getByRole('button', { name: 'Environments & Resource allocation' })
        .click();
      await expect(
        page.getByRole('combobox', { name: 'Resource Presets' }),
      ).toBeVisible({ timeout: 10_000 });
    });

    test('User can switch the Resource Presets selector to Custom allocation by editing the Memory field directly', async ({
      page,
    }) => {
      // 3. Confirm the default preset is "Minimum requirements" with Memory
      // at its default value (1.0625 GiB).
      const resourcePresetsControl = getFormItemControlByLabel(
        page,
        'Resource Presets',
      );
      await expect(resourcePresetsControl).toContainText(
        'Minimum requirements',
      );
      const memoryInput = page.locator('#resource_mem');
      await expect(memoryInput).toHaveValue('1.0625');

      // 4. Type a custom Memory value directly into the field, without first
      // selecting "Custom allocation" from the dropdown.
      await memoryInput.fill('2');

      // 5. Verify the Resource Presets selector automatically switches to
      // "Custom allocation" and the typed value is retained.
      await expect(resourcePresetsControl).toContainText('Custom allocation');
      await expect(memoryInput).toHaveValue('2');
    });

    test('User can revert a custom Memory value back to the preset default by reselecting Minimum requirements', async ({
      page,
    }) => {
      const memoryInput = page.locator('#resource_mem');
      const resourcePresetsCombobox = page.getByRole('combobox', {
        name: 'Resource Presets',
      });
      const resourcePresetsControl = getFormItemControlByLabel(
        page,
        'Resource Presets',
      );

      // 3. Edit the Memory field to a custom value, confirming the preset
      // selector switches to "Custom allocation".
      await memoryInput.fill('3');
      await expect(resourcePresetsControl).toContainText('Custom allocation');

      // 4. Reopen the Resource Presets dropdown and reselect "Minimum requirements".
      await resourcePresetsCombobox.click();
      const openDropdown = page
        .locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)')
        .first();
      await expect(openDropdown).toBeVisible({ timeout: 10_000 });
      await openDropdown
        .getByRole('option', { name: 'Minimum requirements' })
        .click();

      // 5. Verify the Memory field resets back to the preset's default value.
      await expect(resourcePresetsControl).toContainText(
        'Minimum requirements',
      );
      await expect(memoryInput).toHaveValue('1.0625');
    });

    test('User can see a custom Memory value carried through to the review step without launching the session', async ({
      page,
    }) => {
      // 3. Edit the Memory field to a custom value.
      const memoryInput = page.locator('#resource_mem');
      await memoryInput.fill('4');

      // 4. Skip directly to the review step (does not launch the session).
      await page.getByRole('button', { name: 'Skip to review' }).click();

      // 5. Verify the review step's "Resource allocation" section reflects
      // the custom Memory value, both in the per-container row and the
      // Total Allocation summary. The session is intentionally never
      // launched, so no session resource is created and no cleanup is needed.
      const perContainerRow = page.getByRole('row', {
        name: /Resource Allocation Per Container/,
      });
      await expect(perContainerRow).toBeVisible({ timeout: 10_000 });
      await expect(perContainerRow).toContainText('4');
      await expect(perContainerRow).toContainText('GiB');

      // "Total Allocation" is an antd card *header* title
      // (`.ant-card-head-title`); the actual allocated values (e.g. "4" "GiB")
      // live in that card's *body*, not in the header's parent. Scope on the
      // whole `.ant-card` that contains the "Total Allocation" header so the
      // value assertion sees the body, matching the `.ant-card` scoping used
      // in deployment-lifecycle.spec.ts.
      const totalAllocationCard = page
        .locator('.ant-card')
        .filter({ hasText: 'Total Allocation' })
        .last();
      await expect(totalAllocationCard).toBeVisible();
      await expect(totalAllocationCard).toContainText('4');
      await expect(totalAllocationCard).toContainText('GiB');
    });
  },
);
