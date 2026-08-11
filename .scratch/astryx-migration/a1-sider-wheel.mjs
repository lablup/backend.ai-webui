/** approved-1 — can a USER scroll the admin rail? wheel + scrollbar affordance. */
import { chromium } from '@playwright/test';

const BASE = process.env.BASE ?? 'http://127.0.0.1:5960/';
const ROOT = process.env.ROOT;
const MODE = process.env.MODE ?? 'light';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
  storageState: `${ROOT}/a1-state.json`,
  colorScheme: MODE === 'dark' ? 'dark' : 'light',
});
const page = await ctx.newPage();
page.setDefaultNavigationTimeout(120000);
await page.goto(`${BASE}admin/settings`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(14000);

const geo = await page.evaluate(() => {
  const nav = document.querySelector('.astryx-side-nav');
  const col = Array.from(nav.children).find((el) =>
    el.querySelector('.astryx-side-nav-item'),
  );
  return {
    colOffsetW: col.offsetWidth,
    colClientW: col.clientWidth,
    scrollbarPx: col.offsetWidth - col.clientWidth,
    scrollTop: col.scrollTop,
    maxScroll: col.scrollHeight - col.clientHeight,
    navOffsetW: nav.offsetWidth,
    navClientW: nav.clientWidth,
  };
});
console.log('GEOMETRY', JSON.stringify(geo));

// Real wheel over the middle of the rail.
await page.mouse.move(120, 500);
await page.mouse.wheel(0, 400);
await page.waitForTimeout(600);
const after = await page.evaluate(() => {
  const nav = document.querySelector('.astryx-side-nav');
  const col = Array.from(nav.children).find((el) =>
    el.querySelector('.astryx-side-nav-item'),
  );
  const items = Array.from(nav.querySelectorAll('.astryx-side-nav-item'));
  const last = items[items.length - 1];
  const footer = Array.from(document.querySelectorAll('div,footer')).find((e) =>
    /Terms of Service/i.test((e.innerText || '').slice(0, 60)),
  );
  return {
    scrollTop: col.scrollTop,
    lastItem: (last.innerText || '').trim().slice(0, 24),
    lastBottom: Math.round(last.getBoundingClientRect().bottom),
    colBottom: Math.round(col.getBoundingClientRect().bottom),
    footerTop: footer ? Math.round(footer.getBoundingClientRect().top) : null,
  };
});
console.log('AFTER WHEEL', JSON.stringify(after));

// Can the user click "Information"?
const vis = await page
  .getByRole('link', { name: /^Information$/ })
  .first()
  .isVisible()
  .catch((e) => String(e));
console.log('Information link visible:', vis);
await page.screenshot({
  path: `${ROOT}/shots/approved-1/${process.env.TAG ?? 'sider-wheel'}-${MODE}.png`,
});
await browser.close();
