// FR-4119: admin pages list the signed-in admin's domain (the WebUI assumes a
// single domain). The project-admin half is in
// e2e/project-admin/session/user-select-scope-by-role.spec.ts.
import { createAdminApiContext, gqlAdmin } from '../../utils/admin-api';
import { loginAsAdmin, navigateTo, userInfo } from '../../utils/test-util';
import {
  recordUserSelectOperations,
  searchAndPickUser,
  skipUnlessManager269,
} from '../../utils/user-select-util';
import test, { expect, Page } from '@playwright/test';

/**
 * Opens Admin Settings > Resource Policies > Keypair and stages the 'User'
 * filter (the admin console is superadmin-only).
 */
async function openKeypairPolicyUserFilter(page: Page) {
  await navigateTo(page, 'admin/resource-policy?tab=keypair');
  await page.getByRole('combobox', { name: 'Search filters' }).click();
  await page.getByRole('option', { name: 'User', exact: true }).click();
  return page.getByRole('combobox', { name: 'User', exact: true });
}

test.describe(
  'User picker - Users each role can list',
  {
    tag: [
      '@user',
      '@admin',
      '@critical',
      '@functional',
      '@requires-manager-v26.9',
    ],
  },
  () => {
    for (const [role, login] of [['Superadmin', loginAsAdmin]] as const) {
      test(`${role} can pick users of their domain from the keypair policy user filter`, async ({
        page,
        request,
      }) => {
        const operations = recordUserSelectOperations(page);
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
        await login(page, request);
        await skipUnlessManager269(page);

        const domainName = await page.evaluate(
          () => (globalThis as any).backendaiclient._config.domainName,
        );
        const api = await createAdminApiContext();
        const { domainV2 } = await gqlAdmin<{
          domainV2: { entityId: string };
        }>(
          api,
          `query ($name: String!) { domainV2(domainName: $name) { entityId } }`,
          { name: domainName },
        ).finally(() => api.dispose());

        const trigger = await openKeypairPolicyUserFilter(page);
        await searchAndPickUser(page, trigger, 'User', userInfo.user2.email);
        await expect(trigger).toHaveText(userInfo.user2.email);
        await page.getByRole('button', { name: 'Apply', exact: true }).click();
        await expect(
          page.getByRole('group', { name: 'Search filters' }),
        ).toContainText(userInfo.user2.email);

        // The admin reads the current domain only (ADR 0012).
        const scoped = operations.filter(
          (op) => op.name === 'BAIScopedUserSelectPaginatedQuery',
        );
        expect(scoped.length).toBeGreaterThan(0);
        for (const op of scoped) {
          expect(op.variables.scope).toEqual({
            domain: [{ value: domainV2.entityId }],
          });
          expect(op.response?.errors).toBeUndefined();
        }
        expect(
          scoped.some((op) =>
            JSON.stringify(op.variables.filter ?? {}).includes('iContains'),
          ),
        ).toBe(true);
      });
    }
  },
);
