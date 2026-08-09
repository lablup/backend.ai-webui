/** approved-1 — admin rail AT REST (no programmatic scroll). */
import { chromium } from '@playwright/test';

const BASE = process.env.BASE ?? 'http://127.0.0.1:5960/';
const ROOT = process.env.ROOT;
const MODE = process.env.MODE ?? 'light';
const H = Number(process.env.H ?? 1000);

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: H },
  storageState: `${ROOT}/a1-state.json`,
  colorScheme: MODE === 'dark' ? 'dark' : 'light',
});
const page = await ctx.newPage();
page.setDefaultNavigationTimeout(120000);
await page.goto(`${BASE}admin/settings`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(14000);

const probe = await page.evaluate(() => {
  const nav = document.querySelector('.astryx-side-nav');
  const col = Array.from(nav.children).find((el) =>
    el.querySelector('.astryx-side-nav-item'),
  );
  const items = Array.from(nav.querySelectorAll('.astryx-side-nav-item'));
  const colR = col.getBoundingClientRect();
  const hidden = items
    .map((e) => {
      const r = e.getBoundingClientRect();
      return {
        label: (e.innerText || '').trim().slice(0, 20),
        top: Math.round(r.top),
        bottom: Math.round(r.bottom),
        clippedPx: Math.round(Math.max(0, r.bottom - colR.bottom)),
      };
    })
    .filter((x) => x.clippedPx > 0);
  const cs = getComputedStyle(col);
  return {
    scrollTop: col.scrollTop,
    colTop: Math.round(colR.top),
    colBottom: Math.round(colR.bottom),
    maxScroll: col.scrollHeight - col.clientHeight,
    scrollbarPx: col.offsetWidth - col.clientWidth,
    scrollbarWidthProp: cs.scrollbarWidth,
    overflowY: cs.overflowY,
    partiallyOrFullyClipped: hidden,
  };
});
console.log(JSON.stringify(probe, null, 1));
await page.screenshot({
  path: `${ROOT}/shots/approved-1/${process.env.TAG ?? 'sider-rest'}-${MODE}.png`,
});
await browser.close();
