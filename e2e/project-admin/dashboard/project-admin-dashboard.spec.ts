// The project admin dashboard cards (#10585).
// Split from e2e/project/dashboard/dashboard.spec.ts.
import {
  WIDGET_TIMEOUT,
  setFailuresOnly,
  waitForGraphQL,
} from '../../utils/dashboard-util';
import { loginAsAdmin, navigateTo } from '../../utils/test-util';
import { test, expect, type Page } from '@playwright/test';

test.describe(
  'Dashboard Page',
  { tag: ['@regression', '@dashboard', '@functional'] },
  () => {
    // -----------------------------------------------------------------------
    // 13. Project Admin Dashboard (/project/:name/admin/dashboard)
    // -----------------------------------------------------------------------
    test.describe('Project Admin Dashboard', () => {
      const adminDashboardUrl = (name: string) =>
        new RegExp(
          `/project/${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/admin/dashboard`,
        );
      let projectName = '';
      let selectedProject = '';

      test.beforeEach(async ({ page, request }) => {
        // The superadmin intro tour (AdminViewSwitchTour) otherwise covers
        // the admin page.
        await page.addInitScript(() => {
          localStorage.setItem(
            'backendaiwebui.settings.user.has_opened_tour_back_to_user_view',
            'true',
          );
          localStorage.setItem(
            'backendaiwebui.settings.user.has_opened_tour_back_to_admin_settings',
            'true',
          );
        });
        await loginAsAdmin(page, request);
        // /summary replace-redirects to /project/:name/dashboard.
        await navigateTo(page, 'summary');
        await expect(page).toHaveURL(/\/project\/[^/]+\/dashboard/, {
          timeout: WIDGET_TIMEOUT,
        });
        projectName =
          new URL(page.url()).pathname.match(/^\/project\/([^/]+)\//)?.[1] ??
          '';
        expect(projectName).not.toBe('');
        const projectSelector = page.getByRole('button', {
          name: 'Select Project',
        });
        await expect(projectSelector).not.toHaveText('');
        selectedProject = (await projectSelector.innerText()).trim();
        await navigateTo(page, `project/${projectName}/admin/dashboard`);
        await expect(page).toHaveURL(adminDashboardUrl(projectName));
      });

      test('Admin can view the project admin dashboard cards', async ({
        page,
      }) => {
        // 1. Every default card of the project admin board is shown
        for (const title of [
          'Session Status',
          'Pending Sessions and Reasons',
          'Resource Allocation',
          'Deployments',
          'Project Folders',
          'Project Users',
          'Audit Log',
        ]) {
          await expect(
            page.getByRole('heading', { name: title, exact: true }),
          ).toBeVisible({ timeout: WIDGET_TIMEOUT });
        }

        // 2. The header project selector stays on the URL's project
        await expect(page).toHaveURL(adminDashboardUrl(projectName));
        await expect(
          page.getByRole('button', { name: 'Select Project' }),
        ).toHaveText(selectedProject);
      });

      test.describe('Audit Log failures only', () => {
        // The switch is saved on the shared admin account's board.
        const auditLogCard = (page: Page) =>
          page
            .locator('.uic-board-item')
            .filter({
              has: page.getByRole('heading', {
                name: 'Audit Log',
                exact: true,
              }),
            })
            .first();
        const failuresOnlySwitch = (page: Page) =>
          auditLogCard(page).getByRole('switch', {
            name: 'Show failures only',
          });
        test.afterEach(async ({ page }) => {
          const toggle = failuresOnlySwitch(page);
          if (await toggle.isVisible().catch(() => false)) {
            await setFailuresOnly(page, toggle, false);
          }
        });

        test('Admin can toggle "Show failures only" on the project admin Audit Log card', async ({
          page,
        }) => {
          // 1. Locate the "Audit Log" card, starting from the switch off
          const widget = auditLogCard(page);
          await expect(widget).toBeVisible({ timeout: WIDGET_TIMEOUT });
          const failuresOnly = failuresOnlySwitch(page);
          await setFailuresOnly(page, failuresOnly, false);

          // 2. Turning the switch on reloads the list with the failure statuses
          const filteredList = waitForGraphQL(
            page,
            'AuditLogPanelScopedListQuery',
            (variables) =>
              JSON.stringify(variables?.filter?.status ?? null).includes(
                'DENIED',
              ),
          );
          await setFailuresOnly(page, failuresOnly, true);
          await filteredList;
          await expect(
            widget.getByRole('group', { name: 'Table' }).getByRole('table'),
          ).toBeVisible({ timeout: WIDGET_TIMEOUT });

          // 3. Turning it off again saves the board without the filter
          await setFailuresOnly(page, failuresOnly, false);
          await expect(failuresOnly).not.toBeChecked();
        });
      });
    });
  },
);
