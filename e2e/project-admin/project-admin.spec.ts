// spec: .specs/FR-2209-project-admin-management/spec.md
// Stories 1-4 (admin scope + members page) plus ProjectSelect badge.
// Full validation requires sibling stack PRs (#6652 serving, #6654 vfolder,
// #6655 sessions, and #6656 header switch confirm) to be merged — tests
// that exercise features exclusively on those branches are marked with
// `test.fixme` with an explanatory comment.
import {
  loginAsCreatedAccount,
  navigateTo,
  webuiEndpoint,
} from '../utils/test-util';
import { test, expect, Page } from '@playwright/test';

/**
 * Credentials for the dedicated project-admin test account.
 *
 * Resolved exclusively from env vars (`E2E_PROJECT_ADMIN_EMAIL` and
 * `E2E_PROJECT_ADMIN_PASSWORD`). No hardcoded fallbacks — real test-server
 * credentials must not be committed. When either var is missing, every test
 * in this file is skipped via `test.skip` with an explanatory message.
 *
 * The referenced account must be a project admin of the project named
 * `E2E_PROJECT_ADMIN_PROJECT` (defaults to `default`) on the test cluster.
 */
const projectAdminEmail = process.env.E2E_PROJECT_ADMIN_EMAIL;
const projectAdminPassword = process.env.E2E_PROJECT_ADMIN_PASSWORD;
const hasProjectAdminCredentials = Boolean(
  projectAdminEmail && projectAdminPassword,
);
const SKIP_REASON =
  'requires E2E_PROJECT_ADMIN_EMAIL and E2E_PROJECT_ADMIN_PASSWORD env vars';

const DEFAULT_PROJECT_NAME = process.env.E2E_PROJECT_ADMIN_PROJECT || 'default';

async function loginAsProjectAdmin(
  page: Page,
  request: Parameters<typeof loginAsCreatedAccount>[1],
): Promise<void> {
  // `test.skip` at the describe-level guards entry, so by the time this
  // runs both values are defined. The non-null assertions keep the type
  // narrow without re-introducing any fallback literal.
  await loginAsCreatedAccount(
    page,
    request,
    projectAdminEmail!,
    projectAdminPassword!,
  );
}

test.beforeEach(() => {
  // Skip all tests in this file if the project-admin credentials are not
  // supplied via env vars. We intentionally avoid hardcoded fallbacks so
  // real cluster credentials cannot be committed to source control.
  test.skip(!hasProjectAdminCredentials, SKIP_REASON);
});

test.describe(
  'FR-2209 Project Admin - menu visibility',
  { tag: ['@project-admin', '@rbac', '@functional'] },
  () => {
    test('project admin can see the Admin category in the sider', async ({
      page,
      request,
    }) => {
      await loginAsProjectAdmin(page, request);

      // The project-admin tier surfaces a subset of admin pages
      // (Sessions, Serving, Data, Members). Presence of any one of them in
      // the sider is sufficient to confirm the admin category is mounted.
      await expect(
        page.getByRole('menuitem', { name: 'Sessions' }).first(),
      ).toBeVisible();
      await expect(
        page.getByRole('link', { name: 'Project Members' }),
      ).toBeVisible();
    });
  },
);

test.describe(
  'FR-2209 Story 1 - admin sessions scope',
  { tag: ['@project-admin', '@rbac', '@functional'] },
  () => {
    test('project admin can navigate to Admin Sessions page', async ({
      page,
      request,
    }) => {
      await loginAsProjectAdmin(page, request);
      await navigateTo(page, '/admin-session');

      // Assert the page rendered (breadcrumb or heading). The exact
      // per-project filter is enforced on the backend side by PR #6655.
      await expect(page).toHaveURL(/\/admin-session/);
      await expect(
        page.getByTestId('webui-breadcrumb').getByText(/Sessions/i),
      ).toBeVisible();
    });

    // Requires sibling PR #6655 (FR-2554): backend + UI scope sessions list
    // to the project-admin's project only. Until #6655 merges, the list is
    // unscoped and a content-based assertion would be meaningless.
    test.fixme('admin sessions list only contains the project-admin project (requires #6655)', async () => {
      // Pending: assert every row's project column equals `default`.
    });
  },
);

