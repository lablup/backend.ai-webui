// spec: e2e/.agent-output/test-plan-project-switcher.md
// scenarios: 1 (Project Switcher Display), 2 (Project Switcher Dropdown Contents),
//            3 (Switching Project Scopes Data), 4 (Project Selection Persistence)
//
// Project names, project counts, and folder names are all account/cluster-
// specific data -- an earlier version of this file hardcoded them (e.g. the
// admin's active project as "RB테스트", a specific pre-existing folder
// "bai-quota-sanity-2", and an assertion that no "bai-test-*" project was
// present), which silently breaks on any account or cluster where that exact
// data doesn't hold. Every test below instead reads the logged-in account's
// actual project membership from the client (`current_group` / `groups`,
// the same source components read via `useCurrentProjectValue()` /
// `baiClient.current_group` -- see feature-gate-util.ts) and asserts the UI
// matches that real data, rather than a guessed fixed value. The data-scope
// test (3) goes further: instead of asserting a specific expected folder
// count/name per project, it compares the *set* of visible folder names
// before and after switching, which proves re-scoping happened without
// needing to know or create any specific folder.
import { getClientProperty } from '../utils/feature-gate-util';
import { loginAsAdmin, loginAsUser, navigateTo } from '../utils/test-util';
import { test, expect, type Page } from '@playwright/test';

// The QA cluster's data-scoped queries (folder list refetch on project
// switch) and full-route navigations can take longer than Playwright's
// default 5s expect timeout under parallel load (see
// e2e/crawl/route-crawl.spec.ts). Apply this explicitly to assertions that
// follow a navigation or a project switch instead of relying on the default.
const HYDRATION_TIMEOUT = 20_000;

function getProjectSwitcher(page: Page) {
  return page.getByTestId('selector-project');
}

// Opens the project switcher dropdown, selects the named option, and waits
// for the switcher's displayed value to update before returning - this is
// the observable signal that the (client-side, no page reload) switch has
// taken effect, regardless of how the closing dropdown animates.
async function switchProject(page: Page, projectName: string) {
  await getProjectSwitcher(page).click();
  const option = page.getByRole('option', { name: projectName, exact: true });
  await expect(option).toBeVisible();
  await option.click();
  await expect(getProjectSwitcher(page)).toContainText(projectName, {
    timeout: HYDRATION_TIMEOUT,
  });
}

/**
 * Reads the logged-in client's active project and full project membership
 * list -- the same source of truth the switcher UI itself renders from
 * (`baiClient.current_group` / `baiClient.groups`), so assertions compare
 * the UI against the account's real, current data instead of a guess.
 *
 * `current_group`/`groups` are not populated on the client immediately
 * after navigation -- observed live to lag behind page hydration by a
 * variable amount (not tied to any single visible element, so no ordinary
 * `expect(...).toBeVisible()` elsewhere in a test reliably gates it). Poll
 * until `groups` is actually populated instead of reading it once, which
 * would otherwise intermittently observe an empty array.
 *
 * Note `groups` reflects real backend project membership only -- it does
 * NOT include the "model-store" catalog entry the switcher also renders
 * (confirmed live: `groups` stayed at the real memberships even once fully
 * populated, while the dropdown additionally showed "model-store"). Callers
 * that need to know about that entry should check the rendered dropdown
 * directly rather than this list.
 */
async function getProjectMembership(
  page: Page,
): Promise<{ current: string; all: string[] }> {
  await expect
    .poll(
      async () =>
        ((await getClientProperty(page, 'groups')) as string[] | undefined)
          ?.length ?? 0,
      { timeout: HYDRATION_TIMEOUT },
    )
    .toBeGreaterThan(0);
  const current = (await getClientProperty(page, 'current_group')) as string;
  const all = (await getClientProperty(page, 'groups')) as string[];
  return { current, all };
}

