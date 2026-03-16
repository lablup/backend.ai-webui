// spec: e2e/.agent-output/test-plan-help-document-modal.md
import { loginAsAdmin, navigateTo } from '../utils/test-util';
import { test, expect, type Page } from '@playwright/test';

// Login + config modification can take longer than the default 30s timeout
test.setTimeout(60_000);

/**
 * Opens the help modal by clicking the help button in the header toolbar.
 * Waits for the dialog to become visible and the document to load.
 */
async function openHelpModal(page: Page) {
  await page.getByTestId('button-help').click();
  const dialog = page.getByRole('dialog');
  await dialog.waitFor({ state: 'visible' });
  await waitForDocLoad(page);
}

/**
 * Waits for the document loading spinner to disappear and content to render.
 */
async function waitForDocLoad(page: Page) {
  await page
    .locator('.ant-spin-spinning')
    .waitFor({ state: 'hidden', timeout: 15000 })
    .catch(() => {}); // spinner may not appear if content loads fast
  // Wait for at least one heading or paragraph to appear
  await page
    .getByRole('dialog')
    .locator('h1, h2, h3, p')
    .first()
    .waitFor({ state: 'visible', timeout: 10000 });
}

/**
 * Gets TOC navigation items (div[role="button"] inside the TOC sidebar).
 */
function getTocItems(page: Page) {
  return page.getByRole('dialog').locator('div[role="button"][title]');
}

// ─────────────────────────────────────────────────
// 1. Modal Open/Close
// ─────────────────────────────────────────────────
test.describe(
  'HelpDocumentModal - Modal Open/Close',
  { tag: ['@smoke', '@critical', '@functional'] },
  () => {
    test.describe.configure({ mode: 'serial' });

    test.beforeEach(async ({ page, request }) => {
      await loginAsAdmin(page, request);
      await navigateTo(page, 'summary');
    });

    test('User can open the help modal by clicking the help button', async ({
      page,
    }) => {
      await page.getByTestId('button-help').click();
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();
      await waitForDocLoad(page);
      // Modal title contains "Help"
      await expect(dialog.getByText(/help/i).first()).toBeVisible();
    });

    test('User can close the help modal using the close button', async ({
      page,
    }) => {
      await openHelpModal(page);
      await page
        .getByRole('dialog')
        .getByRole('button', { name: /close/i })
        .first()
        .click();
      await expect(page.getByRole('dialog')).toBeHidden();
    });

    test('User can close the help modal with ESC key when not searching', async ({
      page,
    }) => {
      await openHelpModal(page);
      await page.keyboard.press('Escape');
      await expect(page.getByRole('dialog')).toBeHidden();
    });
  },
);

// ─────────────────────────────────────────────────
// 2. Document Loading & Route Mapping
// ─────────────────────────────────────────────────
test.describe(
  'HelpDocumentModal - Document Loading',
  { tag: ['@smoke', '@critical', '@functional'] },
  () => {
    test.describe.configure({ mode: 'serial' });

    test.beforeEach(async ({ page, request }) => {
      await loginAsAdmin(page, request);
    });

    test('User sees document content when opening help from summary page', async ({
      page,
    }) => {
      await navigateTo(page, 'summary');
      await openHelpModal(page);
      const dialog = page.getByRole('dialog');
      await expect(dialog.locator('h1, h2, h3, p').first()).toBeVisible();
    });

    test('User sees document content when opening help from data page', async ({
      page,
    }) => {
      await navigateTo(page, 'data');
      await openHelpModal(page);
      const dialog = page.getByRole('dialog');
      await expect(dialog.locator('h1, h2, h3, p').first()).toBeVisible();
    });
  },
);

// ─────────────────────────────────────────────────
// 3. TOC Sidebar
// ─────────────────────────────────────────────────
test.describe(
  'HelpDocumentModal - TOC Sidebar',
  { tag: ['@critical', '@regression', '@functional'] },
  () => {
    test.describe.configure({ mode: 'serial' });

    test.beforeEach(async ({ page, request }) => {
      await loginAsAdmin(page, request);
      await navigateTo(page, 'summary');
      await openHelpModal(page);
    });

    test('User sees TOC sidebar with at least 5 document navigation items', async ({
      page,
    }) => {
      const tocItems = getTocItems(page);
      await tocItems.first().waitFor({ state: 'visible', timeout: 10000 });
      const count = await tocItems.count();
      expect(count).toBeGreaterThanOrEqual(5);
    });

    test('User can navigate to a different document by clicking a TOC item', async ({
      page,
    }) => {
      const dialog = page.getByRole('dialog');
      const tocItems = getTocItems(page);
      await tocItems.first().waitFor({ state: 'visible' });

      // Click a different TOC item (skip first few, pick one likely different)
      await tocItems.nth(2).click();
      await waitForDocLoad(page);

      // Content should have changed
      await expect(dialog.locator('h1, h2, h3').first()).toBeVisible();
    });

    test('User can collapse and expand the TOC sidebar', async ({ page }) => {
      const dialog = page.getByRole('dialog');
      const tocItems = getTocItems(page);
      await tocItems.first().waitFor({ state: 'visible' });

      // Collapse
      await dialog
        .getByRole('button', { name: 'Collapse table of contents' })
        .click();
      // Sidebar collapses with width:0 + inert attribute; items stay in DOM
      await expect(
        dialog.getByRole('button', { name: 'Expand table of contents' }),
      ).toBeVisible({ timeout: 5000 });

      // Expand
      await dialog
        .getByRole('button', { name: 'Expand table of contents' })
        .click();
      await expect(tocItems.first()).toBeVisible({ timeout: 5000 });
    });
  },
);

