import { loginAsAdmin } from '../utils/test-util';
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page, request }) => {
  await loginAsAdmin(page, request);
  await page.getByRole('link', { name: 'Admin Settings' }).click();
  // antd is gone; the sidebar icon no longer prefixes the link's accessible
  // name with its glyph name ("hdd").
  await page.getByRole('link', { name: 'Resources' }).click();
  await expect(
    page.getByTestId('webui-breadcrumb').getByText('Resources'),
  ).toBeVisible();
  // Click on Agent tab if not already active. `BAITabList` / Astryx
  // `TabList` renders a `nav[aria-label="Tabs"]` of plain `<button>`s —
  // `role="tab"` is never emitted.
  await page
    .getByRole('navigation', { name: 'Tabs' })
    .getByRole('button', { name: 'Agent' })
    .click();
});

test.describe(
  'Agent list',
  { tag: ['@regression', '@agent', '@functional'] },
  () => {
    test('should have at least one connected agent', async ({ page }) => {
      // The active tab is marked with `aria-current="true"`, not an antd
      // `.ant-tabs-tab-active` class.
      await expect(
        page
          .getByRole('navigation', { name: 'Tabs' })
          .getByRole('button', { name: 'Agent' }),
      ).toHaveAttribute('aria-current', 'true');

      await page.getByRole('radio', { name: 'Connected', exact: true }).check();
      await expect(page.getByRole('main')).toContainText('Connected');

      // BAITable renders a plain HTML table, not antd's `.ant-table-row` /
      // `.ant-table-cell` markup.
      const dataRows = page.getByRole('table').locator('tbody tr');
      const rowCount = await dataRows.count();
      expect(rowCount).toBeGreaterThan(0);

      // "ID / Endpoint" is the fixed-left first column, so its cell is
      // always the row's first `cell`.
      const firstAgentCell = dataRows.first().getByRole('cell').first();
      const columnText = await firstAgentCell.textContent();
      const firstAgentId = columnText?.split('tcp://')[0];
      expect(firstAgentId).toBeTruthy();
    });
  },
);
