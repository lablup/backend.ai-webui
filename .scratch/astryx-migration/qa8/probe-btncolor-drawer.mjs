/**
 * qa8 group — (D)/(E) session DETAIL DRAWER action buttons.
 *
 * Opens the drawer by clicking the session-name link (`.bai-link-hover`) in the
 * first row of /session, then measures every control inside the drawer in BOTH
 * modes at 1600x1000. Also captures the SessionInfoCell row actions on the list
 * itself (same `bai-nac-action-button-*` family as /admin/users).
 *
 * Read-only: nothing is confirmed or terminated; drawer closed with Escape.
 *
 * Usage: node .scratch/astryx-migration/qa8/probe-btncolor-drawer.mjs
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const BASE =
  process.env.BASE ?? 'https://to-astryx.backend-ai-webui.localhost:1357/';
const ROOT = process.env.ROOT ?? '.scratch/astryx-migration/qa8';
const TAG = process.env.TAG ?? 'before';

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

async function setMode(mode) {
  await page.evaluate((m) => {
    const want = m === 'dark';
    if ((document.documentElement.dataset.theme === 'dark') === want) return;
    const b = Array.from(document.querySelectorAll('button')).find((x) =>
      /dark|theme|mode/i.test(x.getAttribute('aria-label') || x.title || ''),
    );
    if (b) b.click();
  }, mode);
  await page.waitForTimeout(2200);
  const applied = await page.evaluate(
    () => document.documentElement.dataset.theme ?? null,
  );
  if (applied !== mode) throw new Error(`theme toggle did not take: ${applied}`);
  return applied;
}

const result = {};

for (const mode of ['light', 'dark']) {
  const m = (result[mode] = {});
  await page.goto(`${BASE}session`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(12000);
  m.appliedTheme = await setMode(mode);
  await page.waitForTimeout(1500);

  // ---- theme tokens, read on the APP subtree (not the error page) --------
  m.tokens = await page.evaluate(() => {
    const host =
      document.querySelector('.bai-nac-action-button-default') ??
      document.querySelector('main') ??
      document.documentElement;
    const cs = getComputedStyle(host);
    const keys = [
      '--color-text-blue',
      '--color-background-blue',
      '--color-text-red',
      '--color-background-red',
      '--color-text-accent',
      '--color-accent',
      '--color-error',
      '--color-text-primary',
      '--color-text-secondary',
    ];
    const out = { astryxTheme: document.documentElement.dataset.astryxTheme };
    for (const k of keys) out[k] = cs.getPropertyValue(k).trim();
    return out;
  });

  // ---- SessionInfoCell row actions (same family as /admin/users) ---------
  m.listRowActions = await page.evaluate(() =>
    [...document.querySelectorAll('[class*="bai-nac-action-button"]')]
      .slice(0, 6)
      .map((b) => {
        const c = getComputedStyle(b);
        return {
          label: b.getAttribute('aria-label'),
          variant: b.dataset.variant ?? null,
          color: c.color,
          bg: c.backgroundColor,
          cls: b.className.split(' ').filter((x) => x.startsWith('bai-')).join(' '),
        };
      }),
  );

  // ---- open the drawer ---------------------------------------------------
  const link = page.locator('table .bai-link-hover').first();
  await link.click({ timeout: 20000 }).catch((e) => {
    m.clickError = String(e).slice(0, 120);
  });
  await page.waitForTimeout(10000);
  m.url = page.url();

  m.drawer = await page.evaluate(() => {
    const roots = [
      ...document.querySelectorAll(
        '.astryx-drawer, [class*="drawer"], [role="dialog"], dialog',
      ),
    ];
    if (!roots.length) return { found: false, buttons: [] };
    const seen = new Set();
    const buttons = [];
    for (const root of roots) {
      for (const b of root.querySelectorAll('button, a[href]')) {
        if (seen.has(b)) continue;
        seen.add(b);
        const r = b.getBoundingClientRect();
        if (r.width === 0) continue;
        const c = getComputedStyle(b);
        const svg = b.querySelector('svg');
        buttons.push({
          tag: b.tagName,
          label: (b.getAttribute('aria-label') || b.textContent || '')
            .trim()
            .slice(0, 44),
          variant: b.dataset.variant ?? null,
          size: b.dataset.size ?? null,
          color: c.color,
          bg: c.backgroundColor,
          box: { w: +r.width.toFixed(1), h: +r.height.toFixed(1) },
          svgColor: svg ? getComputedStyle(svg).color : null,
          svgInlineStyle: svg?.getAttribute('style') ?? null,
          cls:
            b.className
              .split(' ')
              .filter((x) => x.startsWith('bai-') || x.startsWith('astryx-'))
              .join(' ') || null,
        });
      }
    }
    return { found: true, rootCount: roots.length, buttons };
  });

  await page.screenshot({ path: `${ROOT}/${TAG}-btncolor-drawer-${mode}.png` });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(600);
}

result.pageErrors = pageErrors;
fs.writeFileSync(
  `${ROOT}/${TAG}-btncolor-drawer.json`,
  JSON.stringify(result, null, 2),
);
console.log('written');
await browser.close();
