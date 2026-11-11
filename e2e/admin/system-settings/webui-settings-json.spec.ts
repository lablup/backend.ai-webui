// E2E tests for the System Settings JSON Config dialog (#10870).
//
// Read-only on purpose: nothing here saves (a row saves on change, #10941), so
// the cluster-wide `settings` documents are never written. That is why these
// tests live outside `webui-settings.spec.ts`, whose file-level hooks clear
// and restore those documents around every test.
import { loginAsAdmin } from '../../utils/test-util';
import {
  allSettingRows,
  changedMarker,
  openWebUISettings,
  rowInput,
  settingRow,
  suppressAdminViewSwitchTour,
} from '../../utils/webui-settings-util';
import { test, expect, type Page } from '@playwright/test';

function jsonConfigButton(page: Page) {
  return page.getByTestId('webui-settings-json-config');
}

function jsonConfigDialog(page: Page) {
  return page.getByRole('dialog', { name: 'JSON Config' });
}

/** Collects the requests a settings save sends; a read-only test expects none. */
function watchSettingsWrites(page: Page): Array<string> {
  const writes: Array<string> = [];
  page.on('request', (request) => {
    // Only a save sends the domain raw read, and it sends it first; the public
    // raw read is also an ordinary page read, so it is not counted.
    if (
      /AppConfigUpsert|AppConfigDomainRawQuery/.test(request.postData() ?? '')
    ) {
      writes.push(request.url());
    }
  });
  return writes;
}

/** Opens the JSON Config dialog and waits for the Monaco editor to load. */
async function openJsonConfig(page: Page) {
  await jsonConfigButton(page).click();
  const dialog = jsonConfigDialog(page);
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('.monaco-editor')).toBeVisible({
    timeout: 30_000,
  });
  await expect.poll(() => readEditorText(page)).not.toBe('');
  return dialog;
}

/** The text of the dialog's JSON editor (the only Monaco model on the page). */
async function readEditorText(page: Page): Promise<string> {
  return page.evaluate(() => {
    const models = (globalThis as any).monaco?.editor?.getModels() ?? [];
    return models.length > 0 ? models[models.length - 1].getValue() : '';
  });
}

/** Replaces the editor text through Monaco, so the editor's onChange fires. */
async function writeEditorText(page: Page, text: string) {
  await page.evaluate((value) => {
    const models = (globalThis as any).monaco.editor.getModels();
    models[models.length - 1].setValue(value);
  }, text);
}

test.describe(
  'System Settings - JSON Config',
  { tag: ['@regression', '@config', '@webui-settings', '@functional'] },
  () => {
    test.beforeEach(async ({ page, request }) => {
      await suppressAdminViewSwitchTour(page);
      await loginAsAdmin(page, request);
      await openWebUISettings(page);
    });

    test('Superadmin can view System Settings as JSON and cancel without changing the page', async ({
      page,
    }) => {
      const cpuRow = settingRow(page, 'maxCPUCoresPerContainer');
      const cpuBefore = await rowInput(cpuRow).inputValue();
      const changedBefore = await changedMarker(allSettingRows(page)).count();
      const writes = watchSettingsWrites(page);

      const dialog = await openJsonConfig(page);

      await test.step('the editor holds the public and domain documents', async () => {
        const json = JSON.parse(await readEditorText(page));
        expect(Object.keys(json).sort()).toEqual(['domain', 'public']);
        // An unsaved number row shows its default as the placeholder.
        const cpuShown =
          cpuBefore ||
          (await rowInput(cpuRow).getAttribute('placeholder')) ||
          '';
        expect(json.domain.maxCPUCoresPerContainer).toBe(Number(cpuShown));
      });

      await test.step('Cancel closes the dialog and leaves the page as it was', async () => {
        await dialog.getByRole('button', { name: 'Cancel' }).click();
        await expect(dialog).toBeHidden();
        await expect(rowInput(cpuRow)).toHaveValue(cpuBefore);
        await expect(changedMarker(allSettingRows(page))).toHaveCount(
          changedBefore,
        );
        expect(writes).toHaveLength(0);
      });
    });

    test('Superadmin cannot apply JSON Config with an unknown key or a wrong-typed value', async ({
      page,
    }) => {
      const cpuRow = settingRow(page, 'maxCPUCoresPerContainer');
      const cpuBefore = await rowInput(cpuRow).inputValue();
      const changedBefore = await changedMarker(allSettingRows(page)).count();
      const writes = watchSettingsWrites(page);

      const dialog = await openJsonConfig(page);
      await writeEditorText(
        page,
        JSON.stringify(
          {
            public: {},
            domain: {
              maxCPUCoresPerContainer: 'not-a-number',
              e2eUnknownSetting: true,
            },
          },
          null,
          2,
        ),
      );

      await test.step('the dialog Apply lists the entries it cannot apply and stays open', async () => {
        await dialog
          .getByRole('button', { name: 'Apply', exact: true })
          .click();
        await expect(
          dialog.getByText('These entries cannot be applied:'),
        ).toBeVisible();
        const issues = dialog.getByTestId('webui-settings-json-issues');
        await expect(issues).toContainText(
          'domain.maxCPUCoresPerContainer: wrong type or value',
        );
        await expect(issues).toContainText(
          'domain.e2eUnknownSetting: unsupported setting',
        );
        await expect(dialog).toBeVisible();
      });

      await test.step('closing the dialog leaves the draft unchanged', async () => {
        await dialog.getByRole('button', { name: 'Cancel' }).click();
        await expect(dialog).toBeHidden();
        await expect(rowInput(cpuRow)).toHaveValue(cpuBefore);
        await expect(changedMarker(allSettingRows(page))).toHaveCount(
          changedBefore,
        );
        expect(writes).toHaveLength(0);
      });
    });
  },
);
