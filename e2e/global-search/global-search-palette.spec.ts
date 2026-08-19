// spec: global search palette (FR-3558) — open, search, and arrive
import { loginAsAdmin, navigateTo } from '../utils/test-util';
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

/**
 * `data-value` on a row is the hit id, which is the only text-free handle on
 * exactly which row is which — "Statistics" also appears in the breadcrumb of
 * that page's tab hits.
 */
const STATISTICS_PAGE_HIT = 'page:/project/:projectName/statistics';

/**
 * The hit id of the row the arrow keys are currently on. The highlight lives
 * on the input as `aria-activedescendant`, not on the row itself.
 */
const highlightedHit = (page: Page) =>
  expect.poll(async () => {
    const id = await searchInput(page).getAttribute('aria-activedescendant');
    if (!id) return null;
    return palette(page).locator(`[id="${id}"]`).getAttribute('data-value');
  });

const openPalette = async (page: Page) => {
  await page.getByTestId('button-global-search').click();
  await expect(palette(page)).toBeVisible();
};

const search = async (page: Page, query: string) => {
  await searchInput(page).fill(query);
};

/**
 * The palette is behind the `experimental_global_search` user setting, which is
 * off by default. `addInitScript` runs before every document — including the
 * reloads `loginAsAdmin` / `navigateTo` trigger — so the flag is already in
 * `localStorage` by the time the settings atom first reads it.
 */
const enableGlobalSearchSetting = async (page: Page) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      'backendaiwebui.settings.user.experimental_global_search',
      'true',
    );
  });
};

test.describe(
  'Global Search Palette - Navigation',
  { tag: ['@regression', '@global-search', '@functional'] },
  () => {
    test.beforeEach(async ({ page, request }) => {
      await enableGlobalSearchSetting(page);
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
      // The header trigger is the same component that registers `mod+k`, so
      // its presence is the readiness signal the bare press otherwise races.
      await expect(page.getByTestId('button-global-search')).toBeVisible();

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
      await highlightedHit(page).toBe(STATISTICS_PAGE_HIT);

      await page.keyboard.press('Enter');

      // Anchored: the tab hits of this same page land on /statistics?tab=….
      await expect(page).toHaveURL(/\/statistics$/);
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

      // The param IS the highlight: it marks the item, then strips itself.
      // Asserting the un-stripped URL first would race that same window, so
      // the mark and the stripped URL are all this test looks at.
      await expect(page.getByTestId('items-auto-logout')).toHaveAttribute(
        'data-arrival',
        'true',
      );
      await expect(page).not.toHaveURL(/setting=userSettings\.AutoLogout/);
    });

    test('user can run the theme action from the palette', async ({ page }) => {
      const themeButton = page.getByTestId('button-theme');
      const wasDark =
        (await themeButton.getAttribute('aria-label')) === 'Light mode';

      await openPalette(page);
      await search(
        page,
        wasDark ? 'Switch to light mode' : 'Switch to dark mode',
      );

      await palette(page)
        .locator(
          `[data-value="${wasDark ? 'action:theme-light' : 'action:theme-dark'}"]`,
        )
        .click();

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
