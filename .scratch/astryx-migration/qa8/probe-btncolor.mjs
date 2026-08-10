/**
 * qa8 group — "action buttons no longer look clickable" cluster.
 *
 * Measures, in BOTH modes at 1600x1000, computed `color` / `background-color`
 * / `data-variant` for every action control on:
 *
 *   (A) /admin/users        BAINameActionCell row actions  vs  bulk actions
 *   (B) /admin/users        the overflow ("More actions") menu rows
 *   (C) /admin/environment  Control-column icon buttons + card toolbar
 *   (D/E) session detail drawer  info / history / copy / rename buttons
 *
 * Read-only: opens overlays with explicit selectors, dismisses with Escape,
 * never clicks OK / Confirm / Delete.
 *
 * Usage: node .scratch/astryx-migration/qa8/probe-btncolor.mjs
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

/** Dark mode is entered through the HEADER BUTTON only. */
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

const DUMP = (sel, limit) =>
  page.evaluate(
    ([s, n]) => {
      const roots = s ? [...document.querySelectorAll(s)] : [document.body];
      const seen = new Set();
      const out = [];
      for (const root of roots) {
        for (const b of root.querySelectorAll(
          'button, [role="menuitem"], [role="option"]',
        )) {
          if (seen.has(b)) continue;
          seen.add(b);
          const c = getComputedStyle(b);
          const r = b.getBoundingClientRect();
          if (r.width === 0) continue;
          const svg = b.querySelector('svg');
          out.push({
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
            baiClass:
              b.className
                .split(' ')
                .filter((x) => x.startsWith('bai-') || x === 'astryx-button')
                .join(' ') || b.className.slice(0, 60),
          });
          if (out.length >= n) return out;
        }
      }
      return out;
    },
    [sel, limit ?? 40],
  );

const result = {};

for (const mode of ['light', 'dark']) {
  const m = (result[mode] = {});

  // ================= (A)+(B)  /admin/users ==============================
  await page.goto(`${BASE}admin/users`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(9000);
  m.appliedTheme = await setMode(mode);
  await page.waitForTimeout(1500);

  // widen the Email column's cell by hovering the row so actions render
  await page.locator('table tbody tr').first().hover().catch(() => {});
  await page.waitForTimeout(600);
  m.usersRowActions = await DUMP('.bai-name-action-cell-actions', 20);

  // (B) open the overflow menu of the first row
  const more = page
    .locator('.bai-name-action-cell-actions button[aria-label="More actions"]')
    .first();
  if (await more.count()) {
    await more.click().catch(() => {});
    await page.waitForTimeout(900);
    m.usersMoreMenu = await page.evaluate(() => {
      const items = [
        ...document.querySelectorAll(
          '[role="menu"] [role="menuitem"], .astryx-dropdown-menu [role="menuitem"], [role="menuitem"]',
        ),
      ];
      return items.map((el) => {
        const c = getComputedStyle(el);
        const svg = el.querySelector('svg');
        return {
          label: (el.textContent || '').trim().slice(0, 44),
          color: c.color,
          bg: c.backgroundColor,
          variant: el.dataset.variant ?? null,
          svgColor: svg ? getComputedStyle(svg).color : null,
          cls: el.className.slice(0, 70),
        };
      });
    });
    await page.screenshot({ path: `${ROOT}/${TAG}-btncolor-moremenu-${mode}.png` });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
  }

  // (A) bulk actions — check the first row's checkbox
  const before = new Set((await DUMP(null, 200)).map((b) => b.baiClass + b.label));
  const cb = page.locator('table input[type="checkbox"]').nth(1);
  if (await cb.count()) {
    await cb.click({ force: true }).catch(() => {});
    await page.waitForTimeout(1200);
  }
  m.usersBulkActions = (await DUMP(null, 200)).filter(
    (b) => !before.has(b.baiClass + b.label),
  );
  await page.screenshot({ path: `${ROOT}/${TAG}-btncolor-users-${mode}.png` });

  // ================= (C)  /admin/environment =============================
  await page.goto(`${BASE}admin/environment`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(10000);
  m.envControlCell = await page.evaluate(() => {
    const rows = [...document.querySelectorAll('table tbody tr')].slice(0, 2);
    const out = [];
    for (const row of rows) {
      const cells = [...row.querySelectorAll('td')];
      const last = cells[cells.length - 1];
      if (!last) continue;
      for (const b of last.querySelectorAll('button')) {
        const c = getComputedStyle(b);
        const svg = b.querySelector('svg');
        const r = b.getBoundingClientRect();
        out.push({
          label: (b.getAttribute('aria-label') || '').slice(0, 44),
          variant: b.dataset.variant ?? null,
          size: b.dataset.size ?? null,
          color: c.color,
          bg: c.backgroundColor,
          box: { w: +r.width.toFixed(1), h: +r.height.toFixed(1) },
          svgColor: svg ? getComputedStyle(svg).color : null,
          svgInlineStyle: svg?.getAttribute('style') ?? null,
        });
      }
    }
    return out;
  });
  // the copy glyph inside the image-path cell
  m.envCopyGlyph = await page.evaluate(() => {
    const b = document.querySelector(
      'table tbody tr button[aria-label*="opy" i], table tbody tr .bai-copyable-text button',
    );
    if (!b) return null;
    const c = getComputedStyle(b);
    const svg = b.querySelector('svg');
    return {
      label: b.getAttribute('aria-label'),
      variant: b.dataset.variant ?? null,
      color: c.color,
      bg: c.backgroundColor,
      svgColor: svg ? getComputedStyle(svg).color : null,
    };
  });
  m.envToolbar = await DUMP('.astryx-card, [class*="card"]', 12);
  await page.screenshot({ path: `${ROOT}/${TAG}-btncolor-env-${mode}.png` });

  // ================= (D)+(E)  session detail drawer =======================
  await page.goto(`${BASE}session`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(11000);
  // The session-name cell is a BAILink; click its text.
  const nameCell = page
    .locator('table tbody tr td')
    .first()
    .locator('a, button, span')
    .first();
  await nameCell.click().catch(() => {});
  await page.waitForTimeout(9000);
  m.sessionUrl = page.url();
  m.drawerButtons = await DUMP(
    '.astryx-drawer, [class*="drawer"], [role="dialog"], dialog',
    40,
  );
  if (!m.drawerButtons?.length) m.drawerButtons = await DUMP(null, 60);
  await page.screenshot({
    path: `${ROOT}/${TAG}-btncolor-sessiondrawer-${mode}.png`,
    fullPage: false,
  });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);

  // ================= resolved token values ================================
  m.tokens = await page.evaluate(() => {
    const cs = getComputedStyle(document.documentElement);
    const keys = [
      '--color-text-blue',
      '--color-background-blue',
      '--color-text-red',
      '--color-background-red',
      '--color-text-accent',
      '--color-text-primary',
      '--color-text-secondary',
      '--color-accent',
      '--color-error',
      '--color-info',
    ];
    const out = {};
    for (const k of keys) out[k] = cs.getPropertyValue(k).trim();
    return out;
  });
}

result.pageErrors = pageErrors;
fs.writeFileSync(
  `${ROOT}/${TAG}-btncolor.json`,
  JSON.stringify(result, null, 2),
);
console.log('written', `${ROOT}/${TAG}-btncolor.json`);
await browser.close();