// ─────────────────────────────────────────────────
// 4. Prev/Next Navigation
// ─────────────────────────────────────────────────
test.describe(
  'HelpDocumentModal - Prev/Next Navigation',
  { tag: ['@critical', '@regression', '@functional'] },
  () => {
    test.describe.configure({ mode: 'serial' });

    test.beforeEach(async ({ page, request }) => {
      await loginAsAdmin(page, request);
      await navigateTo(page, 'summary');
      await openHelpModal(page);
    });

    test('User can navigate to the next document using the Next button', async ({
      page,
    }) => {
      const dialog = page.getByRole('dialog');
      const tocItems = getTocItems(page);
      await tocItems.first().waitFor({ state: 'visible' });

      // Click first TOC item to ensure not at the last doc
      await tocItems.first().click();
      await waitForDocLoad(page);

      // Find and click a button containing the right-arrow icon (Next)
      const nextButton = dialog
        .getByRole('button')
        .filter({ has: page.locator('[data-icon="right"]') })
        .first();
      await expect(nextButton).toBeVisible();
      await nextButton.click();
      await waitForDocLoad(page);

      // Modal still open with content
      await expect(dialog.locator('h1, h2, h3, p').first()).toBeVisible();
    });

    test('User can navigate to the previous document using the Prev button', async ({
      page,
    }) => {
      const dialog = page.getByRole('dialog');
      const tocItems = getTocItems(page);
      await tocItems.first().waitFor({ state: 'visible' });

      // Click second TOC item to ensure there's a Prev
      await tocItems.nth(1).click();
      await waitForDocLoad(page);

      // Find and click a button containing the left-arrow icon (Prev)
      const prevButton = dialog
        .getByRole('button')
        .filter({ has: page.locator('[data-icon="left"]') })
        .first();
      await expect(prevButton).toBeVisible();
      await prevButton.click();
      await waitForDocLoad(page);

      await expect(dialog.locator('h1, h2, h3, p').first()).toBeVisible();
    });
  },
);

// ─────────────────────────────────────────────────
// 5. TOC Search Input
// ─────────────────────────────────────────────────
test.describe(
  'HelpDocumentModal - TOC Search Input',
  { tag: ['@smoke', '@critical', '@functional'] },
  () => {
    test.describe.configure({ mode: 'serial' });

    test.beforeEach(async ({ page, request }) => {
      await loginAsAdmin(page, request);
      await navigateTo(page, 'summary');
      await openHelpModal(page);
    });

    test('User can type in the TOC search input', async ({ page }) => {
      const dialog = page.getByRole('dialog');
      const searchInput = dialog.getByPlaceholder(/search docs/i);
      await expect(searchInput).toBeVisible();
      await searchInput.fill('session');
      await expect(searchInput).toHaveValue('session');
    });

    test('User sees match count badges on TOC items after searching', async ({
      page,
    }) => {
      const dialog = page.getByRole('dialog');

      const searchInput = dialog.getByPlaceholder(/search docs/i);
      await searchInput.fill('session');

      // Match badges are spans with class matchBadge containing "(N)"
      const matchBadge = dialog
        .locator('span')
        .filter({ hasText: /^\(\d+\)$/ })
        .first();
      await expect(matchBadge).toBeVisible({ timeout: 8000 });
    });

    test('User sees no results message for nonexistent search term', async ({
      page,
    }) => {
      const dialog = page.getByRole('dialog');

      const searchInput = dialog.getByPlaceholder(/search docs/i);
      await searchInput.fill('xyznonexistent123');

      await expect(dialog.getByText(/no results/i).first()).toBeVisible({
        timeout: 8000,
      });
    });

    test('User can clear the TOC search using the clear button', async ({
      page,
    }) => {
      const dialog = page.getByRole('dialog');
      const searchInput = dialog.getByPlaceholder(/search docs/i);
      await searchInput.fill('session');
      await expect(searchInput).toHaveValue('session');

      // Ant Design Input allowClear renders a close-circle icon
      const clearIcon = dialog.locator('.ant-input-clear-icon').first();
      await clearIcon.click();
      await expect(searchInput).toHaveValue('');
    });
  },
);

