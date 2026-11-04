// FR-4067 (#9927), #10270: the session launcher lists the presets
// `checkPresetAvailabilityV2` returns for the chosen resource group (that
// group's and the global ones), keys them by id, marks group-scoped ones with
// a group token, and flags a chosen preset the new group does not offer.
//
// Presets are visible to every user, so the same-named presets are mocked
// into the launcher's two preset queries instead of created on the server.
import { loginAsUser, navigateTo } from '../utils/test-util';
import { test, expect, type Page } from '@playwright/test';

// Real resource groups of the nightly cluster; the tests skip without them.
const BASE_GROUP = 'cuda-ent';
const OTHER_GROUP = 'default';
const PRESET_NAME = 'e2e-mock-scoped-preset';

const MOCK_PRESETS = [
  { id: '00000000-0000-4000-8000-0000000e2e01', group: null },
  { id: '00000000-0000-4000-8000-0000000e2e02', group: BASE_GROUP },
  { id: '00000000-0000-4000-8000-0000000e2e03', group: OTHER_GROUP },
];

// The launcher's default image needs fGPU, so the mocked presets carry the
// slots of the server's allocatable `cuda01-small` in BASE_GROUP.
const MOCK_SLOTS = [
  { resourceType: 'cpu', quantity: '4' },
  { resourceType: 'mem', quantity: '21474836480' },
  { resourceType: 'cuda.shares', quantity: '0.5' },
];

const operationOf = (postData: string | null) =>
  postData?.match(/(?:query|mutation)\s+(\w+)/)?.[1];

// `resource_presets` keeps listing every group's preset, as the server does;
// `checkPresetAvailabilityV2` answers only for the requested group.
const mockScopedPresets = async (page: Page) => {
  await page.route('**/admin/gql', async (route) => {
    const request = route.request();
    const operation = operationOf(request.postData());
    if (
      operation !== 'ResourceAllocationFormItemsQuery' &&
      operation !== 'useSessionResourcePresetsQuery'
    ) {
      await route.fallback();
      return;
    }
    const response = await route.fetch();
    const body = await response.json();
    if (operation === 'ResourceAllocationFormItemsQuery') {
      body.data?.resource_presets?.push(
        ...MOCK_PRESETS.map(({ id, group }) => ({
          id,
          name: PRESET_NAME,
          scaling_group_name: group,
        })),
      );
    } else {
      const { resourceGroupName } = request.postDataJSON().variables ?? {};
      body.data?.checkPresetAvailabilityV2?.presets?.push(
        ...MOCK_PRESETS.filter(
          ({ group }) => group === null || group === resourceGroupName,
        ).map(({ id, group }) => ({
          presetId: id,
          name: PRESET_NAME,
          resourceSlots: MOCK_SLOTS,
          sharedMemory: { expr: '1073741824' },
          resourceGroupName: group,
          available: true,
        })),
      );
    }
    await route.fulfill({ response, json: body });
  });
};

const presetOnlyAvailableIn = (preset: string, group: string) =>
  `The "${preset}" preset is only available in the "${group}" resource group. Please select a different resource group.`;

const resourceGroupTrigger = (page: Page) =>
  page
    .getByText('Resource Group', { exact: true })
    .locator('xpath=ancestor::*[.//button][1]')
    .getByRole('button');

const openResourceAllocationStep = async (page: Page) => {
  await navigateTo(page, 'session/start');
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(resourceGroupTrigger(page)).toBeVisible({ timeout: 20000 });
};

