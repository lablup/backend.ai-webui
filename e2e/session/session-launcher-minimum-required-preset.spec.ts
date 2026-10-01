// spec: FR-3985 (#9747) — the resource step settles under the "Minimum requirements" preset
import { createAdminApiContext } from '../utils/admin-api';
import { loginAsAdmin, navigateTo } from '../utils/test-util';
import { test, expect, Page, APIRequestContext } from '@playwright/test';

const MINIMUM_REQUIRED_LABEL = 'Minimum requirements';
const MAXIMUM_UPDATE_DEPTH = 'Maximum update depth exceeded';

type ResourceFormValues = Record<string, unknown>;

/** Collects console errors so a test can assert the render loop never started. */
const collectConsoleErrors = (page: Page) => {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
};

/** The launcher mirrors its form into `?formValues=`; read the resource slice. */
const readFormValuesFromUrl = (page: Page) => {
  const raw = new URL(page.url()).searchParams.get('formValues');
  return raw ? (JSON.parse(raw) as ResourceFormValues) : undefined;
};

const getResourcePresetSelect = (page: Page) =>
  page.getByRole('button', { name: 'Resource Presets' });

/** What the resource step shows: memory amount + unit and the SHMEM figure. */
const readVisibleResourceValues = async (page: Page) => ({
  memory: await page
    .getByRole('spinbutton', { name: 'Select Select' })
    .inputValue(),
  memoryUnit: await page
    .getByRole('combobox', { name: 'Select Unit' })
    .textContent(),
  shmem: await page
    .getByRole('img', { name: /Shared Memory \(SHMEM\)/ })
    .getAttribute('aria-label'),
});

const openResourceStep = async (page: Page) => {
  await navigateTo(page, 'session/start');
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(getResourcePresetSelect(page)).toBeVisible({ timeout: 15000 });
};

const selectMinimumRequiredPreset = async (page: Page) => {
  await getResourcePresetSelect(page).click();
  await page
    .getByRole('option', { name: new RegExp(`^${MINIMUM_REQUIRED_LABEL}`) })
    .click();
  await expect(getResourcePresetSelect(page)).toContainText(
    MINIMUM_REQUIRED_LABEL,
  );
  await expect
    .poll(() => readFormValuesFromUrl(page)?.allocationPreset, {
      timeout: 10000,
    })
    .toBe('minimum-required');
};

