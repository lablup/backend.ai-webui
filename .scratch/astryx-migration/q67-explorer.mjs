/** Q-6/Q-7 — folder explorer modal: the xl card-tab branch. */
import { chromium } from '@playwright/test';

const BASE = process.env.BASE ?? 'http://127.0.0.1:6070/';
const ROOT = process.env.ROOT;
const MODE = process.env.MODE ?? 'light';
const W = Number(process.env.W ?? 1600);
const TAG = process.env.TAG ?? 'before';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: W, height: 1000 },
  storageState: `${ROOT}/q67-state.json`,
  colorScheme: MODE === 'dark' ? 'dark' : 'light',
});
const page = await ctx.newPage();
const pageErrors = [];
page.on('pageerror', (e) => pageErrors.push(String(e)));
page.setDefaultNavigationTimeout(180000);
await page.goto(`${BASE}data`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(14000);
await page.locator('tbody tr').first().waitFor({ timeout: 40000 });
await page.locator('tbody tr a, tbody tr [role="link"]').first().click();
await page.waitForTimeout(9000);

const m = await page.evaluate(() =>
  [...document.querySelectorAll('nav.astryx-tab-list')].map((nav) => {
    const cs = getComputedStyle(nav);
    const tabs = [...nav.querySelectorAll('.astryx-tab')];
    const sel = tabs.find((t) => t.getAttribute('data-selected') === 'selected');
    const rest = tabs.find((t) => t.getAttribute('data-selected') !== 'selected');
    const g = (el) => {
      if (!el) return null;
      const c = getComputedStyle(el);
      const b = el.getBoundingClientRect();
      return {
        label: (el.innerText || '').trim().slice(0, 16),
        w: +b.width.toFixed(1),
        h: +b.height.toFixed(1),
        color: c.color,
        bg: c.backgroundColor,
        borderTopColor: c.borderTopColor,
        borderBottomColor: c.borderBottomColor,
        radius: `${c.borderTopLeftRadius} ${c.borderTopRightRadius}`,
        padInline: `${c.paddingInlineStart}/${c.paddingInlineEnd}`,
      };
    };
    return {
      style: nav.className.includes('bai-tab-list--card') ? 'card' : 'line',
      navW: +nav.getBoundingClientRect().width.toFixed(1),
      navH: +nav.getBoundingClientRect().height.toFixed(1),
      borderBottom: `${cs.borderBottomWidth} ${cs.borderBottomStyle} ${cs.borderBottomColor}`,
      gap: cs.gap,
      selected: g(sel),
      rest: g(rest),
    };
  }),
);
console.log(JSON.stringify({ MODE, W, pageErrors, strips: m }, null, 2));
await page.screenshot({ path: `${ROOT}/shots/tab-sider-restore/${TAG}-explorer-${W}-${MODE}.png` });
await browser.close();
