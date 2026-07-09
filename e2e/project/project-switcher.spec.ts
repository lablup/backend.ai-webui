// spec: e2e/.agent-output/test-plan-project-switcher.md
// scenarios: 1 (Project Switcher Display), 2 (Project Switcher Dropdown Contents),
//            3 (Switching Project Scopes Data), 4 (Project Selection Persistence)
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

        // The current project name text matches the account's currently active project.
        await expect(switcher).toContainText('RB테스트');

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

        // The switcher renders identically to the admin case, showing the
        // current project name - "default" for this user account, different
        // from the admin account's default of "RB테스트".
        await expect(switcher).toContainText('default');
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

        // The dropdown opens showing option-group headers "Model Store" and "General".
        await expect(listbox.getByText('Model Store')).toBeVisible();
        await expect(listbox.getByText('General')).toBeVisible();

        // Under "Model Store": one option, model-store.
        await expect(
          listbox.getByRole('option', { name: 'model-store' }),
        ).toBeVisible();

        // Under "General": two options, RB테스트 and default; the currently
        // active project (RB테스트) carries the selected state.
        const rbTestOption = listbox.getByRole('option', { name: 'RB테스트' });
        await expect(rbTestOption).toBeVisible();
        await expect(rbTestOption).toHaveAttribute('aria-selected', 'true');
        await expect(
          listbox.getByRole('option', { name: 'default' }),
        ).toBeVisible();

        // The bai-test-* projects visible on the /project admin page are not
        // in this list, since the admin account is not a member of them.
        await expect(
          listbox.getByRole('option', { name: /bai-test-/ }),
        ).toHaveCount(0);

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

        // The dropdown opens showing a single option, "default", marked selected.
        const defaultOption = listbox.getByRole('option', { name: 'default' });
        await expect(defaultOption).toBeVisible();
        await expect(defaultOption).toHaveAttribute('aria-selected', 'true');
        await expect(listbox.getByRole('option')).toHaveCount(1);

        // No option-group header text is rendered - consistent with there
        // being only one project to show (differs from the admin case).
        await expect(listbox.getByText('Model Store')).not.toBeVisible();
        await expect(listbox.getByText('General')).not.toBeVisible();

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

          // 2. Note the "Active N" folder count and row list (baseline: 3
          // active folders, all User-type/personally owned, under "RB테스트").
          const activeTabWithCount = (count: number) =>
            page.getByRole('tab', { name: `Active ${count}`, exact: true });
          await expect(activeTabWithCount(3)).toBeVisible({
            timeout: HYDRATION_TIMEOUT,
          });
          const personalFolderRow = page.getByRole('row', {
            name: 'VFolder Identicon bai-quota-sanity-2',
          });
          await expect(personalFolderRow).toBeVisible();

          // Environment data gate (FR-3114): exercising the scope switch
          // requires the admin account to belong to 2+ projects. Inspect the
          // dropdown's option count and skip with an auditable reason if the
          // precondition no longer holds on this cluster.
          await getProjectSwitcher(page).click();
          const projectOptionCount = await page
            .getByRole('listbox')
            .getByRole('option')
            .count();
          await page.keyboard.press('Escape');
          test.skip(
            projectOptionCount < 2,
            'Requires the admin account to belong to 2+ projects to exercise project switching (@requires-seeded-data)',
          );

          // 3. Open the project switcher and select `default`.
          await switchProject(page, 'default');

          // 4. Remain on /data (do not navigate away) and observe the folder
          // list update: the Active count increases and a new Project-type
          // folder (llama-server, owned by "Project user group / default") appears.
          await expect(activeTabWithCount(4)).toBeVisible({
            timeout: HYDRATION_TIMEOUT,
          });
          const projectFolderRow = page.getByRole('row', {
            name: 'VFolder Identicon llama-server',
          });
          await expect(projectFolderRow).toBeVisible({
            timeout: HYDRATION_TIMEOUT,
          });
          await expect(projectFolderRow.getByText('Project')).toBeVisible();

          // The pre-existing User-type (personal) folder row remains visible
          // and unchanged across the switch.
          await expect(personalFolderRow).toBeVisible();

          // The browser URL does not change during the switch - no navigation/reload.
          await expect(page).toHaveURL(/\/data$/);

          // 5. Re-open the project switcher and switch back to `RB테스트`.
          await switchProject(page, 'RB테스트');

          // The folder list and count return to the step-2 baseline.
          await expect(activeTabWithCount(3)).toBeVisible({
            timeout: HYDRATION_TIMEOUT,
          });
          await expect(projectFolderRow).toBeHidden({
            timeout: HYDRATION_TIMEOUT,
          });
          await expect(personalFolderRow).toBeVisible();
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
        // 1. Login as admin, land on `/start` (default project "RB테스트").
        await loginAsAdmin(page, request);
        await navigateTo(page, 'start');
        const switcher = getProjectSwitcher(page);
        await expect(switcher).toBeVisible({ timeout: HYDRATION_TIMEOUT });
        await expect(switcher).toContainText('RB테스트');

        // 2. Switch the project to `default` via the switcher.
        await switchProject(page, 'default');

        // 3. Navigate to `/data` via a full route change, not just a
        // client-state update.
        await navigateTo(page, 'data');

        // 4. Inspect the project switcher's displayed value - it still shows
        // `default`, so the selection is not reset by route changes within
        // the same session.
        await expect(switcher).toBeVisible({ timeout: HYDRATION_TIMEOUT });
        await expect(switcher).toContainText('default', {
          timeout: HYDRATION_TIMEOUT,
        });

        // Restore the admin account's default project selection so this test
        // does not leak state into a later run (the selection is account-
        // scoped, not just per-tab).
        await switchProject(page, 'RB테스트');
      });
    });
  },
);