const selectResourceGroup = async (page: Page, group: string) => {
  const trigger = resourceGroupTrigger(page);
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

// Opening the list refetches it; pick only once that answer has landed.
const openRefetchedPresetList = async (page: Page) => {
  const refetched = page.waitForResponse(
    (response) =>
      operationOf(response.request().postData()) ===
      'useSessionResourcePresetsQuery',
  );
  await openPresetList(page);
  await refetched;
  await expect(presetOptions(page)).toHaveCount(2);
};

const presetOptions = (page: Page) =>
  page.getByRole('option').filter({ hasText: PRESET_NAME });

const presetOptionIn = (page: Page, group: string) =>
  presetOptions(page).filter({
    has: page.getByText(group, { exact: true }),
  });

const globalPresetOption = (page: Page) =>
  presetOptions(page)
    .filter({ hasNot: page.getByText(BASE_GROUP, { exact: true }) })
    .filter({ hasNot: page.getByText(OTHER_GROUP, { exact: true }) });

test.describe(
  'Session launcher - resource-group-scoped presets',
  {
    tag: [
      '@regression',
      '@functional',
      '@session',
      '@requires-manager-v26.4',
      '@requires-seeded-data',
    ],
  },
  () => {
    test.beforeEach(async ({ page, request }) => {
      await mockScopedPresets(page);
      await loginAsUser(page, request);
      await openResourceAllocationStep(page);
      await resourceGroupTrigger(page).click();
      await expect(page.getByRole('option').first()).toBeVisible();
      const missingGroups = [];
      for (const group of [BASE_GROUP, OTHER_GROUP]) {
        if (
          (await page
            .getByRole('option', { name: group, exact: true })
            .count()) === 0
        ) {
          missingGroups.push(group);
        }
      }
      await page.keyboard.press('Escape');
      test.skip(
        missingGroups.length > 0,
        `Requires the e2e user's project to reach the "${BASE_GROUP}" (with fGPU) and "${OTHER_GROUP}" resource groups; missing: ${missingGroups.join(', ')} (@requires-seeded-data)`,
      );
      await selectResourceGroup(page, BASE_GROUP);
    });

    test.afterEach(async ({ page }) => {
      await page.unrouteAll({ behavior: 'ignoreErrors' });
    });

    test('User can tell a resource-group preset from a same-named global preset and select it alone', async ({
      page,
    }) => {
      await openRefetchedPresetList(page);
      const scopedOption = presetOptionIn(page, BASE_GROUP);
      const globalOption = globalPresetOption(page);
      await expect(scopedOption).toHaveCount(1);
      await expect(globalOption).toHaveCount(1);

      await scopedOption.click();

      // The closed trigger keeps the group token next to the preset name.
      await expect(presetTrigger(page)).toContainText(PRESET_NAME);
      await expect(
        presetTrigger(page).getByText(BASE_GROUP, { exact: true }),
      ).toBeVisible();

      await openPresetList(page);
      await expect(scopedOption).toHaveAttribute('aria-selected', 'true');
      await expect(globalOption).toHaveAttribute('aria-selected', 'false');
      await expect(page.getByRole('option', { selected: true })).toHaveCount(1);
    });

    test('User cannot see a preset scoped to another resource group in the preset list', async ({
      page,
    }) => {
      await openPresetList(page);
      await expect(presetOptionIn(page, BASE_GROUP)).toHaveCount(1);
      await expect(globalPresetOption(page)).toHaveCount(1);
      await expect(presetOptionIn(page, OTHER_GROUP)).toHaveCount(0);
    });

    test('User can see a mismatch warning after switching away from the selected preset resource group', async ({
      page,
    }) => {
      await openRefetchedPresetList(page);
      await presetOptionIn(page, BASE_GROUP).click();
      await expect(presetTrigger(page)).toContainText(PRESET_NAME);

      const mismatchMessage = page
        .getByText(presetOnlyAvailableIn(PRESET_NAME, BASE_GROUP), {
          exact: true,
        })
        .filter({ visible: true });
      await expect(mismatchMessage).toHaveCount(0);

      await selectResourceGroup(page, OTHER_GROUP);
      await expect(mismatchMessage).toBeVisible();
      // The chosen preset is flagged, not swapped.
      await expect(presetTrigger(page)).toContainText(PRESET_NAME);
      await expect(
        presetTrigger(page).getByText(BASE_GROUP, { exact: true }),
      ).toBeVisible();

      await selectResourceGroup(page, BASE_GROUP);
      await expect(mismatchMessage).toHaveCount(0);
    });
  },
);
