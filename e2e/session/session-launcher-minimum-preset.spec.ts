import { loginAsAdmin, navigateTo } from '../utils/test-util';
import { getFormItemControlByLabel } from '../utils/test-util-antd';
import {
  createVFolderViaApi,
  deleteVFolderViaApi,
  type CreatedVFolder,
} from '../utils/vfolder-api';
import { test, expect, type Page } from '@playwright/test';

/**
 * Regression cover for FR-3985 / PR #9747: under the "Minimum requirements"
 * preset the resource step re-ran its automatic writes on every render, which
 * logged `Maximum update depth exceeded` and starved React transitions — the
 * sub-path picker on Data & Storage never opened.
 */
/**
 * A production React bundle — which is what a deployed WebUI serves — reports
 * "Maximum update depth exceeded" as the minified code 185, so matching the
 * prose alone would make this check pass on exactly the builds under test.
 */
const RENDER_LOOP_ERROR =
  /Maximum update depth exceeded|Minified React error #185/;

const MINIMUM_REQUIREMENTS_PRESET = 'Minimum requirements';

interface ResourceAllocation {
  cpu: string;
  memory: string;
  memoryUnit: string;
  /** The auto-shmem readout, e.g. `Shared Memory (SHMEM) 64m`. */
  sharedMemory: string | null;
}

const getPresetSelect = (page: Page) =>
  page.getByRole('button', { name: 'Resource Presets' });

const readResourceAllocation = async (
  page: Page,
): Promise<ResourceAllocation> => {
  const memory = getFormItemControlByLabel(page, 'Memory').first();
  return {
    cpu: await getFormItemControlByLabel(page, 'CPU')
      .first()
      .getByRole('spinbutton')
      .first()
      .inputValue(),
    memory: await memory.getByRole('spinbutton').first().inputValue(),
    memoryUnit: await memory.getByRole('combobox').first().innerText(),
    sharedMemory: await memory
      .getByRole('img', { name: /^Shared Memory \(SHMEM\)/ })
      .first()
      .getAttribute('aria-label'),
  };
};

/** Waits until two consecutive reads agree, then returns that reading. */
const waitForSettledResourceAllocation = async (
  page: Page,
): Promise<ResourceAllocation> => {
  let previous = JSON.stringify(await readResourceAllocation(page));
  await expect
    .poll(
      async () => {
        const current = JSON.stringify(await readResourceAllocation(page));
        const isSettled = current === previous;
        previous = current;
        return isSettled;
      },
      { timeout: 20_000, intervals: [500] },
    )
    .toBe(true);
  return JSON.parse(previous) as ResourceAllocation;
};

const openEnvironmentAndResourceStep = async (page: Page) => {
  await navigateTo(page, 'session/start');
  await page.getByRole('button', { name: /^Go to step 2/ }).click();
  await expect(getPresetSelect(page)).toBeVisible({ timeout: 20_000 });
};

const selectMinimumRequirementsPreset = async (page: Page) => {
  const presetSelect = getPresetSelect(page);
  await presetSelect.click();
  await page
    .getByRole('option', { name: new RegExp(MINIMUM_REQUIREMENTS_PRESET) })
    .click();
  await expect(presetSelect).toHaveText(MINIMUM_REQUIREMENTS_PRESET);
};

test.describe(
  'SessionLauncher - Minimum Requirements Preset',
  { tag: ['@regression', '@session', '@functional'] },
  () => {
    let renderLoopErrors: Array<string> = [];
    let createdFolder: CreatedVFolder | null = null;

    test.beforeEach(async ({ page, request }) => {
      renderLoopErrors = [];
      createdFolder = null;
      page.on('console', (message) => {
        if (
          message.type() === 'error' &&
          RENDER_LOOP_ERROR.test(message.text())
        ) {
          renderLoopErrors.push(message.text());
        }
      });
      page.on('pageerror', (error) => {
        if (RENDER_LOOP_ERROR.test(error.message)) {
          renderLoopErrors.push(error.message);
        }
      });
      // loginAsUser sends the session launcher into BAIErrorBoundary, so the
      // launcher specs drive it as admin; the test names say "User" to describe
      // the human actor, not the credential role.
      await loginAsAdmin(page, request);
    });

    test.afterEach(async () => {
      if (createdFolder) {
        await deleteVFolderViaApi(createdFolder);
      }
    });

    test('User sees the resource values stay put after selecting the Minimum requirements preset', async ({
      page,
    }) => {
      // 1. Open the launcher's Environments & Resource Allocation step
      await openEnvironmentAndResourceStep(page);

      // 2. Pick the minimum-requirements preset, which fills CPU / Memory and
      //    switches shared memory to automatic
      await selectMinimumRequirementsPreset(page);

      // 3. Let the automatic writes land
      const settled = await waitForSettledResourceAllocation(page);
      expect(settled.sharedMemory).not.toBeNull();

      // 4. The values must not move again. Sampling over several seconds IS the
      //    assertion here — the regression re-ran the automatic writes on every
      //    render — so the fixed waits are deliberate, not a readiness stand-in.
      for (let sample = 0; sample < 10; sample += 1) {
        await page.waitForTimeout(500);
        expect(await readResourceAllocation(page)).toEqual(settled);
      }

      // 5. An automatic write that reached a field through its input would have
      //    flipped the preset to "Custom allocation"
      await expect(getPresetSelect(page)).toHaveText(
        MINIMUM_REQUIREMENTS_PRESET,
      );
      expect(renderLoopErrors).toEqual([]);
    });

    test('User can open the sub-path picker on Data & Storage with the Minimum requirements preset', async ({
      page,
    }) => {
      // 1. A folder to mount, created over the API so this spec only exercises
      //    the launcher
      createdFolder = await createVFolderViaApi(
        `e2e-launcher-minimum-${Date.now()}`,
      );
      const folderName = createdFolder.name;

      // 2. Select the minimum-requirements preset on the resource step
      await openEnvironmentAndResourceStep(page);
      await selectMinimumRequirementsPreset(page);

      // 3. Move on to Data & Storage and mount the folder
      await page.getByRole('button', { name: /^Go to step 3/ }).click();
      const folderSelect = page.getByRole('button', { name: 'Select Folder' });
      await expect(folderSelect).toBeVisible({ timeout: 20_000 });
      await folderSelect.click();
      // The account can see far more folders than one popup page, so filter
      // down to this spec's folder instead of scanning the rendered options.
      await page
        .getByRole('combobox', { name: 'Search options' })
        .fill(folderName);
      await page.getByRole('option', { name: new RegExp(folderName) }).click();
      await page.keyboard.press('Escape');

      const mountRow = page
        .getByRole('listitem')
        .filter({ hasText: folderName });
      await expect(mountRow).toBeVisible();

      // 4. The picker opens inside a React transition, which the render loop
      //    never let commit — so the dialog appearing is the interactivity check
      await mountRow.getByRole('button', { name: 'Subpath' }).click();
      await expect(
        page
          .getByRole('dialog')
          .filter({ hasText: `Select a path in ${folderName}` }),
      ).toBeVisible({ timeout: 20_000 });

      expect(renderLoopErrors).toEqual([]);
    });
  },
);