test.describe(
  'SessionLauncher - Minimum Requirements Preset',
  { tag: ['@regression', '@session', '@functional'] },
  () => {
    let api: APIRequestContext | undefined;
    let createdFolderId: string | undefined;

    test.beforeEach(async ({ page, request }) => {
      createdFolderId = undefined;
      await loginAsAdmin(page, request);
    });

    test.afterEach(async () => {
      if (!api) return;
      if (createdFolderId) {
        // Best-effort: move to trash, then purge, so nothing is left on the shared server.
        await api
          .delete('/func/folders', { data: { vfolder_id: createdFolderId } })
          .catch(() => undefined);
        await api
          .post('/func/folders/delete-from-trash-bin', {
            data: { vfolder_id: createdFolderId },
          })
          .catch(() => undefined);
      }
      await api.dispose();
      api = undefined;
    });

    test('User can open the sub-path picker after choosing the Minimum requirements preset', async ({
      page,
    }) => {
      const consoleErrors = collectConsoleErrors(page);
      const folderName = `e2e-min-preset-path-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      api = await createAdminApiContext();
      const created = await api.post('/func/folders', {
        data: { name: folderName, usage_mode: 'general', permission: 'rw' },
      });
      expect(created.ok()).toBeTruthy();
      createdFolderId = (await created.json()).id;

      await openResourceStep(page);
      await selectMinimumRequiredPreset(page);

      await page
        .getByRole('button', { name: 'Go to step 3: Data & Storage' })
        .click();
      await page.getByRole('button', { name: 'Select Folder' }).click();
      await page
        .getByRole('option', { name: new RegExp(`^${folderName}\\b`) })
        .click();
      await page.keyboard.press('Escape');
      await expect(
        page.getByRole('listbox', { name: 'Select Folder' }),
      ).toBeHidden();

      const mountRow = page
        .getByRole('listitem')
        .filter({ has: page.getByRole('link', { name: folderName }) });
      await expect(mountRow).toBeVisible();
      const subpathPicker = mountRow.getByRole('button', { name: 'Subpath' });
      await expect(subpathPicker).toHaveText('Select a path');
      await subpathPicker.click();

      const pickerDialog = page.getByRole('dialog', {
        name: `Select a path in ${folderName}`,
      });
      await expect(pickerDialog).toBeVisible({ timeout: 15000 });
      await expect(
        pickerDialog.getByRole('button', { name: 'Select this location' }),
      ).toBeEnabled();
      await pickerDialog.getByRole('button', { name: 'Close' }).click();
      await expect(pickerDialog).toBeHidden();

      expect(
        consoleErrors.filter((error) => error.includes(MAXIMUM_UPDATE_DEPTH)),
      ).toEqual([]);
    });

    test('User can see the Minimum requirements preset values stay unchanged after selecting it', async ({
      page,
    }) => {
      const consoleErrors = collectConsoleErrors(page);
      await openResourceStep(page);
      await selectMinimumRequiredPreset(page);

      // Let the image-minimum writes land, then require the step to stay put.
      await page.waitForTimeout(1500);
      const settledVisible = await readVisibleResourceValues(page);
      const settledResource = readFormValuesFromUrl(page)?.resource as
        ResourceFormValues | undefined;
      expect(String(settledResource?.mem)).toMatch(/^\d/);

      // Sample over time on purpose: a render loop shows up as drift.
      for (let i = 0; i < 5; i++) {
        await page.waitForTimeout(1000);
        expect(await readVisibleResourceValues(page)).toEqual(settledVisible);
        expect(readFormValuesFromUrl(page)?.resource).toEqual(settledResource);
      }
      await expect(getResourcePresetSelect(page)).toContainText(
        MINIMUM_REQUIRED_LABEL,
      );
      expect(
        consoleErrors.filter((error) => error.includes(MAXIMUM_UPDATE_DEPTH)),
      ).toEqual([]);
    });

    test('User can keep a memory value written in another unit when it already equals the Minimum requirements size', async ({
      page,
    }) => {
      // Read the minimum memory this server derives, then restore the launcher
      // with the same size spelled in MiB, as a shared launcher URL would.
      await openResourceStep(page);
      await selectMinimumRequiredPreset(page);
      await page.waitForTimeout(1500);
      const settled = readFormValuesFromUrl(page);
      const minimumMem = String(
        (settled?.resource as ResourceFormValues | undefined)?.mem ?? '',
      );
      const match = /^([\d.]+)g$/.exec(minimumMem);
      test.skip(
        !match,
        `Minimum memory "${minimumMem}" is not expressed in GiB on this server`,
      );
      const mebibytes = Number(match![1]) * 1024;
      test.skip(
        !Number.isInteger(mebibytes),
        `Minimum memory "${minimumMem}" has no whole-MiB spelling`,
      );
      const memInMiB = `${mebibytes}m`;

      const restored = {
        ...settled,
        allocationPreset: 'minimum-required',
        resource: {
          ...(settled?.resource as ResourceFormValues),
          mem: memInMiB,
        },
      };
      await navigateTo(
        page,
        `session/start?step=1&formValues=${encodeURIComponent(JSON.stringify(restored))}`,
      );
      await expect(getResourcePresetSelect(page)).toContainText(
        MINIMUM_REQUIRED_LABEL,
        { timeout: 15000 },
      );

      // Sample over time on purpose: the pre-fix rewrite lands after restore.
      for (let i = 0; i < 5; i++) {
        await page.waitForTimeout(1000);
        const resource = readFormValuesFromUrl(page)?.resource as
          ResourceFormValues | undefined;
        expect(resource?.mem).toBe(memInMiB);
      }
      await expect(
        page.getByRole('spinbutton', { name: 'Select Select' }),
      ).toHaveValue(String(mebibytes));
      await expect(
        page.getByRole('combobox', { name: 'Select Unit' }),
      ).toHaveText('MiB');
    });
  },
);