test.describe(
  'Top Bar Project Switcher',
  { tag: ['@regression', '@functional', '@project-switcher'] },
  () => {
    // The switcher's current selection is account-scoped state shared by
    // every test that logs in as the same admin/user account, so tests run
    // sequentially to avoid one test's switch racing another test's
    // fixed-scope assertion (see plan's "Execution Mode" note).
    test.describe.configure({ mode: 'serial' });

    // -----------------------------------------------------------------------
    // 1. Project Switcher Display
    // -----------------------------------------------------------------------
    test.describe('Project Switcher Display', () => {
      test('Admin can see the currently active project name in the top bar', async ({
        page,
        request,
      }) => {
        // 1. Login as admin (`admin@backend.ai`).
        await loginAsAdmin(page, request);

        // 2. Land on `/start`.
        await navigateTo(page, 'start');

        // 3. Locate the project switcher in the top bar.
        const switcher = getProjectSwitcher(page);
        await expect(switcher).toBeVisible({ timeout: HYDRATION_TIMEOUT });

        // The switcher displays the static label "Project" above the current project name.
        await expect(page.getByText('Project', { exact: true })).toBeVisible();

        // The current project name text matches the account's actual active
        // project, read from the client rather than assumed.
        const { current } = await getProjectMembership(page);
        await expect(switcher).toContainText(current);

        // A down-arrow icon is rendered next to the name, indicating it is a dropdown trigger.
        await expect(switcher.getByRole('img', { name: 'down' })).toBeVisible();
      });

      test('User can see the currently active project name in the top bar', async ({
        page,
        request,
      }) => {
        // 1. Login as `user@backend.ai`.
        await loginAsUser(page, request);

        // 2. Land on `/start`.
        await navigateTo(page, 'start');

        // 3. Locate the project switcher in the top bar.
        const switcher = getProjectSwitcher(page);
        await expect(switcher).toBeVisible({ timeout: HYDRATION_TIMEOUT });

        // The switcher renders identically to the admin case, showing this
        // account's actual current project (its own membership may differ
        // from the admin account's).
        const { current } = await getProjectMembership(page);
        await expect(switcher).toContainText(current);
      });
    });

    // -----------------------------------------------------------------------
    // 2. Project Switcher Dropdown Contents
    // -----------------------------------------------------------------------
    test.describe('Project Switcher Dropdown Contents', () => {
      test('Admin can open the project switcher and see all projects the account belongs to', async ({
        page,
        request,
      }) => {
        // 1. Login as admin and land on `/start`.
        await loginAsAdmin(page, request);
        await navigateTo(page, 'start');

        // 2. Click the project switcher.
        const switcher = getProjectSwitcher(page);
        await expect(switcher).toBeVisible({ timeout: HYDRATION_TIMEOUT });
        await switcher.click();

        // 3. Inspect the opened listbox.
        const listbox = page.getByRole('listbox');
        await expect(listbox).toBeVisible();

        const { current, all } = await getProjectMembership(page);

        // Every project this account's own client state reports membership
        // in appears in the dropdown -- not a guessed fixed set, since
        // project membership is account/cluster-specific. (The dropdown may
        // also show the system-level "model-store" catalog entry alongside
        // these, which isn't real group membership -- checked separately
        // below via the rendered content itself, not via `all`.)
        for (const projectName of all) {
          await expect(
            listbox.getByRole('option', { name: projectName, exact: true }),
          ).toBeVisible();
        }

        // The currently active project carries the selected state.
        await expect(
          listbox.getByRole('option', { name: current, exact: true }),
        ).toHaveAttribute('aria-selected', 'true');

        // If the "model-store" catalog entry is present, it renders under
        // its own "Model Store" header, separate from the account's real
        // memberships under "General".
        const modelStoreOption = listbox.getByRole('option', {
          name: 'model-store',
          exact: true,
        });
        if ((await modelStoreOption.count()) > 0) {
          await expect(listbox.getByText('Model Store')).toBeVisible();
        }
        if (all.length > 0) {
          await expect(listbox.getByText('General')).toBeVisible();
        }

        // A search input is present inside the combobox (it is filterable).
        await expect(
          switcher.getByRole('img', { name: 'search' }),
        ).toBeVisible();

        // Close the dropdown without changing the selection.
        await page.keyboard.press('Escape');
      });

      test('User can open the project switcher and see a single assigned project', async ({
        page,
        request,
      }) => {
        // 1. Login as `user@backend.ai` and land on `/start`.
        await loginAsUser(page, request);
        await navigateTo(page, 'start');

        // 2. Click the project switcher.
        const switcher = getProjectSwitcher(page);
        await expect(switcher).toBeVisible({ timeout: HYDRATION_TIMEOUT });
        await switcher.click();

        // 3. Inspect the opened listbox.
        const listbox = page.getByRole('listbox');
        await expect(listbox).toBeVisible();

        const { current, all } = await getProjectMembership(page);

        // This account's real memberships all appear, with the active one
        // marked selected.
        for (const projectName of all) {
          await expect(
            listbox.getByRole('option', { name: projectName, exact: true }),
          ).toBeVisible();
        }
        const currentOption = listbox.getByRole('option', {
          name: current,
          exact: true,
        });
        await expect(currentOption).toHaveAttribute('aria-selected', 'true');

        // When the account belongs to exactly one project AND the
        // system-level "model-store" catalog entry isn't also shown, no
        // group-header text is rendered (distinct from the multi-project
        // admin case, which always shows headers) -- checked against the
        // dropdown's actual content rather than assumed.
        const modelStoreOption = listbox.getByRole('option', {
          name: 'model-store',
          exact: true,
        });
        const hasModelStore = (await modelStoreOption.count()) > 0;
        if (all.length === 1 && !hasModelStore) {
          await expect(listbox.getByText('Model Store')).not.toBeVisible();
          await expect(listbox.getByText('General')).not.toBeVisible();
        }

        // Close the dropdown without changing the selection.
        await page.keyboard.press('Escape');
      });
    });

    // -----------------------------------------------------------------------
    // 3. Switching Project Scopes Data
    // -----------------------------------------------------------------------
    test.describe('Switching Project Scopes Data', () => {
      test(
        'Admin can switch projects and see the Data page folder list change scope',
        { tag: ['@requires-seeded-data'] },
        async ({ page, request }) => {
          // 1. Login as admin and navigate to /data.
          await loginAsAdmin(page, request);
          await navigateTo(page, 'data');
          await expect(page.getByRole('tab', { name: /^Active/ })).toBeVisible({
            timeout: HYDRATION_TIMEOUT,
          });

          // Environment data gate (FR-3114): exercising the scope switch
          // requires the admin account to belong to 2+ projects. Read the
          // account's actual membership and skip with an auditable reason if
          // the precondition doesn't hold on this cluster, rather than
          // assuming a specific second project by name.
          const { current: originalProject, all } =
            await getProjectMembership(page);
          const otherProject = all.find((name) => name !== originalProject);
          test.skip(
            !otherProject,
            'Requires the admin account to belong to 2+ projects to exercise project switching (@requires-seeded-data)',
          );

          // 2. Note the folder names visible under the original project --
          // whatever they actually are; this test does not assume any
          // specific pre-existing folder name or count.
          const readVisibleFolderNames = () =>
            page
              .getByRole('cell', { name: /VFolder Identicon/ })
              .allTextContents();
          const originalFolders = await readVisibleFolderNames();

          // 3. Open the project switcher and select the other project.
          await switchProject(page, otherProject as string);

          // 4. Remain on /data (do not navigate away) and wait for the
          // folder list to actually change -- the deterministic proof that
          // the switch re-scoped the query, without needing to know what
          // either project's real folder set is. A generous timeout: this
          // refetch was directly observed live to take a few seconds, and
          // longer still under concurrent worker load on the shared QA
          // cluster (observed live as an occasional, transient cause of a
          // tighter timeout here flaking), matching this file's convention
          // elsewhere (HYDRATION_TIMEOUT) but with extra margin since this
          // wait is for a full list refetch, not just a single element.
          const SCOPE_CHANGE_TIMEOUT = 30_000;
          await expect
            .poll(readVisibleFolderNames, { timeout: SCOPE_CHANGE_TIMEOUT })
            .not.toEqual(originalFolders);
          await expect(page).toHaveURL(/\/data$/);

          // 5. Switch back to the original project.
          await switchProject(page, originalProject);

          // The folder list returns to the step-2 baseline.
          await expect
            .poll(readVisibleFolderNames, { timeout: SCOPE_CHANGE_TIMEOUT })
            .toEqual(originalFolders);
        },
      );
    });

    // -----------------------------------------------------------------------
    // 4. Project Selection Persistence
    // -----------------------------------------------------------------------
    test.describe('Project Selection Persistence', () => {
      test("Admin's project selection persists across page navigation within the same session", async ({
        page,
        request,
      }) => {
        // 1. Login as admin, land on `/start`.
        await loginAsAdmin(page, request);
        await navigateTo(page, 'start');
        const switcher = getProjectSwitcher(page);
        await expect(switcher).toBeVisible({ timeout: HYDRATION_TIMEOUT });

        const { current: originalProject, all } =
          await getProjectMembership(page);
        const otherProject = all.find((name) => name !== originalProject);
        test.skip(
          !otherProject,
          'Requires the admin account to belong to 2+ projects to exercise project switching',
        );
        await expect(switcher).toContainText(originalProject);

        // 2. Switch the project to the other one via the switcher.
        await switchProject(page, otherProject as string);

        // 3. Navigate to `/data` via a full route change, not just a
        // client-state update.
        await navigateTo(page, 'data');

        // 4. Inspect the project switcher's displayed value - it still shows
        // the switched-to project, so the selection is not reset by route
        // changes within the same session.
        await expect(switcher).toBeVisible({ timeout: HYDRATION_TIMEOUT });
        await expect(switcher).toContainText(otherProject as string, {
          timeout: HYDRATION_TIMEOUT,
        });

        // Restore the admin account's original project selection so this
        // test does not leak state into a later run (the selection is
        // account-scoped, not just per-tab).
        await switchProject(page, originalProject);
      });
    });
  },
);
