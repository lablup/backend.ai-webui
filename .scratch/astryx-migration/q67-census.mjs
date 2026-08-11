/**
 * Q-6 blast radius — every `components:` block the brand theme declares,
 * measured on the rendered element, so dev and prod can be diffed. Any key
 * whose value differs between the two is a theme override that the compiled
 * (UNLAYERED) Astryx StyleX outranks in the production bundle.
 */
import fs from 'node:fs';
import { chromium } from '@playwright/test';

const BASE = process.env.BASE;
const ROOT = process.env.ROOT;
const STATE = process.env.STATE ?? 'q67-state.json';
const TAG = process.env.TAG ?? 'dev';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
  storageState: `${ROOT}/${STATE}`,
});
const page = await ctx.newPage();
const pageErrors = [];
page.on('pageerror', (e) => pageErrors.push(String(e)));
page.setDefaultNavigationTimeout(180000);
await page.goto(`${BASE}session`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(16000);

// Open the header user menu so `dropdown-menu` / `dropdown-menu-item` render.
await page
  .locator('[data-testid="user-dropdown-button"], header button')
  .last()
  .click()
  .catch(() => {});
await page.waitForTimeout(1500);

const census = await page.evaluate(() => {
  const probe = (sel, props) => {
    const el = document.querySelector(sel);
    if (!el) return { missing: true };
    const cs = getComputedStyle(el);
    return Object.fromEntries(props.map((p) => [p, cs.getPropertyValue(p)]));
  };
  return {
    'side-nav': probe('.astryx-side-nav', ['background-color', 'width']),
    'side-nav-item': probe('.astryx-side-nav-item', [
      'height',
      'margin-block-start',
      'margin-block-end',
      'padding-inline-start',
      'padding-inline-end',
      'border-radius',
      'font-size',
    ]),
    'side-nav-section': probe('.astryx-side-nav-section', ['padding-block-start']),
    card: probe('.astryx-card', ['padding', 'border-radius']),
    section: probe('.astryx-section', ['padding']),
    'dropdown-menu': probe('.astryx-dropdown-menu', ['gap', 'max-height']),
    'dropdown-menu-item': probe('.astryx-dropdown-menu-item', ['padding', 'line-height']),
    dialog: probe('.astryx-dialog', ['background-color']),
    progressbar: probe('.astryx-progressbar', ['background-color']),
  };
});

fs.writeFileSync(
  `${ROOT}/shots/tab-sider-restore/${TAG}-census.json`,
  JSON.stringify({ TAG, BASE, pageErrors, census }, null, 2),
);
console.log(JSON.stringify({ TAG, pageErrors, census }, null, 2));
await browser.close();
