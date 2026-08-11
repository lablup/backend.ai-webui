/**
 * qa8 IMPL group — shared launch / dark-mode / settle helper.
 *
 * Dark mode is entered ONLY through a real Playwright click on the header
 * button; an in-page `element.click()` does not flip the Astryx button.
 * Read-only against the shared cluster: navigate + open overlays only.
 */
import { chromium } from '@playwright/test';

export const BASE =
  process.env.BASE ?? 'https://to-astryx.backend-ai-webui.localhost:1357/';
export const ROOT = process.env.ROOT ?? '.scratch/astryx-migration/qa8';

export async function launch({ width = 1600, height = 1000 } = {}) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width, height },
    ignoreHTTPSErrors: true,
    storageState: `${ROOT}/state.json`,
  });
  const page = await ctx.newPage();
  page.setDefaultNavigationTimeout(180000);
  page.setDefaultTimeout(30000);
  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(e.message));
  return { browser, ctx, page, pageErrors };
}

export async function setMode(page, mode) {
  const now = await page.evaluate(
    () => document.documentElement.dataset.theme ?? null,
  );
  if ((now === 'dark') !== (mode === 'dark')) {
    await page
      .getByRole('button', { name: /^(dark|light) mode$/i })
      .first()
      .click();
    await page.waitForTimeout(2200);
  }
  const applied = await page.evaluate(
    () => document.documentElement.dataset.theme ?? null,
  );
  if (applied !== mode) throw new Error(`theme toggle did not take: ${applied}`);
  return applied;
}

export async function settle(page, ms = 25000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    const n = await page.evaluate(
      () =>
        document.querySelectorAll(
          '[class*="skeleton" i],[class*="Skeleton"]',
        ).length,
    );
    if (n === 0) return true;
    await page.waitForTimeout(400);
  }
  return false;
}

export const r2 = (n) => (n == null ? null : +Number(n).toFixed(2));
