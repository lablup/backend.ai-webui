/** Q-6/Q-7 — collapsed sider metrics (both modes). */
import { chromium } from '@playwright/test';

const BASE = process.env.BASE ?? 'http://127.0.0.1:6070/';
const ROOT = process.env.ROOT;
const TAG = process.env.TAG ?? 'before';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
  storageState: `${ROOT}/${process.env.STATE ?? 'q67-state.json'}`,
});
const page = await ctx.newPage();
const pageErrors = [];
page.on('pageerror', (e) => pageErrors.push(String(e)));
page.setDefaultNavigationTimeout(180000);
await page.goto(`${BASE}session`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(16000);

const shot = async (name) =>
  page.screenshot({ path: `${ROOT}/shots/tab-sider-restore/${TAG}-${name}.png` });

const measure = () =>
  page.evaluate(() => {
    const items = [...document.querySelectorAll('.astryx-side-nav-item')];
    const sider = document.querySelector('.bai-sider');
    const one = (el) => {
      if (!el) return null;
      const cs = getComputedStyle(el);
      const b = el.getBoundingClientRect();
      return {
        label: (el.innerText || '').trim().slice(0, 16),
        x: +b.x.toFixed(1),
        w: +b.width.toFixed(1),
        h: +b.height.toFixed(1),
        radius: cs.borderRadius,
        bg: cs.backgroundColor,
      };
    };
    return {
      siderClass: sider ? sider.className : null,
      siderW: sider ? +sider.getBoundingClientRect().width.toFixed(1) : null,
      collapsed: !!sider && sider.className.includes('bai-sider--collapsed'),
      radii: [...new Set(items.map((n) => getComputedStyle(n).borderRadius))],
      selected: one(items.find((n) => n.getAttribute('data-selected') === 'selected')),
      first: one(items[0]),
    };
  });

const expanded = await measure();
await shot('expanded');

// Collapse via the rail toggle button
const toggled = await page.evaluate(() => {
  const btns = [...document.querySelectorAll('button')];
  const b = btns.find((x) =>
    /collapse|expand|menu|sider|toggle/i.test(
      (x.getAttribute('aria-label') || '') + ' ' + (x.title || '') + ' ' + (x.dataset.testid || ''),
    ),
  );
  if (b) {
    b.click();
    return b.getAttribute('aria-label') || b.dataset.testid || 'clicked';
  }
  return null;
});
await page.waitForTimeout(2500);
const collapsed = await measure();
await shot('collapsed');

console.log(JSON.stringify({ pageErrors, toggled, expanded, collapsed }, null, 2));
await browser.close();