test.describe(
  'FR-2209 Story 2 - admin serving scope',
  { tag: ['@project-admin', '@rbac', '@functional'] },
  () => {
    test('project admin can navigate to Admin Serving page', async ({
      page,
      request,
    }) => {
      await loginAsProjectAdmin(page, request);
      await navigateTo(page, '/admin-serving');

      await expect(page).toHaveURL(/\/admin-serving/);
    });

    // The "Start Service" action must be hidden for project-admins in
    // admin-serving. The button is conditionally rendered by PR #6652.
    test.fixme('"Start Service" button is hidden on Admin Serving for project admins (requires #6652)', async () => {
      // Pending: assert getByRole('button', { name: 'Start Service' })
      // is hidden on /admin-serving for a project-admin session.
    });
  },
);

test.describe(
  'FR-2209 Story 3 - admin vfolder scope',
  { tag: ['@project-admin', '@rbac', '@functional'] },
  () => {
    test('project admin can navigate to Admin Data page', async ({
      page,
      request,
    }) => {
      await loginAsProjectAdmin(page, request);
      await navigateTo(page, '/admin-data');

      await expect(page).toHaveURL(/\/admin-data/);
    });

    // Create Folder modal should lock the type and project fields for
    // project admins, and only project-scoped folders should appear in
    // the list. That gating lives on PR #6654.
    test.fixme('Create Folder modal locks type and project for project admins (requires #6654)', async () => {
      // Pending: open Create Folder modal and assert type + project
      // fields are disabled and prefilled with the current project.
    });
  },
);

test.describe(
  'FR-2209 Story 4 - project members page',
  { tag: ['@project-admin', '@rbac', '@functional'] },
  () => {
    test('project admin sees read-only members table with Name/Email/Role columns', async ({
      page,
      request,
    }) => {
      await loginAsProjectAdmin(page, request);
      await navigateTo(page, '/admin-members');

      await expect(page).toHaveURL(/\/admin-members/);

      // Card title / page heading
      await expect(
        page.getByText('Project Members', { exact: true }).first(),
      ).toBeVisible();

      // Table column headers — BAITable surfaces them as
      // `role="columnheader"` on the underlying <th>.
      await expect(
        page.getByRole('columnheader', { name: 'Name', exact: true }),
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: 'Email', exact: true }),
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: 'Role', exact: true }),
      ).toBeVisible();

      // Read-only view: there should be no Add Member / Remove Member
      // controls on the page. Project-admins manage members exclusively
      // via the RBAC Management page per the FR-2209 spec.
      await expect(
        page.getByRole('button', { name: /Add Member/i }),
      ).toHaveCount(0);
      await expect(
        page.getByRole('button', { name: /Remove Member/i }),
      ).toHaveCount(0);
    });
  },
);

test.describe(
  'FR-2209 ProjectSelect - Project Admin badge',
  { tag: ['@project-admin', '@rbac', '@functional'] },
  () => {
    test('"Project Admin" badge appears next to the project in the ProjectSelect dropdown', async ({
      page,
      request,
    }) => {
      await loginAsProjectAdmin(page, request);
      await page.goto(webuiEndpoint);

      // Open the project selector in the header (rendered as a
      // Select-like button with the current project name).
      const selectorTrigger = page
        .getByRole('combobox')
        .filter({ hasText: DEFAULT_PROJECT_NAME })
        .first();
      await expect(selectorTrigger).toBeVisible();
      await selectorTrigger.click();

      // Badge is rendered as a Tag inside the option label.
      await expect(
        page.getByText('Project Admin', { exact: true }).first(),
      ).toBeVisible();
    });
  },
);

test.describe(
  'FR-2209 PR-1b - admin-mode switch confirm',
  { tag: ['@project-admin', '@rbac', '@functional'] },
  () => {
    // Header-level switch-out-of-admin confirm dialog is introduced in
    // PR #6656 (FR-2553) which is a sibling of this PR's base chain.
    // The i18n keys and logic are not present here yet.
    test.fixme('selecting a non-admin project in admin mode prompts a confirm modal (requires #6656)', async () => {
      // Pending: open header project selector, pick a project where
      // the user is NOT admin, assert confirm modal appears with the
      // SwitchOutOfAdminConfirmTitle/Content copy. Click Cancel and
      // assert the selector restores the previous project.
    });
  },
);