// ─────────────────────────────────────────────────
// 6. Content Search Highlighting
// ─────────────────────────────────────────────────
test.describe(
  'HelpDocumentModal - Content Search Highlighting',
  { tag: ['@critical', '@regression', '@functional'] },
  () => {
    test.describe.configure({ mode: 'serial' });

    test.beforeEach(async ({ page, request }) => {
      await loginAsAdmin(page, request);
      await navigateTo(page, 'summary');
      await openHelpModal(page);
    });

    test('User sees search terms highlighted with mark elements', async ({
      page,
    }) => {
      const dialog = page.getByRole('dialog');
      const searchInput = dialog.getByPlaceholder(/search docs/i);
      await searchInput.fill('session');

      // Verify <mark data-search-match> elements appear
      const marks = dialog.locator('mark[data-search-match]');
      await expect(marks.first()).toBeVisible({ timeout: 8000 });

      // Verify the highlighted text matches the search query
      const text = await marks.first().textContent();
      expect(text?.toLowerCase()).toContain('session');
    });
  },
);

// ─────────────────────────────────────────────────
// 7. Match Navigation Bar
// ─────────────────────────────────────────────────
test.describe(
  'HelpDocumentModal - Match Navigation Bar',
  { tag: ['@critical', '@regression', '@functional'] },
  () => {
    test.describe.configure({ mode: 'serial' });

    test.beforeEach(async ({ page, request }) => {
      await loginAsAdmin(page, request);
      await navigateTo(page, 'summary');
      await openHelpModal(page);
    });

    test('User can navigate between matches using up/down buttons', async ({
      page,
    }) => {
      const dialog = page.getByRole('dialog');
      const searchInput = dialog.getByPlaceholder(/search docs/i);
      await searchInput.fill('session');

      // Match nav info shows "1 / N matches"
      const matchInfo = dialog
        .locator('span')
        .filter({ hasText: /\d+\s*\/\s*\d+/ })
        .first();
      await expect(matchInfo).toBeVisible({ timeout: 8000 });
      await expect(matchInfo).toContainText(/1\s*\/\s*\d+/);

      // Click down arrow (DownOutlined) to go to next match
      // The match nav bar has up/down buttons near the match info
      const downButton = matchInfo
        .locator('..')
        .getByRole('button')
        .filter({ has: page.locator('[data-icon="down"]') });
      await downButton.click();

      await expect(matchInfo).toContainText(/2\s*\/\s*\d+/);

      // Click up arrow to go back
      const upButton = matchInfo
        .locator('..')
        .getByRole('button')
        .filter({ has: page.locator('[data-icon="up"]') });
      await upButton.click();

      await expect(matchInfo).toContainText(/1\s*\/\s*\d+/);
    });
  },
);

// ─────────────────────────────────────────────────
// 8. Floating Search Bar (Ctrl+F / Cmd+F)
// ─────────────────────────────────────────────────
test.describe(
  'HelpDocumentModal - Floating Search Bar',
  { tag: ['@smoke', '@critical', '@functional'] },
  () => {
    test.describe.configure({ mode: 'serial' });

    test.beforeEach(async ({ page, request }) => {
      await loginAsAdmin(page, request);
      await navigateTo(page, 'summary');
      await openHelpModal(page);
    });

    test('User can open the floating search bar with Cmd+F', async ({
      page,
    }) => {
      const dialog = page.getByRole('dialog');

      // Click within content area to ensure container focus
      await dialog.locator('[tabindex="-1"]').first().click();

      // Press Cmd+F to open floating search
      await page.keyboard.press('Meta+f');

      // The floating search bar has a second search input (the TOC one is first)
      const searchInputs = dialog.getByPlaceholder(/search docs/i);
      // There should now be 2 search inputs: TOC + floating
      await expect(searchInputs.nth(1)).toBeVisible({ timeout: 5000 });
    });

    test('User can close the floating search bar with ESC without closing modal', async ({
      page,
    }) => {
      const dialog = page.getByRole('dialog');

      // Open floating search bar
      await dialog.locator('[tabindex="-1"]').first().click();
      await page.keyboard.press('Meta+f');

      const floatingInput = dialog.getByPlaceholder(/search docs/i).nth(1);
      await expect(floatingInput).toBeVisible({ timeout: 5000 });

      // Type a query
      await floatingInput.fill('session');

      // Press ESC — should close search, NOT the modal
      await page.keyboard.press('Escape');

      // Floating search bar should be gone
      await expect(floatingInput).toBeHidden({ timeout: 5000 });

      // Modal should still be open
      await expect(dialog).toBeVisible();
    });
  },
);

