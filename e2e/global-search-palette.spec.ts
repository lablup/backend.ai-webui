// spec: global search palette (FR-3558) — open, search, and arrive
import { loginAsAdmin, navigateTo } from './utils/test-util';
import { test, expect, type Page } from '@playwright/test';

const palette = (page: Page) => page.getByRole('dialog', { name: 'Search' });

const searchInput = (page: Page) => palette(page).getByRole('combobox');

/** A result row, ignoring the body-match rows that repeat a page's own title. */
const resultRow = (page: Page, text: string) =>
  palette(page)
    .getByRole('option')
    .filter({ hasText: text })
    .filter({ hasNotText: 'Found in' })
    .first();

const openPalette = async (page: Page) => {
  await page.getByTestId('button-global-search').click();
  await expect(palette(page)).toBeVisible();
};

const search = async (page: Page, query: string) => {
  await searchInput(page).fill(query);
};

test.describe(
  'Global Search Palette - Navigation',
  { tag: ['@regression', '@global-search', '@functional'] },
  () => {
    test.beforeEach(async ({ page, request }) => {
      await loginAsAdmin(page, request);
      await navigateTo(page, 'summary');
    });

    test('user can open the palette from the header button and close it with Escape', async ({
      page,
    }) => {
      await openPalette(page);

      await expect(
        palette(page).getByPlaceholder('Search pages, tabs, and settings'),
      ).toBeVisible();

      await page.keyboard.press('Escape');
      await expect(palette(page)).toBeHidden();
    });

    test('user can open the palette with the keyboard shortcut', async ({
      page,
    }) => {
      await page.keyboard.press('ControlOrMeta+k');

      await expect(palette(page)).toBeVisible();
    });

    test('user can arrow-select a page hit and land on that page', async ({
      page,
    }) => {
      await openPalette(page);
      await search(page, 'Statistics');
      await expect(resultRow(page, 'Statistics')).toBeVisible();

      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');

      await expect(page).toHaveURL(/\/statistics/);
      await expect(palette(page)).toBeHidden();
    });

    test('user can select a tab hit and land on the deep-linked tab', async ({
      page,
    }) => {
      await openPalette(page);
      await search(page, 'Registries');

      await resultRow(page, 'Registries').click();

      await expect(page).toHaveURL(/\/admin\/environment\?.*tab=registry/);
      await expect(page.getByRole('tab', { selected: true })).toContainText(
        'Registries',
      );
    });

    test('user can select a setting hit and arrive on the highlighted item', async ({
      page,
    }) => {
      await openPalette(page);
      await search(page, 'Auto Logout');

      await resultRow(page, 'Auto Logout').click();

      await expect(page).toHaveURL(/setting=userSettings.AutoLogout/);
      // The param IS the highlight: it marks the item, then strips itself.
      await expect(page.getByTestId('items-auto-logout')).toHaveAttribute(
        'data-arrival',
        'true',
      );
      await expect(page).not.toHaveURL(/setting=/);
      await expect(page.getByTestId('items-auto-logout')).toBeVisible();
    });

    test('user can run the theme action from the palette', async ({ page }) => {
      const themeButton = page.getByTestId('button-theme');
      const wasDark =
        (await themeButton.getAttribute('aria-label')) === 'Light mode';

      await openPalette(page);
      await search(page, wasDark ? 'Switch to light mode' : 'Switch to dark');

      await resultRow(page, wasDark ? 'light mode' : 'dark mode').click();

      await expect(palette(page)).toBeHidden();
      await expect(themeButton).toHaveAttribute(
        'aria-label',
        wasDark ? 'Dark mode' : 'Light mode',
      );
    });

    test('user sees the pages they picked under Recent when reopening', async ({
      page,
    }) => {
      await openPalette(page);
      await search(page, 'Statistics');
      await resultRow(page, 'Statistics').click();
      await expect(page).toHaveURL(/\/statistics/);

      await page.keyboard.press('ControlOrMeta+k');

      await expect(
        palette(page)
          .getByRole('group', { name: 'Recent' })
          .getByRole('option')
          .filter({ hasText: 'Statistics' }),
      ).toBeVisible();
    });
  },
);
