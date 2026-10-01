// FR-4009 (#9819): creating a folder on the admin Data page refetches the
// table, and a query suspending inside the table used to swap the whole page
// for the route skeleton. React hides a suspended subtree with
// `display:none` instead of unmounting it, so the check samples
// `Element.checkVisibility()` in the page rather than asserting presence.
import { FolderCreationModal } from '../utils/classes/vfolder/FolderCreationModal';
import { cleanupVFolderSafely } from '../utils/cleanup-util';
import { loginAsAdmin, navigateTo } from '../utils/test-util';
import { test, expect, Locator, Page } from '@playwright/test';

const TARGET_PROJECT = process.env.E2E_ADMIN_PROJECT_NAME || 'default';
// The option's accessible name carries the admin's role chip ("default Project Admin").
const TARGET_PROJECT_OPTION = new RegExp(
  `^${TARGET_PROJECT.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\s|$)`,
);
const PROBE_ATTR = 'data-e2e-refetch-probe';
// The pre-fix blank began ~0.9s after the create and lasted until ~2.8s.
const SETTLE_MS = 3000;

type ProbeSample = { t: number; hidden: string[]; tableBusy: boolean };

async function tagProbe(locator: Locator, name: string) {
  await expect(locator).toBeVisible();
  await locator.evaluate((el, [attr, value]) => el.setAttribute(attr, value), [
    PROBE_ATTR,
    name,
  ] as const);
}

async function startSampler(page: Page, names: string[]) {
  await page.evaluate(
    ([attr, probeNames]) => {
      const w = window as unknown as {
        __e2eProbeSamples: ProbeSample[];
        __e2eProbeTimer: number;
      };
      // Resolved once: a probe that gets remounted counts as hidden.
      const probes = probeNames.map((name) => ({
        name,
        el: document.querySelector(`[${attr}="${name}"]`),
      }));
      const start = performance.now();
      w.__e2eProbeSamples = [];
      w.__e2eProbeTimer = window.setInterval(() => {
        const hidden = probes
          .filter(({ el }) => !el || !el.isConnected || !el.checkVisibility())
          .map(({ name }) => name);
        const table = probes.find(({ name }) => name === 'table')?.el;
        w.__e2eProbeSamples.push({
          t: Math.round(performance.now() - start),
          hidden,
          tableBusy: table?.getAttribute('aria-busy') === 'true',
        });
      }, 25);
    },
    [PROBE_ATTR, names] as const,
  );
}

async function stopSampler(page: Page): Promise<ProbeSample[]> {
  return page.evaluate(() => {
    const w = window as unknown as {
      __e2eProbeSamples: ProbeSample[];
      __e2eProbeTimer: number;
    };
    window.clearInterval(w.__e2eProbeTimer);
    return w.__e2eProbeSamples;
  });
}

test.describe(
  'AdminVFolderNodeListPage - Header stability while the table refetches',
  { tag: ['@regression', '@admin', '@vfolder', '@functional'] },
  () => {
    let folderName: string;
    let folderCreated: boolean;

    test.beforeEach(async ({ page, request }) => {
      folderName =
        'e2e-test-admin-data-refetch-' +
        Date.now() +
        '-' +
        Math.random().toString(36).slice(2, 6);
      folderCreated = false;
      await loginAsAdmin(page, request);
    });

    test.afterEach(async ({ page }) => {
      if (!folderCreated) return;
      await cleanupVFolderSafely(page, folderName, 'admin-data');
    });

    test('Admin can create a folder on the admin Data page while the header and table stay on screen', async ({
      page,
    }) => {
      await navigateTo(page, 'admin/data');

      const createButton = page.getByRole('button', { name: 'Create Folder' });
      await tagProbe(
        page
          .getByRole('tab', { name: /^Active/ })
          .or(page.getByRole('button', { name: /^Active/ }))
          .first(),
        'tabs',
      );
      await tagProbe(
        page.getByRole('radio', { name: 'All', exact: true }),
        'type-filter',
      );
      await tagProbe(page.getByTestId('vfolder-filter'), 'search');
      await tagProbe(createButton, 'create-button');
      await tagProbe(
        page.locator('.bai-table-astryx-dim-layer').first(),
        'table',
      );
      const probeNames = [
        'tabs',
        'type-filter',
        'search',
        'create-button',
        'table',
      ];

      await startSampler(page, probeNames);

      await createButton.click();
      const folderCreationModal = new FolderCreationModal(page);
      await folderCreationModal.modalToBeVisible();
      const projectSelect = page.getByTestId('folder-create-project-select');
      await projectSelect.click();
      await page
        .getByRole('option', { name: TARGET_PROJECT_OPTION })
        .first()
        .click();
      await folderCreationModal.fillFolderName(folderName);
      await (await folderCreationModal.getCreateButton()).click();
      folderCreated = true;
      await page
        .getByRole('dialog')
        .filter({ hasText: 'Create a new storage folder' })
        .waitFor({ state: 'hidden' });

      // The mutation's own refetch must bring the row in — no manual refresh.
      await expect(
        page.getByRole('row').filter({ hasText: folderName }),
      ).toBeVisible({ timeout: 15000 });
      // Keep sampling through the follow-up round trips the create triggers.
      await page.waitForTimeout(SETTLE_MS);

      const samples = await stopSampler(page);
      expect(samples.length).toBeGreaterThan(10);

      const hiddenSamples = samples.filter((s) => s.hidden.length > 0);
      expect(
        hiddenSamples.slice(0, 5),
        'header controls and table must never be hidden during the create',
      ).toEqual([]);

      const busySamples = samples.filter((s) => s.tableBusy);
      expect(
        busySamples.slice(0, 5),
        'a fetch-key refetch must not dim the table',
      ).toEqual([]);
    });
  },
);
