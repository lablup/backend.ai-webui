/**
 * qa8 BATCH-3 Q-37/Q-38 — shared helper.
 *
 * Read-only against the shared cluster: navigate + open overlays only. No
 * mutation is ever submitted.
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
 * Dark mode is entered through a REAL Playwright click on the header button.
 * An in-page `element.click()` does not drive it.
 */
export async function setMode(page, mode) {
  const cur = await page.evaluate(
    () => document.documentElement.dataset.theme ?? null,
  );
  if (cur !== mode) {
    await page
      .getByRole('button', { name: /^(dark|light) mode$/i })
      .first()
      .click();
    await page.waitForTimeout(1500);
  }
  const applied = await page.evaluate(
    () => document.documentElement.dataset.theme ?? null,
  );
  if (applied !== mode) throw new Error(`theme toggle did not take: ${applied}`);
  return applied;
}

/** Wait until no skeleton is left on the page (or timeout). */
export async function settle(page, ms = 25000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    const n = await page.evaluate(
      () => document.querySelectorAll('[class*="skeleton" i]').length,
    );
    if (n === 0) return true;
    await page.waitForTimeout(500);
  }
  return false;
}

/** Resolved theme custom properties on <html>. */
export const themeVars = (page, names) =>
  page.evaluate((ns) => {
    const cs = getComputedStyle(document.documentElement);
    const out = { theme: document.documentElement.dataset.theme ?? null };
    for (const n of ns) out[n] = cs.getPropertyValue(n).trim();
    return out;
  }, names);

/**
 * Every icon-only button under `rootSel`: accessible label + painted colour.
 * `label` is the aria-label, which is also where the Q-38 i18n key leaks.
 */
export const iconButtons = (page, rootSel) =>
  page.evaluate((sel) => {
    const root = document.querySelector(sel);
    if (!root) return { error: `no ${sel}` };
    return Array.from(root.querySelectorAll('button')).map((b) => {
      const cs = getComputedStyle(b);
      const r = b.getBoundingClientRect();
      return {
        label: b.getAttribute('aria-label'),
        text: b.textContent?.trim().slice(0, 24) ?? '',
        cls: (b.className || '').toString().slice(0, 120),
        variant: b.getAttribute('data-variant'),
        color: cs.color,
        bg: cs.backgroundColor,
        w: +r.width.toFixed(1),
        h: +r.height.toFixed(1),
        visible: r.width > 0 && r.height > 0,
      };
    });
  }, sel);

/**
 * Colour of one button (located by EXACT aria-label) at rest and on hover.
 *
 * `rootSel` is matched with `querySelectorAll` and the LAST visible match is
 * used: `.astryx-drawer` matches every mounted drawer, including closed ones
 * that come earlier in the DOM, and `document.querySelector` silently picks
 * the wrong (empty) one — which is how the first pass reported "no button
 * matching …" for buttons a sibling query could see.
 *
 * Also reports `--color-text-accent` AS RESOLVED ON THE BUTTON, because the
 * admin accent is a subtree `<Theme>` (`AstryxAdminTheme`) — reading it off
 * `documentElement` gives the brand value on every route.
 */
export async function restAndHover(page, rootSel, label) {
  const handle = await page.evaluateHandle(
    ([sel, want]) => {
      const roots = Array.from(document.querySelectorAll(sel)).filter(
        (r) => r.getBoundingClientRect().height > 0,
      );
      const root = roots[roots.length - 1] ?? document;
      return (
        Array.from(root.querySelectorAll('button')).find(
          (b) => b.getAttribute('aria-label') === want,
        ) ?? null
      );
    },
    [rootSel, label],
  );
  const el = handle.asElement();
  if (!el) return { error: `no button with aria-label === ${label}` };
  const read = () =>
    el.evaluate((b) => {
      const cs = getComputedStyle(b);
      return {
        color: cs.color,
        bg: cs.backgroundColor,
        bgImage: cs.backgroundImage,
        accentVar: cs.getPropertyValue('--color-text-accent').trim(),
        cls: b.className.toString().split(' ').slice(0, 4).join(' '),
      };
    });
  const rest = await read();
  await el.hover();
  await page.waitForTimeout(400);
  const hover = await read();
  await page.mouse.move(4, 4);
  await page.waitForTimeout(250);
  return { label, rest, hover };
}
