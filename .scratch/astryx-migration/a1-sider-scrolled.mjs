/** approved-1 — footer band opacity + collapse toggle while the rail is scrolled. */
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

// Park the rail mid-scroll (an item straddling the footer edge) and hover so
// the collapse toggle is revealed.
await page.mouse.move(120, 400);
await page.mouse.wheel(0, 40);
await page.waitForTimeout(700);

const state = await page.evaluate(() => {
  const nav = document.querySelector('.astryx-side-nav');
  const kids = Array.from(nav.children);
  const col = kids.find((el) => el.querySelector('.astryx-side-nav-item'));
  const footer = kids[kids.length - 1];
  const fcs = getComputedStyle(footer);
  const toggle = document.querySelector('button.bai-sider-toggle');
  const tr = toggle ? toggle.getBoundingClientRect() : null;
  return {
    scrollTop: col.scrollTop,
    footerBg: fcs.backgroundColor,
    footerPosition: fcs.position,
    footerZ: fcs.zIndex,
    footerTop: Math.round(footer.getBoundingClientRect().top),
    navBg: getComputedStyle(nav).backgroundColor,
    toggle: tr
      ? {
          w: Math.round(tr.width),
          h: Math.round(tr.height),
          x: Math.round(tr.left),
          y: Math.round(tr.top),
          visible: getComputedStyle(toggle).visibility,
        }
      : null,
  };
});
console.log(JSON.stringify(state));
await page.screenshot({
  path: `${ROOT}/shots/approved-1/sider-scrolled-${MODE}.png`,
  clip: { x: 0, y: 0, width: 300, height: 1000 },
});
await browser.close();
