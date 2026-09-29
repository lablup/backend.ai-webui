// FR-4067 (#9927): the session launcher keys resource presets by id, marks
// resource-group-scoped presets with a group token, and explains why a preset
// cannot be used in the chosen resource group.
//
// Runs as a regular user: on managers affected by BA-7907 an admin's
// `accessible_scaling_groups` lookup fails, which disables every scoped preset.
import { createAdminApiContext } from '../utils/admin-api';
import {
  createScopedPresetFixture,
  deleteScopedPresetFixture,
  type ScopedPresetFixture,
} from '../utils/resource-preset-fixtures';
import { loginAsUser, navigateTo } from '../utils/test-util';
import { test, expect, type Page } from '@playwright/test';

const onlyAvailableIn = (group: string) =>
  `Only available in the "${group}" resource group`;

const presetOnlyAvailableIn = (preset: string, group: string) =>
  `The "${preset}" preset is only available in the "${group}" resource group. Please select a different resource group.`;

const openResourceAllocationStep = async (page: Page) => {
  await navigateTo(page, 'session/start');
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(
    page.getByRole('button', { name: 'Resource Group Select' }),
  ).toBeVisible({ timeout: 20000 });
};

const selectResourceGroup = async (page: Page, group: string) => {
  const trigger = page.getByRole('button', { name: 'Resource Group Select' });
  await trigger.click();
  await page.getByRole('option', { name: group, exact: true }).click();
  await expect(trigger).toHaveText(group);
};

const presetTrigger = (page: Page) =>
  page.getByRole('button', { name: 'Resource Presets' });

const openPresetList = async (page: Page) => {
  await presetTrigger(page).click();
  await expect(page.getByRole('listbox')).toBeVisible();
};

const presetOptions = (page: Page, presetName: string) =>
  page.getByRole('option').filter({ hasText: presetName });

const presetOptionIn = (page: Page, presetName: string, group: string) =>
  presetOptions(page, presetName).filter({
    has: page.getByText(group, { exact: true }),
  });

const globalPresetOption = (page: Page, fixture: ScopedPresetFixture) =>
  presetOptions(page, fixture.presetName)
    .filter({
      hasNot: page.getByText(fixture.baseResourceGroup, { exact: true }),
    })
    .filter({ hasNot: page.getByText(fixture.resourceGroup, { exact: true }) });

test.describe.serial(
  'Session launcher - resource-group-scoped presets',
  { tag: ['@regression', '@session', '@requires-manager-v25.4'] },
  () => {
    let fixture: ScopedPresetFixture;

    test.beforeAll(async () => {
      const api = await createAdminApiContext();
      try {
        fixture = await createScopedPresetFixture(api);
      } finally {
        await api.dispose();
      }
    });

    test.afterAll(async () => {
      if (!fixture) return;
      const api = await createAdminApiContext();
      try {
        await deleteScopedPresetFixture(api, fixture);
      } finally {
        await api.dispose();
      }
    });

    test.beforeEach(async ({ page, request }) => {
      await loginAsUser(page, request);
      await openResourceAllocationStep(page);
      await selectResourceGroup(page, fixture.baseResourceGroup);
    });

    test('User can tell a resource-group preset from a same-named global preset and select it alone', async ({
      page,
    }) => {
      await openPresetList(page);
      await expect(presetOptions(page, fixture.presetName)).toHaveCount(3);
      const scopedOption = presetOptionIn(
        page,
        fixture.presetName,
        fixture.baseResourceGroup,
      );
      const globalOption = globalPresetOption(page, fixture);
      await expect(scopedOption).toHaveCount(1);
      await expect(globalOption).toHaveCount(1);

      await scopedOption.click();

      // The closed trigger keeps the group token next to the preset name.
      await expect(presetTrigger(page)).toContainText(fixture.presetName);
      await expect(
        presetTrigger(page).getByText(fixture.baseResourceGroup, {
          exact: true,
        }),
      ).toBeVisible();

      await openPresetList(page);
      await expect(scopedOption).toHaveAttribute('aria-selected', 'true');
      await expect(globalOption).toHaveAttribute('aria-selected', 'false');
      await expect(page.getByRole('option', { selected: true })).toHaveCount(1);
    });

    test('User can see why a preset scoped to another resource group is disabled', async ({
      page,
    }) => {
      await openPresetList(page);
      const otherGroupOption = presetOptionIn(
        page,
        fixture.presetName,
        fixture.resourceGroup,
      );
      await expect(otherGroupOption).toHaveAttribute('aria-disabled', 'true');

      await otherGroupOption.hover();
      await expect(
        page
          .getByRole('tooltip')
          .filter({ hasText: onlyAvailableIn(fixture.resourceGroup) }),
      ).toBeVisible();
    });

    test('User can see a mismatch warning after switching away from the selected preset resource group', async ({
      page,
    }) => {
      await openPresetList(page);
      await presetOptionIn(
        page,
        fixture.presetName,
        fixture.baseResourceGroup,
      ).click();
      await expect(presetTrigger(page)).toContainText(fixture.presetName);

      const mismatchMessage = page
        .getByText(
          presetOnlyAvailableIn(fixture.presetName, fixture.baseResourceGroup),
          { exact: true },
        )
        .filter({ visible: true });
      await expect(mismatchMessage).toHaveCount(0);

      await selectResourceGroup(page, fixture.resourceGroup);
      await expect(mismatchMessage).toBeVisible();
      // The chosen preset is flagged, not swapped.
      await expect(presetTrigger(page)).toContainText(fixture.presetName);
      await expect(
        presetTrigger(page).getByText(fixture.baseResourceGroup, {
          exact: true,
        }),
      ).toBeVisible();

      await selectResourceGroup(page, fixture.baseResourceGroup);
      await expect(mismatchMessage).toHaveCount(0);
      await expect(presetTrigger(page)).toContainText(fixture.presetName);
    });
  },
);
