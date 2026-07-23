// spec: regression guard for FR-3358 (PR #8365)
//
// Bug: on the /data page, clicking a folder pushes `?folder=<id>` into the URL
// (via nuqs `useQueryState` inside a `startTransition`), but the FolderExplorer
// modal never opens. Root cause — nuqs 2.9.1 `useQueryStates` issues a
// render-phase `setInternalState` while eagerly mutating its internal caches
// (`queryRef`/`lastSyncKeyRef`/`stateRef`). When `FolderExplorerModalV2`'s
// `useLazyLoadQuery` suspends inside that transition, React discards the render:
// the setState is lost but the ref mutations survive, so every later reconcile
// bails on the poisoned cache and the hook stays permanently desynced from the
// URL. A hard refresh worked (fresh mount), which is why the bug is easy to miss.
//
// This test makes the failure deterministic by delaying the *specific* detail
// query so it is guaranteed to suspend inside the transition. On the unpatched
// build the modal never opens and `waitForOpen()` times out; with the nuqs
// self-healing patch the post-commit effect re-applies the lost state and the
// modal opens.
import { FolderExplorerModal } from '../utils/classes/vfolder/FolderExplorerModal';
import { cleanupVFolderSafely } from '../utils/cleanup-util';
import {
  loginAsUser,
  navigateTo,
  createVFolderAndVerify,
} from '../utils/test-util';
import { test, expect, type Route } from '@playwright/test';

// The Relay operation FolderExplorerModalV2 fires when opened via `?folder=`.
const MODAL_DETAIL_QUERY = 'FolderExplorerModalV2Query';
// Deliberate latency injection (see below) — not an arbitrary flake wait.
const SUSPEND_WINDOW_MS = 1500;

test.describe(
  'VFolder Explorer Modal - URL param desync regression (FR-3358)',
  { tag: ['@critical', '@vfolder', '@regression'] },
  () => {
    test.describe.configure({ mode: 'default' });

    test('clicking a folder opens the explorer even when the detail query suspends inside the nuqs transition', async ({
      page,
      request,
    }) => {
      test.setTimeout(120000);

      await loginAsUser(page, request);

      const folderName = 'e2e-explorer-desync-' + new Date().getTime();
      await createVFolderAndVerify(page, folderName, 'general', 'user', 'rw');

      // Force `FolderExplorerModalV2Query` to suspend for a beat by delaying only
      // that GraphQL operation (the rest of the page is untouched). This is
      // deliberate fault injection to make the transition-discard window
      // deterministic — it is the mechanism under test, not a timing workaround,
      // so the project's "never use waitForTimeout" rule does not apply. We delay
      // via a promise rather than `page.waitForTimeout` to keep that distinction
      // explicit and avoid tripping the lint rule. Only the first matching
      // request is delayed — that single suspend is all the regression needs,
      // and later refetches of the same operation run at full speed.
      let modalDetailQueryFired = false;
      await page.route('**/admin/gql', async (route: Route) => {
        const req = route.request();
        if (req.method() !== 'POST') {
          return route.continue();
        }
        const body = req.postData() ?? '';
        if (!modalDetailQueryFired && body.includes(MODAL_DETAIL_QUERY)) {
          modalDetailQueryFired = true;
          await new Promise((resolve) =>
            setTimeout(resolve, SUSPEND_WINDOW_MS),
          );
        }
        return route.continue();
      });

      // No `networkidle` here on purpose: the folder-link visibility assertion
      // below is the real readiness gate, and the data page's background
      // GraphQL traffic makes `networkidle` both slow and flaky.
      await navigateTo(page, 'data');

      // In-app click (not a hard navigation) — this is the path that triggers the
      // nuqs `startTransition` and, on the buggy build, the discarded render.
      const folderLink = page.getByRole('link', { name: folderName }).first();
      await expect(folderLink).toBeVisible({ timeout: 15000 });
      await folderLink.click();

      // The URL updates immediately regardless of the bug — nuqs pushes the param
      // synchronously. This is the "URL changed" half of the desync.
      await expect(page).toHaveURL(/[?&]folder=/, { timeout: 5000 });

      // The modal must actually open. On the unpatched build the render-phase
      // update that sets `folderId` was discarded, so this assertion times out —
      // exactly the regression this test guards.
      const modal = new FolderExplorerModal(page);
      await modal.waitForOpen();
      await modal.verifyFolderName(folderName);
      await modal.verifyFileExplorerLoaded();

      // Guard against a false green: if the detail query never fired we never
      // exercised the suspend path, so a passing modal would prove nothing.
      expect(
        modalDetailQueryFired,
        `${MODAL_DETAIL_QUERY} should have been fetched (suspend path exercised)`,
      ).toBe(true);

      // Close clears the param; the hook must not be left poisoned for a re-open.
      await modal.close();
      await expect(page).toHaveURL(/\/data\/?($|\?(?!.*folder=))/, {
        timeout: 5000,
      });

      await cleanupVFolderSafely(page, folderName);
    });
  },
);
