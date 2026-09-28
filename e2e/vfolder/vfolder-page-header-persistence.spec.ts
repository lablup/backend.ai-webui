// FR-4009 (#9819): creating a folder must not collapse the Data page into the
// route-level skeleton. The tabs, type filter, search box and Create Folder
// button stay on screen for the whole mutation + refetch, the table keeps its
// rows (no skeleton, no dim layer), and the refresh button is the only control
// that shows progress.
import { FolderCreationModal } from '../utils/classes/vfolder/FolderCreationModal';
import { cleanupVFolderSafely } from '../utils/cleanup-util';
import { loginAsAdmin, navigateTo } from '../utils/test-util';
import { test, expect, type Page } from '@playwright/test';

// The project the folder is created in. `default` exists on every test cluster.
const TARGET_PROJECT = process.env.E2E_ADMIN_PROJECT_NAME || 'default';

/**
 * One reading of the page taken while the folder mutation and the list refetch
 * are in flight. `null`/`false` means "the control is not on screen" — a
 * suspended React subtree is hidden with `display: none` rather than unmounted,
 * so presence checks are blind to this regression and every field is measured
 * with `Element.checkVisibility()`.
 */
type PageSample = {
  at: number;
  statusTabs: boolean;
  typeFilter: boolean;
  searchBox: boolean;
  createFolderButton: boolean;
  table: boolean;
  /** The BAITable dim layer carries `aria-busy` while `loading` is set. */
  tableDimmed: boolean;
  refreshBusy: boolean;
};

const SAMPLE_INTERVAL_MS = 25;
/**
 * Extra observation after the refresh button settles. On the regressed build
 * the page stayed blank for up to ~2.3 s after the mutation, so the window has
 * to outlast the last round trip rather than stop at the first quiet moment.
 */
const SETTLE_OBSERVATION_MS = 1500;

/**
 * Starts an in-page sampler on the Data page's header controls and table.
 * Every field is re-resolved from the DOM on each tick (never held as a handle)
 * so a React re-render that replaces a node reads as present, while a
 * suspension that hides one reads as gone.
 */
async function startPageSampler(page: Page) {
  await page.evaluate((intervalMs) => {
    const w = window as unknown as {
      __fr4009Samples?: unknown[];
      __fr4009Timer?: number;
    };
    const isVisible = (element: Element | null | undefined) =>
      !!element && (element as HTMLElement).checkVisibility();
    const buttonWithText = (text: string) =>
      Array.from(document.querySelectorAll('button')).find((button) =>
        (button.textContent ?? '').trim().startsWith(text),
      ) ?? null;

    w.__fr4009Samples = [];
    w.__fr4009Timer = window.setInterval(() => {
      const dimLayer = document.querySelector('.bai-table-astryx-dim-layer');
      const refreshButton = document.querySelector(
        'button[aria-label="Refresh"]',
      );
      (w.__fr4009Samples as unknown[]).push({
        at: Date.now(),
        // The Active / Trash strip renders as buttons (a <nav> TabList), so the
        // Active tab is matched on its label prefix — its text also carries the
        // folder-count badge.
        statusTabs: isVisible(buttonWithText('Active')),
        typeFilter: isVisible(
          document.querySelector('[role="radiogroup"][aria-label="options"]'),
        ),
        searchBox: isVisible(
          document.querySelector('[data-testid="vfolder-filter"]'),
        ),
        createFolderButton: isVisible(buttonWithText('Create Folder')),
        table: isVisible(document.querySelector('table')),
        tableDimmed: dimLayer?.getAttribute('aria-busy') === 'true',
        refreshBusy: refreshButton?.getAttribute('aria-busy') === 'true',
      });
    }, intervalMs);
  }, SAMPLE_INTERVAL_MS);
}

async function readPageSamples(page: Page): Promise<PageSample[]> {
  return page.evaluate(
    () =>
      ((window as unknown as { __fr4009Samples?: unknown[] }).__fr4009Samples ??
        []) as PageSample[],
  );
}

async function stopPageSampler(page: Page): Promise<PageSample[]> {
  return page.evaluate(() => {
    const w = window as unknown as {
      __fr4009Samples?: unknown[];
      __fr4009Timer?: number;
    };
    if (w.__fr4009Timer !== undefined) {
      window.clearInterval(w.__fr4009Timer);
    }
    return (w.__fr4009Samples ?? []) as PageSample[];
  });
}

