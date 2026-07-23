// spec: My Environment page tests
import { loginAsAdmin, navigateTo } from '../utils/test-util';
import test, { expect } from '@playwright/test';

test.describe(
  'My Environment',
  { tag: ['@functional', '@my-environment'] },
  () => {
    test('User can see custom image list with expected columns', async ({
      page,
      request,
    }) => {
      await loginAsAdmin(page, request);
      await navigateTo(page, 'my-environment');

      // Verify Images tab is selected by default
      await expect(
        page.getByRole('tab', { name: 'Images', selected: true }),
      ).toBeVisible();

      // Verify table columns
      await expect(
        page.getByRole('columnheader', { name: 'Full image path' }),
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: 'Control' }),
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: 'Registry' }),
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: 'Architecture' }),
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: 'Base image name' }),
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: 'Version' }),
      ).toBeVisible();

      // Scope to the images table to avoid matching other tables or measure rows
      const imagesTable = page.locator('table').filter({
        has: page.getByRole('columnheader', { name: 'Full image path' }),
      });
      const dataRows = imagesTable.locator(
        'tbody tr:not(.ant-table-measure-row)',
      );

      // Verify table has at least one row with data
      await expect(dataRows.first()).toBeVisible({ timeout: 10000 });
    });

    test('User can search custom images', async ({ page, request }) => {
      await loginAsAdmin(page, request);
      await navigateTo(page, 'my-environment');

      // Scope to the images table
      const imagesTable = page.locator('table').filter({
        has: page.getByRole('columnheader', { name: 'Full image path' }),
      });
      const dataRows = imagesTable.locator(
        'tbody tr:not(.ant-table-measure-row)',
      );

      // Wait for initial rows to load and capture count
      await expect(dataRows.first()).toBeVisible({ timeout: 10000 });
      const initialRowCount = await dataRows.count();

      // Derive a search term from the first data row
      const firstRowText = (await dataRows.first().textContent()) ?? '';
      const searchTerm =
        firstRowText
          .trim()
          .split(/\\s+/)
          .find((word) => word.length >= 3) || firstRowText.trim().slice(0, 6);

      const searchInput = page.getByRole('textbox', { name: 'Search images' });
      await expect(searchInput).toBeVisible();
      await searchInput.fill(searchTerm);

      // Verify filtered results
      await expect(dataRows.first()).toBeVisible({ timeout: 10000 });
      const filteredCount = await dataRows.count();
      expect(filteredCount).toBeGreaterThan(0);
      expect(filteredCount).toBeLessThanOrEqual(initialRowCount);
    });
  },
);