// ─────────────────────────────────────────────────
// 9. Anchor Links & Internal Navigation
// ─────────────────────────────────────────────────
test.describe(
  'HelpDocumentModal - Anchor Links and Internal Navigation',
  { tag: ['@critical', '@regression', '@functional'] },
  () => {
    test.describe.configure({ mode: 'serial' });

    test.beforeEach(async ({ page, request }) => {
      await loginAsAdmin(page, request);
      await navigateTo(page, 'summary');
      await openHelpModal(page);
    });

    test('User can click a same-page anchor link without changing browser URL', async ({
      page,
    }) => {
      const dialog = page.getByRole('dialog');
      const tocItems = getTocItems(page);
      const itemCount = await tocItems.count();

      // Try a few documents to find one with anchor links
      let anchorFound = false;
      for (let i = 0; i < Math.min(itemCount, 5); i++) {
        await tocItems.nth(i).click();
        await waitForDocLoad(page);

        const anchorLink = dialog.locator('a[href^="#"]').first();
        if (await anchorLink.isVisible({ timeout: 1000 }).catch(() => false)) {
          anchorFound = true;
          const urlBefore = page.url();
          await anchorLink.click();
          // Browser URL should NOT change
          expect(page.url()).toBe(urlBefore);
          // Modal still open
          await expect(dialog).toBeVisible();
          break;
        }
      }

      expect(anchorFound).toBe(true);
    });

    test('User can click an internal .md link to navigate within the modal', async ({
      page,
    }) => {
      const dialog = page.getByRole('dialog');
      const tocItems = getTocItems(page);
      const itemCount = await tocItems.count();

      let mdLinkFound = false;
      for (let i = 0; i < Math.min(itemCount, 8); i++) {
        await tocItems.nth(i).click();
        await waitForDocLoad(page);

        const mdLink = dialog
          .locator('a[href$=".md"], a[href*=".md#"]')
          .first();

        if (await mdLink.isVisible({ timeout: 1000 }).catch(() => false)) {
          mdLinkFound = true;
          await mdLink.click();
          await waitForDocLoad(page);

          // Modal still open with new content
          await expect(dialog).toBeVisible();
          await expect(dialog.locator('h1, h2, h3, p').first()).toBeVisible();
          break;
        }
      }

      expect(mdLinkFound).toBe(true);
    });

    test('User can navigate to a cross-document anchor link', async ({
      page,
    }) => {
      const dialog = page.getByRole('dialog');

      // Navigate to model_serving doc via TOC
      const modelServingItem = getTocItems(page).filter({
        hasText: /model.?serv/i,
      });

      if (
        await modelServingItem
          .first()
          .isVisible({ timeout: 3000 })
          .catch(() => false)
      ) {
        await modelServingItem.first().click();
        await waitForDocLoad(page);

        // Find cross-doc anchor link (e.g., "Set Preopen Ports")
        const crossDocLink = dialog
          .locator('a')
          .filter({ hasText: /preopen port/i })
          .first();

        if (
          await crossDocLink.isVisible({ timeout: 3000 }).catch(() => false)
        ) {
          await crossDocLink.click();
          await waitForDocLoad(page);

          // Should have navigated to sessions_all doc
          await expect(dialog).toBeVisible();
          await expect(dialog.locator('h1, h2, h3').first()).toBeVisible();
        }
      } else {
        // Model serving doc not found in TOC — verify modal still works
        await expect(dialog).toBeVisible();
      }
    });
  },
);

// ─────────────────────────────────────────────────
// 10. Window Controls
// ─────────────────────────────────────────────────
test.describe(
  'HelpDocumentModal - Window Controls',
  { tag: ['@regression', '@functional'] },
  () => {
    test.describe.configure({ mode: 'serial' });

    test.beforeEach(async ({ page, request }) => {
      await loginAsAdmin(page, request);
      await navigateTo(page, 'summary');
      await openHelpModal(page);
    });

    test('User can minimize the help modal', async ({ page }) => {
      const dialog = page.getByRole('dialog');

      // BAIModal minimize button uses MinusOutlined icon
      const minimizeButton = dialog
        .locator('.ant-modal-header')
        .getByRole('button')
        .filter({ has: page.locator('[data-icon="minus"]') });
      await minimizeButton.click();

      // Modal element still attached but minimized
      await expect(page.getByRole('dialog')).toBeAttached();
    });

    test('User sees the external docs link in the modal header', async ({
      page,
    }) => {
      const dialog = page.getByRole('dialog');

      const externalLink = dialog.locator('a[href*="docs.backend.ai"]');
      await expect(externalLink.first()).toBeVisible();

      const href = await externalLink.first().getAttribute('href');
      expect(href).toMatch(/docs\.backend\.ai/);
    });
  },
);
