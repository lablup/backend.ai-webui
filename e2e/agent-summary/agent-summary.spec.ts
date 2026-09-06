// spec: Agent Summary page tests
import {
  getSortableColumnHeader,
  loginAsAdmin,
  navigateTo,
} from '../utils/test-util';
import test, { expect } from '@playwright/test';

test.describe(
  'Agent Summary',
  { tag: ['@functional', '@agent-summary'] },
  () => {
    test('Admin can see Agent Summary page with expected columns', async ({
      page,
      request,
    }) => {
      await loginAsAdmin(page, request);
      await navigateTo(page, 'agent-summary');

      // Verify Agent Summary tab is selected. `BAITabList` / Astryx `TabList`
      // renders a `nav[aria-label="Tabs"]` of plain `<button>`s — `role="tab"`
      // is never emitted — and marks the active one with `aria-current="true"`.
      const agentSummaryTab = page
        .getByRole('navigation', { name: 'Tabs' })
        .getByRole('button', { name: 'Agent Summary' });
      await expect(agentSummaryTab).toBeVisible();
      await expect(agentSummaryTab).toHaveAttribute('aria-current', 'true');

      // Verify table columns
      await expect(
        page.getByRole('columnheader', { name: 'ID' }),
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: 'Architecture' }),
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: 'Allocation' }),
      ).toBeVisible();
      // "Resource Group" is sortable — its columnheader's accessible name is
      // overridden by the sort button's aria-label ("Sort by scaling_group"),
      // so match the visible text instead (see getSortableColumnHeader).
      await expect(
        getSortableColumnHeader(page, 'Resource Group'),
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: 'Schedulable' }),
      ).toBeVisible();

      // Verify Connected/Terminated radio filter
      const radioGroup = page.getByRole('radiogroup');
      await expect(radioGroup).toBeVisible();
      await expect(
        radioGroup.getByText('Connected', { exact: true }),
      ).toBeVisible();
      await expect(radioGroup.getByText('Terminated')).toBeVisible();
    });

    test('Admin can switch between Connected and Terminated agents', async ({
      page,
      request,
    }) => {
      await loginAsAdmin(page, request);
      await navigateTo(page, 'agent-summary');

      // Click Terminated
      await page.getByText('Terminated').click();

      // Verify the table is still visible (may show "No data")
      await expect(
        page.getByRole('columnheader', { name: 'ID' }),
      ).toBeVisible();

      // Switch back to Connected
      await page.getByText('Connected', { exact: true }).click();

      // Table should still be visible
      await expect(
        page.getByRole('columnheader', { name: 'ID' }),
      ).toBeVisible();
    });
  },
);
