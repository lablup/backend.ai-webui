/**
 * approved-1 — admin rail with CLASSIC (non-overlay) scrollbars, i.e. what a
 * desktop Chrome on Linux/Windows renders. Headless Chromium defaults to
 * overlay scrollbars, which report width 0 and never paint in a screenshot,
 * so `::-webkit-scrollbar` sizing is unverifiable without this flag.
 */
import { chromium } from '@playwright/test';

const BASE = process.env.BASE ?? 'http://127.0.0.1:5960/';
const ROOT = process.env.ROOT;
const MODE = process.env.MODE ?? 'light';

const browser = await chromium.launch({
  args: ['--disable-features=OverlayScrollbar,FluentOverlayScrollbar'],
});
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
  const kids = Array.from(nav.children);
  const col = kids.find((el) => el.querySelector('.astryx-side-nav-item'));
  return {
    scrollbarPx: col.offsetWidth - col.clientWidth,
    bandScrollbarPx: kids
      .filter((el) => el !== col)
      .map((el) => el.offsetWidth - el.clientWidth),
    maxScroll: col.scrollHeight - col.clientHeight,
    navWidth: nav.offsetWidth,
    itemWidth: Math.round(
      nav.querySelector('.astryx-side-nav-item').getBoundingClientRect().width,
    ),
  };
});
console.log('CLASSIC GEOMETRY', JSON.stringify(geo));

await page.screenshot({
  path: `${ROOT}/shots/approved-1/sider-classic-rest-${MODE}.png`,
  clip: { x: 0, y: 0, width: 260, height: 1000 },
});

await page.mouse.move(120, 500);
await page.mouse.wheel(0, 600);
await page.waitForTimeout(800);
const after = await page.evaluate(() => {
  const nav = document.querySelector('.astryx-side-nav');
  const col = Array.from(nav.children).find((el) =>
    el.querySelector('.astryx-side-nav-item'),
  );
  const items = Array.from(nav.querySelectorAll('.astryx-side-nav-item'));
  const last = items[items.length - 1];
  return {
    scrollTop: col.scrollTop,
    lastItem: (last.innerText || '').trim(),
    lastBottom: Math.round(last.getBoundingClientRect().bottom),
    colBottom: Math.round(col.getBoundingClientRect().bottom),
    fullyVisible:
      last.getBoundingClientRect().bottom <= col.getBoundingClientRect().bottom,
  };
});
console.log('AFTER WHEEL', JSON.stringify(after));
await page.screenshot({
  path: `${ROOT}/shots/approved-1/sider-classic-scrolled-${MODE}.png`,
  clip: { x: 0, y: 0, width: 260, height: 1000 },
});
await browser.close();
