/** Q-6/Q-7 — card tab + sider item HOVER paint, dev vs prod. */
import { chromium } from '@playwright/test';

const BASE = process.env.BASE ?? 'http://127.0.0.1:6090/';
const ROOT = process.env.ROOT;
const STATE = process.env.STATE ?? 'q67-prod-state.json';
const MODE = process.env.MODE ?? 'light';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
  storageState: `${ROOT}/${STATE}`,
  colorScheme: MODE === 'dark' ? 'dark' : 'light',
});
const page = await ctx.newPage();
const pageErrors = [];
page.on('pageerror', (e) => pageErrors.push(String(e)));
page.setDefaultNavigationTimeout(180000);
await page.goto(`${BASE}session`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(16000);

const read = (sel, nth) =>
  page.evaluate(
    ({ sel, nth }) => {
      const el = document.querySelectorAll(sel)[nth];
      if (!el) return null;
      const cs = getComputedStyle(el);
      return {
        bg: cs.backgroundColor,
        color: cs.color,
        radius: cs.borderRadius,
        borderTopColor: cs.borderTopColor,
        borderBottomColor: cs.borderBottomColor,
        boxShadow: cs.boxShadow,
        outline: cs.outline,
      };
    },
    { sel, nth },
  );

const TAB = '.bai-tab-list--card .astryx-tab';
const NAV = '.bai-sider .astryx-side-nav-item';

const tabRest = await read(TAB, 1);
await page.locator(TAB).nth(1).hover();
await page.waitForTimeout(900);
const tabHover = await read(TAB, 1);

const navRest = await read(NAV, 1);
await page.locator(NAV).nth(1).hover();
await page.waitForTimeout(900);
const navHover = await read(NAV, 1);

console.log(
  JSON.stringify({ MODE, BASE, pageErrors, tabRest, tabHover, navRest, navHover }, null, 2),
);
await browser.close();
