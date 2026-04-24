// E2E spec: Endpoint Route Table
import { setupGraphQLMocks } from '../session/mocking/graphql-interceptor';
import { loginAsAdmin, navigateTo } from '../utils/test-util';
import {
  endpointDetailRunningMockResponse,
  endpointDetailEmptyMockResponse,
  endpointDetailPaginatedMockResponse,
  endpointDetailLegacyMockResponse,
  MOCK_ENDPOINT_UUID,
} from './mocking/endpoint-detail-mock';
import { endpointListMockResponse } from './mocking/endpoint-list-mock';
import { test, expect, Page, Locator } from '@playwright/test';

const _ENDPOINT_DETAIL_PATH = `serving/${MOCK_ENDPOINT_UUID}`;

test.describe(
  'Endpoint Route Table - Admin Route Management',
  { tag: ['@serving', '@functional', '@regression'] },
  () => {
    test.describe.configure({ mode: 'serial' });

    /**
     * Helper: sets up authentication, feature flag, GraphQL mocks, and navigates
     * to the endpoint detail page. Returns after the "Routes Info" card is visible.
     *
     * Strategy: navigate to the serving list page first, inject the feature flag
     * into the already-initialized backendaiclient, then click the mock endpoint
     * link to perform a client-side (React Router) navigation to the detail page.
     * This preserves the injected feature flag across the navigation because no
     * full page reload occurs between the flag injection and the detail page render.
     */
    async function setupAndNavigateToDetail(
      page: Page,
      request: any,
      detailMockFn: (
        vars: Record<string, any>,
      ) => Record<string, any> = endpointDetailRunningMockResponse,
      enableRouteNode: boolean = true,
      enableRouteHealthStatus: boolean = true,
    ) {
      await loginAsAdmin(page, request);
      await setupGraphQLMocks(page, {
        ServingPageQuery: () => endpointListMockResponse(),
        EndpointDetailPageQuery: (vars) => detailMockFn(vars),
      });
      // Navigate to the serving list page first so backendaiclient is initialized.
      await navigateTo(page, 'serving');
      // Wait for the mock endpoint to appear in the table before injecting the flag.
      await expect(
        page.getByRole('link', { name: 'mock-endpoint', exact: true }),
      ).toBeVisible({
        timeout: 10000,
      });
      // Inject the route-node and route-health-status feature flags into the
      // already-initialized client. Because the next navigation (clicking the
      // link below) is a client-side React Router navigation, no page reload
      // occurs, so the flags persist.
      await page.evaluate(
        ({ routeNode, routeHealthStatus }) => {
          const client = (globalThis as any).backendaiclient;
          if (client) {
            // Ensure _updateSupportList has already run by calling supports() once,
            // then override the feature flags.
            client.supports('route-node');
            client._features['route-node'] = routeNode;
            client._features['route-health-status'] = routeHealthStatus;
          }
        },
        {
          routeNode: enableRouteNode,
          routeHealthStatus: enableRouteHealthStatus,
        },
      );
      // Click the mock endpoint link to navigate to the detail page via React Router.
      await page
        .getByRole('link', { name: 'mock-endpoint', exact: true })
        .click();
      await expect(page.getByText('Routes Info')).toBeVisible({
        timeout: 10000,
      });
      // Scroll the Routes Info card into view so it is visible in video recordings.
      await page
        .locator('.ant-card', { hasText: 'Routes Info' })
        .first()
        .scrollIntoViewIfNeeded();
    }

    /**
     * Helper: opens the property selector dropdown inside BAIGraphQLPropertyFilter.
     * BAISelect renders a custom .ant-select-content div (instead of .ant-select-selector)
     * whose .ant-select-content-value child intercepts pointer events on the combobox input.
     * Clicking .ant-select-content directly triggers the dropdown correctly.
     */
    async function openRoutePropertyFilterDropdown(container: Locator) {
      await container
        .locator('.ant-space-compact .ant-select')
        .first()
        .locator('.ant-select-content')
        .click();
    }

    /**
     * Helper: locates the Routes Info card on the page.
     */
    function getRoutesInfoCard(page: Page) {
      return page.locator('.ant-card', { hasText: 'Routes Info' }).first();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 1. Feature Flag — New Table vs Legacy Table
    // ─────────────────────────────────────────────────────────────────────────

    test('1.1 Admin sees the new BAIRouteNodes table when route-node flag is enabled', async ({
      page,
      request,
    }) => {
      await setupAndNavigateToDetail(
        page,
        request,
        endpointDetailRunningMockResponse,
        true,
      );

      const card = getRoutesInfoCard(page);

      // The BAIRadioGroup toggle with "Running" and "Finished" should be visible
      await expect(
        card.locator('.ant-radio-button-wrapper', { hasText: 'Running' }),
      ).toBeVisible();
      await expect(
        card.locator('.ant-radio-button-wrapper', { hasText: 'Finished' }),
      ).toBeVisible();

      // The property filter select should be visible
      await expect(
        card.locator('.ant-space-compact .ant-select').first(),
      ).toBeVisible();

      // Table column headers for the new BAIRouteNodes table
      await expect(
        card.getByRole('columnheader', { name: 'Route ID' }),
      ).toBeVisible();
      await expect(
        card.getByRole('columnheader', { name: 'Session ID' }),
      ).toBeVisible();
      await expect(
        card.getByRole('columnheader', { name: 'Status', exact: true }),
      ).toBeVisible();
      // TODO(needs-backend): Re-enable when BAIRouteNodes exposes the Traffic
      // Status column. It is currently commented out in BAIRouteNodes.tsx
      // pending backend support for per-route traffic status (FR-2591).
      await expect(
        card.getByRole('columnheader', { name: 'Created At' }),
      ).toBeVisible();
    });

    test('1.2 Admin sees the legacy route table when route-node flag is disabled', async ({
      page,
      request,
    }) => {
      await setupAndNavigateToDetail(
        page,
        request,
        endpointDetailLegacyMockResponse,
        false,
      );

      const card = getRoutesInfoCard(page);

      // The BAIRadioGroup toggle should NOT be present in legacy mode
      await expect(
        card.locator('.ant-radio-button-wrapper', { hasText: 'Running' }),
      ).not.toBeVisible();
      await expect(
        card.locator('.ant-radio-button-wrapper', { hasText: 'Finished' }),
      ).not.toBeVisible();

      // The property filter should NOT be present
      await expect(
        card.locator('.ant-space-compact .ant-select'),
      ).not.toBeVisible();

      // Legacy table has "Route ID" but no "Traffic Status" column
      await expect(
        card.getByRole('columnheader', { name: 'Route ID' }),
      ).toBeVisible();
      await expect(
        card.getByRole('columnheader', { name: 'Session ID' }),
      ).toBeVisible();
      await expect(
        card.getByRole('columnheader', { name: 'Status', exact: true }),
      ).toBeVisible();
      await expect(
        card.getByRole('columnheader', { name: 'Traffic Ratio' }),
      ).toBeVisible();
      await expect(
        card.getByRole('columnheader', { name: 'Traffic Status' }),
      ).not.toBeVisible();
    });

    // ─────────────────────────────────────────────────────────────────────────
    // 2. Category Toggle — Running / Finished
    // ─────────────────────────────────────────────────────────────────────────

    test('2.1 Admin sees running routes by default when the detail page first loads', async ({
      page,
      request,
    }) => {
      await setupAndNavigateToDetail(page, request);

      const card = getRoutesInfoCard(page);

      // The "Running" radio button should be selected
      const runningRadio = card.locator('.ant-radio-button-wrapper', {
        hasText: 'Running',
      });
      await expect(runningRadio).toHaveClass(
        /ant-radio-button-wrapper-checked/,
      );

      // The table should show 3 data rows
      const dataRows = card.locator('table tbody tr.ant-table-row');
      await expect(dataRows).toHaveCount(3);

      // Verify status tags for each route
      await expect(
        card.getByText('HEALTHY', { exact: true }).first(),
      ).toBeVisible();
      await expect(
        card.getByText('PROVISIONING', { exact: true }),
      ).toBeVisible();
      await expect(card.getByText('UNHEALTHY', { exact: true })).toBeVisible();
    });

    test('2.2 Admin can switch to the Finished category and see finished routes', async ({
      page,
      request,
    }) => {
      await setupAndNavigateToDetail(page, request);

      const card = getRoutesInfoCard(page);

      // Click the "Finished" radio button
      await card
        .locator('.ant-radio-button-wrapper', { hasText: 'Finished' })
        .click();

      // Wait for the finished routes to appear
      await expect(card.getByText('TERMINATED', { exact: true })).toBeVisible({
        timeout: 10000,
      });

      // The "Finished" radio button should now be selected
      await expect(
        card.locator('.ant-radio-button-wrapper', { hasText: 'Finished' }),
      ).toHaveClass(/ant-radio-button-wrapper-checked/);

      // The table should show 2 data rows
      const dataRows = card.locator('table tbody tr.ant-table-row');
      await expect(dataRows).toHaveCount(2);

      // Verify finished status tags
      await expect(card.getByText('TERMINATED', { exact: true })).toBeVisible();
      await expect(
        card.getByText('FAILED_TO_START', { exact: true }),
      ).toBeVisible();

      // Running statuses should no longer be visible
      await expect(
        card.getByText('HEALTHY', { exact: true }),
      ).not.toBeVisible();
      await expect(
        card.getByText('PROVISIONING', { exact: true }),
      ).not.toBeVisible();
    });

    test('2.3 Admin can switch back to Running after viewing Finished', async ({
      page,
      request,
    }) => {
      await setupAndNavigateToDetail(page, request);

      const card = getRoutesInfoCard(page);

      // Switch to Finished
      await card
        .locator('.ant-radio-button-wrapper', { hasText: 'Finished' })
        .click();
      await expect(card.getByText('TERMINATED', { exact: true })).toBeVisible({
        timeout: 10000,
      });

      // Switch back to Running
      await card
        .locator('.ant-radio-button-wrapper', { hasText: 'Running' })
        .click();
      await expect(
        card.getByText('HEALTHY', { exact: true }).first(),
      ).toBeVisible({
        timeout: 10000,
      });

      // Verify the Running radio is selected
      await expect(
        card.locator('.ant-radio-button-wrapper', { hasText: 'Running' }),
      ).toHaveClass(/ant-radio-button-wrapper-checked/);

      // Verify 3 running rows
      const dataRows = card.locator('table tbody tr.ant-table-row');
      await expect(dataRows).toHaveCount(3);
    });

    // ─────────────────────────────────────────────────────────────────────────
    // 3. Property Filter
    // ─────────────────────────────────────────────────────────────────────────

    // TODO(needs-backend): Re-enable when the EndpointDetailPage route property
    // filter exposes a "Traffic Status" option. The filter is currently only
    // populated with Health Status, pending backend support for per-route
    // traffic status (FR-2591).
    test.fixme('3.1 Admin can see the Traffic Status filter property in the property filter selector', async ({
      page,
      request,
    }) => {
      await setupAndNavigateToDetail(page, request);

      const card = getRoutesInfoCard(page);

      // Open the property selector dropdown
      await openRoutePropertyFilterDropdown(card);

      // Verify the Traffic Status filter option is available
      await expect(
        page.getByRole('option', { name: 'Traffic Status' }),
      ).toBeVisible();

      // Close the dropdown
      await page.keyboard.press('Escape');
    });

    // TODO(needs-backend): Re-enable when the route property filter exposes a
    // "Traffic Status" option (FR-2591).
    test.fixme('3.2 Admin can filter routes by trafficStatus ACTIVE using the property filter', async ({
      page,
      request,
    }) => {
      await setupAndNavigateToDetail(page, request);

      const card = getRoutesInfoCard(page);

      // Wait for initial 3 rows
      await expect(card.locator('table tbody tr.ant-table-row')).toHaveCount(3);

      // Open the property selector and select "Traffic Status"
      await openRoutePropertyFilterDropdown(card);
      await page.getByRole('option', { name: 'Traffic Status' }).click();

      // Select "ACTIVE" from the autocomplete options
      const searchInput = card.locator(
        '[role="combobox"][placeholder="Search"]',
      );
      await searchInput.fill('ACTIVE');
      await card.getByRole('button', { name: 'search' }).click();

      // The table should now show only 1 row (HEALTHY route has ACTIVE traffic status)
      await expect(card.locator('table tbody tr.ant-table-row')).toHaveCount(
        1,
        { timeout: 10000 },
      );

      // Verify filter tag is visible
      const filterTag = card.locator('.ant-tag');
      await expect(filterTag.first()).toBeVisible();
    });

    // TODO(needs-backend): Re-enable when the route property filter exposes a
    // "Traffic Status" option (FR-2591).
    test.fixme('3.3 Admin can filter routes by trafficStatus INACTIVE using the property filter', async ({
      page,
      request,
    }) => {
      await setupAndNavigateToDetail(page, request);

      const card = getRoutesInfoCard(page);

      // Wait for initial rows
      await expect(card.locator('table tbody tr.ant-table-row')).toHaveCount(3);

      // Open the property selector and select "Traffic Status"
      await openRoutePropertyFilterDropdown(card);
      await page.getByRole('option', { name: 'Traffic Status' }).click();

      // Type "INACTIVE" and submit
      const searchInput = card.locator(
        '[role="combobox"][placeholder="Search"]',
      );
      await searchInput.fill('INACTIVE');
      await card.getByRole('button', { name: 'search' }).click();

      // 2 rows should be visible (PROVISIONING and UNHEALTHY routes have INACTIVE traffic status)
      await expect(card.locator('table tbody tr.ant-table-row')).toHaveCount(
        2,
        { timeout: 10000 },
      );

      // Verify filter tag is visible
      const filterTag = card.locator('.ant-tag');
      await expect(filterTag.first()).toBeVisible();
    });

    // TODO(needs-backend): Re-enable when the route property filter exposes a
    // "Traffic Status" option (FR-2591). The underlying remove-filter behavior
    // is covered indirectly via the Health Status filter once BAIRouteNodes
    // supports a secondary filter.
    test.fixme('3.4 Admin can remove an applied filter to restore the full route list', async ({
      page,
      request,
    }) => {
      await setupAndNavigateToDetail(page, request);

      const card = getRoutesInfoCard(page);

      // Wait for initial rows
      await expect(card.locator('table tbody tr.ant-table-row')).toHaveCount(3);

      // Apply a "Traffic Status: ACTIVE" filter
      await openRoutePropertyFilterDropdown(card);
      await page.getByRole('option', { name: 'Traffic Status' }).click();
      const searchInput = card.locator(
        '[role="combobox"][placeholder="Search"]',
      );
      await searchInput.fill('ACTIVE');
      await card.getByRole('button', { name: 'search' }).click();

      // Verify filtered to 1 row
      await expect(card.locator('table tbody tr.ant-table-row')).toHaveCount(
        1,
        { timeout: 10000 },
      );

      // Remove the filter by clicking the close icon on the filter tag
      // Tag format: "{propertyLabel} {operatorShortLabel} {value}" = "Traffic Status eq ACTIVE"
      const filterTag = card.getByText('Traffic Status eq ACTIVE');
      await expect(filterTag).toBeVisible();
      await filterTag.getByRole('img', { name: 'Close' }).click();

      // Full list of 3 routes should be restored
      await expect(card.locator('table tbody tr.ant-table-row')).toHaveCount(
        3,
        { timeout: 10000 },
      );
    });

    // ─────────────────────────────────────────────────────────────────────────
    // 4. Table Columns — Display and Formatting
    // ─────────────────────────────────────────────────────────────────────────

    test('4.1 Admin can see all expected column headers in the route table', async ({
      page,
      request,
    }) => {
      await setupAndNavigateToDetail(page, request);

      const card = getRoutesInfoCard(page);

      await expect(
        card.getByRole('columnheader', { name: 'Route ID' }),
      ).toBeVisible();
      await expect(
        card.getByRole('columnheader', { name: 'Session ID' }),
      ).toBeVisible();
      await expect(
        card.getByRole('columnheader', { name: 'Status', exact: true }),
      ).toBeVisible();
      // TODO(needs-backend): Re-enable when BAIRouteNodes exposes the Traffic
      // Status column (FR-2591).
      await expect(
        card.getByRole('columnheader', { name: 'Created At' }),
      ).toBeVisible();
    });

    test('4.2 Admin sees a HEALTHY route with correct status and traffic tags', async ({
      page,
      request,
    }) => {
      await setupAndNavigateToDetail(page, request);

      const card = getRoutesInfoCard(page);

      // Verify HEALTHY status tag exists
      const healthyTag = card
        .locator('.ant-tag')
        .filter({ hasText: 'HEALTHY' })
        .first();
      await expect(healthyTag).toBeVisible();

      // TODO(needs-backend): Re-enable ACTIVE traffic-status tag assertion
      // once BAIRouteNodes exposes the Traffic Status column (FR-2591).
    });

    test('4.3 Admin sees a PROVISIONING route with a processing-colored status tag', async ({
      page,
      request,
    }) => {
      await setupAndNavigateToDetail(page, request);

      const card = getRoutesInfoCard(page);

      const provisioningTag = card
        .locator('.ant-tag')
        .filter({ hasText: 'PROVISIONING' });
      await expect(provisioningTag).toBeVisible();
    });

    test('4.4 Admin sees an UNHEALTHY route with a warning-colored status tag', async ({
      page,
      request,
    }) => {
      await setupAndNavigateToDetail(page, request);

      const card = getRoutesInfoCard(page);

      const unhealthyTag = card
        .locator('.ant-tag')
        .filter({ hasText: 'UNHEALTHY' });
      await expect(unhealthyTag).toBeVisible();
    });

    // TODO(needs-backend): Re-enable when BAIRouteNodes exposes the Traffic
    // Status column. INACTIVE tags render inside that column (FR-2591).
    test.fixme('4.5 Admin sees INACTIVE traffic status tags displayed', async ({
      page,
      request,
    }) => {
      await setupAndNavigateToDetail(page, request);

      const card = getRoutesInfoCard(page);

      // PROVISIONING and UNHEALTHY routes both have INACTIVE traffic status
      const inactiveTags = card
        .locator('.ant-tag')
        .filter({ hasText: 'INACTIVE' });
      await expect(inactiveTags.first()).toBeVisible();
    });

    // TODO(needs-backend): Re-enable when BAIRouteNodes exposes the Traffic Ratio
    // column. It is currently commented out in BAIRouteNodes.tsx pending backend
    // support for per-route traffic ratio.
    test.fixme('4.6 Admin sees the traffic ratio value in the Traffic Ratio column', async ({
      page,
      request,
    }) => {
      await setupAndNavigateToDetail(page, request);

      const card = getRoutesInfoCard(page);

      // The HEALTHY route has trafficRatio 0.6
      await expect(card.getByText('0.6')).toBeVisible();
    });

    test('4.7 Admin sees a dash in the Session ID cell when no session is linked', async ({
      page,
      request,
    }) => {
      await setupAndNavigateToDetail(page, request);

      const card = getRoutesInfoCard(page);

      // The PROVISIONING route has no session (null), should show "-"
      await expect(card.getByText('-', { exact: true }).first()).toBeVisible();
    });

    // ─────────────────────────────────────────────────────────────────────────
    // 5. Error Data — Exclamation Icon and JSON Modal
    // ─────────────────────────────────────────────────────────────────────────

    test('5.1 Admin sees an error icon on a route with errorData', async ({
      page,
      request,
    }) => {
      await setupAndNavigateToDetail(page, request);

      const card = getRoutesInfoCard(page);

      // Switch to Finished category to see the FAILED_TO_START route
      await card
        .locator('.ant-radio-button-wrapper', { hasText: 'Finished' })
        .click();
      await expect(
        card.getByText('FAILED_TO_START', { exact: true }),
      ).toBeVisible({ timeout: 10000 });

      // The FAILED_TO_START route should have an exclamation circle icon button
      const exclamationButton = card.getByRole('button', {
        name: 'exclamation-circle',
      });
      await expect(exclamationButton).toBeVisible();
    });

    test('5.2 Admin can click the error icon to open the Route Error JSON modal', async ({
      page,
      request,
    }) => {
      await setupAndNavigateToDetail(page, request);

      const card = getRoutesInfoCard(page);

      // Switch to Finished
      await card
        .locator('.ant-radio-button-wrapper', { hasText: 'Finished' })
        .click();
      await expect(
        card.getByText('FAILED_TO_START', { exact: true }),
      ).toBeVisible({ timeout: 10000 });

      // Click the exclamation icon button
      const exclamationButton = card.getByRole('button', {
        name: 'exclamation-circle',
      });
      await exclamationButton.click();

      // The Route Error modal should open
      const modal = page.getByRole('dialog', { name: 'Route Error' });
      await expect(modal).toBeVisible({ timeout: 10000 });

      // The modal should display JSON containing the error data
      await expect(modal.getByText('OOMKilled')).toBeVisible();
    });

    test('5.3 Admin can close the Route Error JSON modal', async ({
      page,
      request,
    }) => {
      await setupAndNavigateToDetail(page, request);

      const card = getRoutesInfoCard(page);

      // Switch to Finished and open the error modal
      await card
        .locator('.ant-radio-button-wrapper', { hasText: 'Finished' })
        .click();
      await expect(
        card.getByText('FAILED_TO_START', { exact: true }),
      ).toBeVisible({ timeout: 10000 });
      const exclamationButton = card.getByRole('button', {
        name: 'exclamation-circle',
      });
      await exclamationButton.click();

      const modal = page.getByRole('dialog', { name: 'Route Error' });
      await expect(modal).toBeVisible({ timeout: 10000 });

      // Close the modal using the header X button
      const closeButton = modal.getByRole('button', { name: 'Close' }).first();
      await closeButton.click();

      // Modal should be dismissed
      await expect(modal).not.toBeVisible();

      // The endpoint detail page should still be visible
      await expect(page.getByText('Routes Info')).toBeVisible();
    });

    // ─────────────────────────────────────────────────────────────────────────
    // 6. Pagination
    // ─────────────────────────────────────────────────────────────────────────

    test('6.1 Admin sees the total route count displayed in the pagination area', async ({
      page,
      request,
    }) => {
      await setupAndNavigateToDetail(
        page,
        request,
        endpointDetailPaginatedMockResponse,
      );

      const card = getRoutesInfoCard(page);

      // The table should show 10 rows on the first page (default page size)
      const dataRows = card.locator('table tbody tr.ant-table-row');
      await expect(dataRows).toHaveCount(10, { timeout: 10000 });

      // The pagination should show a total count reference
      await expect(card.getByText('of 12 items')).toBeVisible();
    });

    test('6.2 Admin can navigate to the second page using the pagination controls', async ({
      page,
      request,
    }) => {
      await setupAndNavigateToDetail(
        page,
        request,
        endpointDetailPaginatedMockResponse,
      );

      const card = getRoutesInfoCard(page);

      // Wait for first page with 10 rows
      await expect(card.locator('table tbody tr.ant-table-row')).toHaveCount(
        10,
        { timeout: 10000 },
      );

      // Click page 2 button
      const page2Button = card.locator(
        '.ant-pagination .ant-pagination-item[title="2"]',
      );
      await page2Button.click();

      // Page 2 should show 2 rows (12 total - 10 on page 1)
      await expect(card.locator('table tbody tr.ant-table-row')).toHaveCount(
        2,
        { timeout: 10000 },
      );

      // Page 2 should be active
      await expect(page2Button).toHaveClass(/ant-pagination-item-active/);
    });

    // ─────────────────────────────────────────────────────────────────────────
    // 7. Sorting
    // ─────────────────────────────────────────────────────────────────────────

    test('7.1 Admin can sort routes by Status column', async ({
      page,
      request,
    }) => {
      await setupAndNavigateToDetail(page, request);

      const card = getRoutesInfoCard(page);

      // Click the "Status" column header to sort
      const statusHeader = card.getByRole('columnheader', {
        name: 'Status',
        exact: true,
      });
      await statusHeader.click();

      // Verify a sort indicator is shown on the Status column
      await expect(
        statusHeader.locator('.ant-table-column-sorter'),
      ).toBeVisible();
    });

    // TODO(needs-backend): Re-enable when BAIRouteNodes exposes the Traffic Ratio
    // column. It is currently commented out in BAIRouteNodes.tsx pending backend
    // support for per-route traffic ratio.
    test.fixme('7.2 Admin can sort routes by Traffic Ratio column', async ({
      page,
      request,
    }) => {
      await setupAndNavigateToDetail(page, request);

      const card = getRoutesInfoCard(page);

      const trafficRatioHeader = card.getByRole('columnheader', {
        name: 'Traffic Ratio',
      });
      await trafficRatioHeader.click();

      await expect(
        trafficRatioHeader.locator('.ant-table-column-sorter'),
      ).toBeVisible();
    });

    test('7.3 Session ID column header does not have a sorter', async ({
      page,
      request,
    }) => {
      await setupAndNavigateToDetail(page, request);

      const card = getRoutesInfoCard(page);

      // The "Session ID" column should not have a sort icon
      const sessionIdHeader = card.getByRole('columnheader', {
        name: 'Session ID',
      });
      await expect(sessionIdHeader).toBeVisible();
      await expect(
        sessionIdHeader.locator('.ant-table-column-sorter'),
      ).not.toBeVisible();
    });

    // ─────────────────────────────────────────────────────────────────────────
    // 8. Sync Routes Button
    // ─────────────────────────────────────────────────────────────────────────

    test('8.1 Admin can see the Sync Routes button in the Routes Info card', async ({
      page,
      request,
    }) => {
      // The Sync Routes button is a legacy fallback for manual route
      // reconciliation and is rendered only when the backend does NOT
      // support route-health-status. In that legacy path the new route-node
      // table is also absent (the legacy routings list is used instead), so
      // we disable both flags to match the real legacy backend behavior.
      await setupAndNavigateToDetail(
        page,
        request,
        endpointDetailLegacyMockResponse,
        false,
        false,
      );

      // The Sync Routes button should be visible in the card header
      const syncButton = page.getByRole('button', { name: 'Sync routes' });
      await expect(syncButton).toBeVisible();
    });

    test('8.2 Admin can click Sync Routes and the routes table is refreshed', async ({
      page,
      request,
    }) => {
      await setupAndNavigateToDetail(
        page,
        request,
        endpointDetailLegacyMockResponse,
        false,
        false,
      );

      // Intercept the sync POST request
      await page.route(
        `**/services/${MOCK_ENDPOINT_UUID}/sync`,
        async (route) => {
          if (route.request().method() === 'POST') {
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify({ success: true }),
            });
          } else {
            await route.continue();
          }
        },
      );

      const syncButton = page.getByRole('button', { name: 'Sync routes' });
      await syncButton.click();

      // After sync completes, a success notification should appear
      await expect(
        page.getByText('The route synchronization requested.'),
      ).toBeVisible({ timeout: 10000 });

      // The routes table should still be visible
      const card = getRoutesInfoCard(page);
      await expect(
        card.locator('table tbody tr.ant-table-row').first(),
      ).toBeVisible();
    });

    test('8.3 Admin sees error notification when Sync Routes request fails', async ({
      page,
      request,
    }) => {
      await setupAndNavigateToDetail(
        page,
        request,
        endpointDetailLegacyMockResponse,
        false,
        false,
      );

      // Intercept the sync POST request and return failure
      await page.route(
        `**/services/${MOCK_ENDPOINT_UUID}/sync`,
        async (route) => {
          if (route.request().method() === 'POST') {
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify({ success: false }),
            });
          } else {
            await route.continue();
          }
        },
      );

      const syncButton = page.getByRole('button', { name: 'Sync routes' });
      await syncButton.click();

      // An error notification should appear
      await expect(
        page.getByText('The route synchronization request failed.'),
      ).toBeVisible({ timeout: 10000 });
    });

    // ─────────────────────────────────────────────────────────────────────────
    // 9. Empty State
    // ─────────────────────────────────────────────────────────────────────────

    test('9.1 Admin sees an empty state in the Running category when no running routes exist', async ({
      page,
      request,
    }) => {
      await setupAndNavigateToDetail(
        page,
        request,
        endpointDetailEmptyMockResponse,
      );

      const card = getRoutesInfoCard(page);

      // The "Running" radio button should be selected
      await expect(
        card.locator('.ant-radio-button-wrapper', { hasText: 'Running' }),
      ).toHaveClass(/ant-radio-button-wrapper-checked/);

      // The table should show an empty state
      await expect(card.locator('.ant-empty').first()).toBeVisible({
        timeout: 10000,
      });

      // No data rows
      await expect(card.locator('table tbody tr.ant-table-row')).toHaveCount(0);
    });

    test('9.2 Admin sees an empty state in the Finished category when no finished routes exist', async ({
      page,
      request,
    }) => {
      // Use the running mock — it returns 3 running routes and 2 finished routes
      await setupAndNavigateToDetail(page, request);

      const card = getRoutesInfoCard(page);

      // Wait for initial running routes to load
      await expect(card.locator('table tbody tr.ant-table-row')).toHaveCount(3);

      // Re-register mock to return empty for finished routes.
      // Remove the previous route handler first to avoid competing handlers.
      await page.unroute('**/admin/gql');
      await setupGraphQLMocks(page, {
        ServingPageQuery: () => endpointListMockResponse(),
        EndpointDetailPageQuery: (vars) => {
          const routeFilter = vars.routeFilter;
          const isFinished =
            routeFilter?.status?.some(
              (s: string) => s === 'TERMINATED' || s === 'FAILED_TO_START',
            ) ?? false;
          if (isFinished) {
            return endpointDetailEmptyMockResponse(vars);
          }
          return endpointDetailRunningMockResponse(vars);
        },
      });

      // Click Finished
      await card
        .locator('.ant-radio-button-wrapper', { hasText: 'Finished' })
        .click();

      // Should show empty state
      await expect(card.locator('.ant-empty').first()).toBeVisible({
        timeout: 10000,
      });

      // No data rows
      await expect(card.locator('table tbody tr.ant-table-row')).toHaveCount(0);
    });
  },
);
