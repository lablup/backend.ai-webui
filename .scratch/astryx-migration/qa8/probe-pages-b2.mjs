/** qa8 item B — 6x zoom of the tab strip's left edge + a pixel-column read. */
import { chromium } from '@playwright/test';
import { BASE, ROOT, setMode, settle } from './probe-pages-lib.mjs';
import fs from 'node:fs';

const FOLDER = process.env.FOLDER ?? '6055ae8d-ea5c-4d20-ae6c-905ec08fad79';
const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
  deviceScaleFactor: 6,
  ignoreHTTPSErrors: true,
  storageState: `${ROOT}/state.json`,
});
const page = await ctx.newPage();
page.setDefaultNavigationTimeout(180000);
const out = {};

async function shots(tag) {
  const navs = await page.evaluate(() =>
    [...document.querySelectorAll('.bai-tab-list--card')].map((n) => {
      const r = n.getBoundingClientRect();
      return { x: r.x, y: r.y, w: r.width, h: r.height };
    }),
  );
  for (const [i, r] of navs.entries()) {
    await page.screenshot({
      path: `${ROOT}/before-b2-${tag}-${i}.png`,
      clip: {
        x: Math.max(0, r.x - 26),
        y: Math.max(0, r.y - 14),
        width: 90,
        height: r.h + 28,
      },
    });
  }
  return navs;
}

await page.goto(`${BASE}data`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(9000);
await settle(page);
await setMode(page, 'light');
await settle(page, 4000);
out.dataNavs = await shots('data-light');

await page.goto(`${BASE}data?folder=${FOLDER}`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(10000);
await settle(page, 10000);
await page.waitForTimeout(2500);
out.explorerNavs = await shots('explorer-light');

// what draws the vertical hairline immediately left of each nav?
out.leftProbe = await page.evaluate(() =>
  [...document.querySelectorAll('.bai-tab-list--card')].map((n) => {
    const r = n.getBoundingClientRect();
    const cols = [];
    for (let dx = -24; dx <= 2; dx += 1) {
      const x = r.left + dx;
      const y = r.top + r.height / 2;
      const stack = document.elementsFromPoint(x, y).slice(0, 3);
      cols.push({
        dx,
        stack: stack.map((e) => {
          const c = getComputedStyle(e);
          const er = e.getBoundingClientRect();
          return `${e.tagName.toLowerCase()}.${(e.className?.toString?.() ?? '').split(' ')[0]}[x=${er.x.toFixed(0)},w=${er.width.toFixed(0)},bl=${c.borderLeftWidth}/${c.borderLeftColor},br=${c.borderRightWidth}/${c.borderRightColor},bg=${c.backgroundColor}]`;
        }),
      });
    }
    return { navX: +r.x.toFixed(1), navY: +r.y.toFixed(1), cols };
  }),
);

fs.writeFileSync(`${ROOT}/before-pages-b2.json`, JSON.stringify(out, null, 2));
console.log('written');
await browser.close();
