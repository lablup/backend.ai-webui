/**
 * qa2-c full table-page audit.
 *
 * For every table page: capture BEFORE (the qa2-c fixes neutralised at runtime)
 * and AFTER (the fixes live), in light and dark, and print the measured
 * vertical rhythm of the table block — the gap above the table (filter/action
 * row -> table) and below it (table -> pagination).
 *
 * BEFORE is reproduced by re-asserting the pre-fix declarations rather than by
 * checking out the old build: the fix is exactly (a) zeroing the block-axis
 * container-bleed vars on the dim layer and (b) marginXS -> marginSM on the
 * bottom bar, so undoing those two in a stylesheet is a faithful A/B.
 */
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const BASE = process.env.QA_BASE ?? 'http://127.0.0.1:5930/';
const ENDPOINT = process.env.BAI_ENDPOINT ?? 'http://10.82.0.130:8090';
const OUT = process.env.QA_OUT ?? '.scratch/astryx-migration/shots/qa2-c';
mkdirSync(OUT, { recursive: true });

// Re-assert the exact pre-fix computed values measured on the unpatched build:
// the scroll wrapper carried margin-top/-bottom = -1 * the card's 24px block
// padding, and the bottom bar sat at marginTop: token.marginXS (8px).
const UNFIX_CSS = `
  .bai-table-astryx-dim-layer .astryx-table-scroll-wrapper {
    margin-top: calc(-1 * var(--spacing-6)) !important;
    margin-bottom: calc(-1 * var(--spacing-6)) !important;
  }
  .bai-table-astryx-dim-layer + .astryx-stack {
    margin-top: var(--spacing-2) !important;
  }
`;

const PAGES = (process.env.QA_PAGES ?? '').split(',').filter(Boolean);

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1200 },
  ignoreHTTPSErrors: true,
});
await ctx.addInitScript((ep) => {
  try {
    localStorage.setItem('backendaiwebui.api_endpoint', ep);
  } catch {
    /* storage unavailable */
  }
}, ENDPOINT);
const page = await ctx.newPage();
await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(9000);
const u = page.locator('input[placeholder*="mail" i]').first();
if (await u.count()) {
  await u.fill(process.env.BAI_EMAIL ?? 'admin@lablup.com');
  await page
    .locator('input[type="password"]')
    .first()
    .fill(process.env.BAI_PW ?? 'wJalrXUt');
  await page
    .getByRole('button', { name: /login/i })
    .first()
    .click();
}
await page.waitForTimeout(15000);
const PREFIX = new URL(page.url()).pathname.replace(/\/[^/]*$/, '');
console.log('PREFIX=', PREFIX);

/** Measure the gap above and below every table block on the page. */
const MEASURE = () => {
  const out = [];
  for (const dim of document.querySelectorAll('.bai-table-astryx-dim-layer')) {
    const block = dim.parentElement; // BAITableAstryx root
    const wrap = dim.querySelector('.astryx-table-scroll-wrapper');
    if (!wrap) continue;
    const r = wrap.getBoundingClientRect();
    const prev = block.previousElementSibling;
    const bar = dim.nextElementSibling;
    const cs = getComputedStyle(wrap);
    out.push({
      tableTop: Math.round(r.top),
      tableBottom: Math.round(r.bottom),
      bleedTop: cs.marginTop,
      bleedBottom: cs.marginBottom,
      // gap between the row above the table block and the table itself
      gapAbove: prev
        ? Math.round(r.top - prev.getBoundingClientRect().bottom)
        : null,
      // gap between the table and its pagination bar
      gapBelow: bar
        ? Math.round(bar.getBoundingClientRect().top - r.bottom)
        : null,
    });
  }
  return out;
};

// `ThemeModeProvider` persists only `themeMode` (see hooks/useThemeMode.tsx),
// via `useLocalStorageGlobalState`, which JSON-encodes its value.
async function setDark(dark) {
  await page.evaluate((d) => {
    localStorage.setItem(
      'backendaiwebui.settings.themeMode',
      JSON.stringify(d ? 'dark' : 'light'),
    );
  }, dark);
}

for (const spec of process.env.QA_DARK_ONLY ? [] : PAGES) {
  const [name, route] = spec.includes('=') ? spec.split('=') : [spec, spec];
  const url = route.startsWith('/')
    ? new URL(route.slice(1), BASE).toString()
    : new URL(PREFIX + '/' + route, BASE).toString();

  for (const mode of ['before', 'after']) {
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page
      .locator('.bai-table-astryx-dim-layer .astryx-table-scroll-wrapper')
      .first()
      .waitFor({ timeout: 30000 })
      .catch(() => {});
    await page.waitForTimeout(3000);
    let handle = null;
    if (mode === 'before') handle = await page.addStyleTag({ content: UNFIX_CSS });
    await page.waitForTimeout(600);
    const m = await page.evaluate(MEASURE);
    console.log(`### ${name} ${mode} ` + JSON.stringify(m));
    await page.screenshot({ path: `${OUT}/${name}-${mode}-light.png` });
    if (handle) await handle.evaluate((el) => el.remove());
  }
}

// Dark pass (after only).
await setDark(true);
for (const spec of PAGES) {
  const [name, route] = spec.includes('=') ? spec.split('=') : [spec, spec];
  const url = route.startsWith('/')
    ? new URL(route.slice(1), BASE).toString()
    : new URL(PREFIX + '/' + route, BASE).toString();
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(9000);
  await page.screenshot({ path: `${OUT}/${name}-after-dark.png` });
}

await browser.close();
