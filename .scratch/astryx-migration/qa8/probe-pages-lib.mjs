/**
 * qa8 group (2) — shared harness for the PAGE-SPECIFIC probes.
 * Mirrors probe-tokens.mjs: same viewport, same storage state, same
 * header-button route into dark mode.
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

/** Dark mode ONLY through the header button (the useThemeMode path). */
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

/** Wait for skeletons to clear (the audit's settle loop). */
export async function settle(page, ms = 8000) {
  const deadline = Date.now() + ms;
  while (Date.now() < deadline) {
    const n = await page.evaluate(
      () =>
        document.querySelectorAll(
          '.astryx-skeleton, [class*="skeleton"], [aria-busy="true"]',
        ).length,
    );
    if (n === 0) break;
    await page.waitForTimeout(500);
  }
  await page.waitForTimeout(600);
}

/** getBoundingClientRect + selected computed styles for one selector. */
export const measure = (page, sel, props) =>
  page.evaluate(
    ([s, ps]) => {
      const el = document.querySelector(s);
      if (!el) return null;
      const c = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      const out = {
        sel: s,
        rect: {
          x: +r.x.toFixed(1),
          y: +r.y.toFixed(1),
          w: +r.width.toFixed(1),
          h: +r.height.toFixed(1),
        },
      };
      for (const p of ps) out[p] = c.getPropertyValue(p);
      return out;
    },
    [sel, props],
  );
