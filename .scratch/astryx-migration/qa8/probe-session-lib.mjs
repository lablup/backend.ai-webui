/**
 * qa8 SESSION group — shared launch/login/dark-mode helper.
 *
 * Read-only against the shared cluster: navigate + open overlays only.
 */
import { chromium } from '@playwright/test';

export const BASE =
  process.env.BASE ?? 'https://to-astryx.backend-ai-webui.localhost:1357/';
export const ROOT = process.env.ROOT ?? '.scratch/astryx-migration/qa8';

export async function launch() {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 1600, height: 1000 },
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

/**
 * Dark mode is entered through the HEADER BUTTON, not by writing a storage key
 * or forcing `color-scheme`.
 */
export async function setMode(page, mode) {
  await page.evaluate((m) => {
    const want = m === 'dark';
    if ((document.documentElement.dataset.theme === 'dark') === want) return;
    const b = Array.from(document.querySelectorAll('button')).find((x) =>
      /dark|theme|mode/i.test(x.getAttribute('aria-label') || x.title || ''),
    );
    if (b) b.click();
  }, mode);
  await page.waitForTimeout(2000);
  const applied = await page.evaluate(
    () => document.documentElement.dataset.theme ?? null,
  );
  if (applied !== mode) throw new Error(`theme toggle did not take: ${applied}`);
  return applied;
}

/** Wait until no skeleton is left on the page (or timeout). */
export async function settle(page, ms = 20000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    const n = await page.evaluate(
      () =>
        document.querySelectorAll(
          '[class*="skeleton" i],[class*="Skeleton"],.ant-skeleton',
        ).length,
    );
    if (n === 0) return true;
    await page.waitForTimeout(500);
  }
  return false;
}

/** rect + selected computed styles for the first match of `sel`. */
export const box = (page, sel, props = []) =>
  page.evaluate(
    ([s, ps]) => {
      const el = document.querySelector(s);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const c = getComputedStyle(el);
      const out = {
        rect: {
          x: +r.x.toFixed(1),
          y: +r.y.toFixed(1),
          w: +r.width.toFixed(1),
          h: +r.height.toFixed(1),
        },
        tag: el.tagName,
        cls: el.className?.baseVal ?? el.className,
      };
      for (const p of ps) out[p] = c.getPropertyValue(p);
      return out;
    },
    [sel, props],
  );
