// The resource group detail drawer on the admin Agents page. Split from
// e2e/project/agent-summary/agent-summary.spec.ts.
import {
  createAdminApiContext,
  createResourceGroupViaApi,
  deleteResourceGroupViaApi,
  sweepStaleResourceGroupsViaApi,
} from '../../utils/admin-api';
import { loginAsAdmin, navigateTo } from '../../utils/test-util';
import test, { expect, type Page } from '@playwright/test';

// A dedicated, agent-less group: editing its defaults cannot change how
// sessions other specs launch are scheduled.
const RESOURCE_GROUP_PREFIX = 'e2e-rg-detail-';

async function openResourceGroupDrawer(page: Page, name: string) {
  // The superadmin intro tour (AdminViewSwitchTour) otherwise covers the page.
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
  await navigateTo(page, 'agent?tab=resourceGroup');
  // The list pages at 10 groups; a bare search term filters it by name.
  const searchFilter = page.getByRole('combobox', { name: 'Search filters' });
  await searchFilter.fill(name);
  await searchFilter.press('Enter');
  await page.getByRole('button', { name, exact: true }).click();
  const drawer = page.getByRole('dialog', { name: 'Resource Group Info' });
  await expect(drawer).toBeVisible();
  await expect(drawer.getByText(name, { exact: true })).toBeVisible();
  return drawer;
}

test.describe(
  'Resource Group Detail Drawer',
  {
    tag: [
      '@regression',
      '@agent-summary',
      '@functional',
      '@requires-manager-v26.4',
    ],
  },
  () => {
    let resourceGroupName: string;
    let created = false;

    test.beforeEach(async () => {
      created = false;
      resourceGroupName = `${RESOURCE_GROUP_PREFIX}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
      const api = await createAdminApiContext();
      try {
        await sweepStaleResourceGroupsViaApi(
          api,
          new RegExp(`^${RESOURCE_GROUP_PREFIX}`),
        );
        await createResourceGroupViaApi(api, resourceGroupName);
        created = true;
      } finally {
        await api.dispose();
      }
    });

    // Best-effort: a leftover group is swept by the next run's beforeEach.
    test.afterEach(async () => {
      if (!created) return;
      try {
        const api = await createAdminApiContext();
        try {
          if (!(await deleteResourceGroupViaApi(api, resourceGroupName))) {
            console.warn(
              `[agent-summary] could not delete resource group ${resourceGroupName}`,
            );
          }
        } finally {
          await api.dispose().catch(() => {});
        }
      } catch (error) {
        console.warn(
          `[agent-summary] resource group cleanup failed for ${resourceGroupName}:`,
          error,
        );
      }
    });

    test('Superadmin can open the resource group detail drawer and see the default option tabs', async ({
      page,
      request,
    }) => {
      await loginAsAdmin(page, request);
      const drawer = await openResourceGroupDrawer(page, resourceGroupName);

      const tabs = drawer.getByRole('navigation', { name: 'Tabs' });
      const sessionTab = tabs.getByRole('button', {
        name: /^Default Session Options/,
      });
      const deploymentTab = tabs.getByRole('button', {
        name: /^Default Deployment Options/,
      });
      await expect(sessionTab).toBeVisible();
      await expect(deploymentTab).toBeVisible();

      // The session tab is active on open.
      await expect(sessionTab).toHaveAttribute('aria-current', 'true');
      await expect(
        drawer.getByRole('heading', { name: 'Session Execution Options' }),
      ).toBeVisible();
      await expect(
        drawer.getByRole('heading', { name: 'Scheduler Options' }),
      ).toBeVisible();

      await deploymentTab.click();
      await expect(deploymentTab).toHaveAttribute('aria-current', 'true');
      await expect(
        drawer.getByRole('heading', { name: 'Session Execution Options' }),
      ).toBeHidden();
      await expect(
        drawer.getByRole('heading', { name: 'Handler Options' }),
      ).toBeVisible();
    });

    test('Superadmin can edit the default session options of a resource group', async ({
      page,
      request,
    }) => {
      await loginAsAdmin(page, request);
      const drawer = await openResourceGroupDrawer(page, resourceGroupName);

      const schedulerSection = drawer
        .locator('.bai-rg-options-section')
        .filter({
          has: page.getByRole('heading', { name: 'Scheduler Options' }),
        });
      // 10 is the manager's default priority for a new resource group.
      await expect(
        schedulerSection.getByText('10', { exact: true }),
      ).toBeVisible();
      // The edit button is revealed on hover.
      await schedulerSection.hover();
      await schedulerSection.getByRole('button', { name: 'Edit' }).click();

      const modal = page.getByRole('dialog', {
        name: 'Edit Default Session Options',
      });
      await expect(modal).toBeVisible();
      // Every option is replaced on save; an image would be required as soon
      // as any session execution value is set, so edit a scheduler option.
      const priority = modal.getByRole('spinbutton', { name: 'Priority' });
      await expect(priority).toHaveValue('10');
      await priority.fill('42');
      await modal.getByRole('button', { name: 'Save' }).click();

      await expect(modal).toBeHidden();
      await expect(
        page
          .getByRole('region', { name: 'Notifications' })
          .getByText('Default options saved.'),
      ).toBeVisible();
      await expect(
        schedulerSection.getByText('42', { exact: true }),
      ).toBeVisible();
    });
  },
);