/** True once the refresh button has shown its pending state and dropped it. */
function refreshButtonCompletedACycle(samples: PageSample[]) {
  const firstBusy = samples.findIndex((sample) => sample.refreshBusy);
  return (
    firstBusy !== -1 &&
    samples.slice(firstBusy).some((sample) => !sample.refreshBusy)
  );
}

function describeSamples(samples: PageSample[], offending: PageSample[]) {
  return (
    `${offending.length} of ${samples.length} samples: ` +
    `first offending ${JSON.stringify(offending[0])}`
  );
}

test.describe(
  'AdminDataPage - folder page header persistence',
  { tag: ['@vfolder', '@admin', '@regression', '@functional'] },
  () => {
    let folderName: string;

    test.beforeEach(async ({ page, request }) => {
      folderName =
        'e2e-test-header-persistence-' +
        Date.now() +
        '-' +
        Math.random().toString(36).slice(2, 6);
      await loginAsAdmin(page, request);
    });

    test.afterEach(async ({ page }) => {
      await cleanupVFolderSafely(page, folderName, 'admin-data');
    });

    test('Admin can create a folder while the Data page header and table stay on screen', async ({
      page,
    }) => {
      // 1. Open the admin Data page and wait until the list has rendered.
      await navigateTo(page, 'admin/data');

      const statusTab = page.getByRole('button', { name: /^Active/ }).first();
      const typeFilter = page.getByRole('radiogroup', { name: 'options' });
      const searchBox = page.getByTestId('vfolder-filter');
      const createFolderButton = page
        .getByRole('button', { name: 'Create Folder' })
        .first();
      const folderTable = page.getByRole('table');

      await expect(statusTab).toBeVisible();
      await expect(typeFilter).toBeVisible();
      await expect(searchBox).toBeVisible();
      await expect(createFolderButton).toBeVisible();
      await expect(folderTable).toBeVisible();

      // 2. Fill in the creation form. The admin Data page has no ambient
      //    project, so the modal's own Target Project selector is required.
      await createFolderButton.click();
      const folderCreationModal = new FolderCreationModal(page);
      await folderCreationModal.modalToBeVisible();
      await page.getByRole('button', { name: 'Select Project' }).click();
      await page
        .getByRole('option', { name: TARGET_PROJECT, exact: true })
        .first()
        .click();
      await folderCreationModal.fillFolderName(folderName);

      // 3. Watch the page from the moment the mutation starts.
      await startPageSampler(page);
      await (await folderCreationModal.getCreateButton()).click();
      await expect(
        page
          .getByRole('dialog')
          .filter({ hasText: 'Create a new storage folder' }),
      ).toBeHidden({ timeout: 30000 });

      // 4. The creation triggers a list refetch; wait for the refresh button to
      //    show its pending state and drop it again, then keep watching long
      //    enough to outlast the follow-up round trips.
      await expect
        .poll(
          async () => refreshButtonCompletedACycle(await readPageSamples(page)),
          {
            timeout: 30000,
            message:
              'the refresh button never showed and cleared its pending state after the folder was created',
          },
        )
        .toBe(true);
      await page.waitForTimeout(SETTLE_OBSERVATION_MS);
      const samples = await stopPageSampler(page);

      // 5. Nothing in the header may have left the screen, and the table must
      //    have kept its rows — neither replaced by a skeleton (a suspended
      //    subtree is hidden, not unmounted) nor dimmed.
      expect(samples.length).toBeGreaterThan(20);

      const headerGone = samples.filter(
        (sample) =>
          !sample.statusTabs ||
          !sample.typeFilter ||
          !sample.searchBox ||
          !sample.createFolderButton,
      );
      expect(
        headerGone,
        `the page header left the screen while the folder was created — ${describeSamples(samples, headerGone)}`,
      ).toEqual([]);

      const tableGone = samples.filter((sample) => !sample.table);
      expect(
        tableGone,
        `the folder table was replaced by its loading skeleton — ${describeSamples(samples, tableGone)}`,
      ).toEqual([]);

      const tableDimmed = samples.filter((sample) => sample.tableDimmed);
      expect(
        tableDimmed,
        `the folder table was dimmed by a fetch-key-only refetch — ${describeSamples(samples, tableDimmed)}`,
      ).toEqual([]);

      // 6. The refresh button is the one control that may show progress.
      expect(
        samples.some((sample) => sample.refreshBusy),
        'the refresh button never showed its pending state, so nothing told the user the list was reloading',
      ).toBe(true);
    });
  },
);
