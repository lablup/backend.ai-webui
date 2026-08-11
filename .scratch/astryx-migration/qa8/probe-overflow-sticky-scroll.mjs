/**
 * qa8 — defect (A), second hypothesis: after a resize makes the table wider
 * than its scroll wrapper, the horizontally-scrolled content shows THROUGH the
 * pinned (`fixed: 'left'`) columns, so two strings paint on top of each other.
 *
 * Widens the `name` column until the wrapper scrolls, scrolls right, then:
 *   - records the pinned cells' resolved background-color / z-index
 *   - lists every non-sticky text node whose painted box lands INSIDE a pinned
 *     cell's rect (the visual overlap)
 *
 * Usage: node .scratch/astryx-migration/qa8/probe-overflow-sticky-scroll.mjs
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const BASE =
  process.env.BASE ?? 'https://to-astryx.backend-ai-webui.localhost:1357/';
const ROOT = process.env.ROOT ?? '.scratch/astryx-migration/qa8';
const TAG = process.env.TAG ?? 'before';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
  ignoreHTTPSErrors: true,
  storageState: `${ROOT}/state.json`,
});
const page = await ctx.newPage();
page.setDefaultNavigationTimeout(180000);
page.setDefaultTimeout(60000);
const pageErrors = [];
page.on('pageerror', (e) => pageErrors.push(e.message));

const state = () =>
  page.evaluate(() => {
    const round = (n) => +n.toFixed(1);
    const table = document.querySelector('table');
    const wrap = table.closest('.astryx-table-scroll-wrapper');
    const ths = [...table.querySelectorAll('thead tr th')];
    const row = table.querySelector('tbody tr');
    const tds = [...row.children].filter((n) => n.tagName === 'TD');

    const sticky = [];
    tds.forEach((td, i) => {
      const c = getComputedStyle(td);
      if (c.position !== 'sticky') return;
      const r = td.getBoundingClientRect();
      sticky.push({
        i,
        key: ths[i]?.getAttribute('data-column-key') ?? null,
        backgroundColor: c.backgroundColor,
        backgroundImage: c.backgroundImage,
        zIndex: c.zIndex,
        overflowX: c.overflowX,
        rect: { x: round(r.x), right: round(r.right), w: round(r.width) },
        stickyBgVar: c.getPropertyValue('--table-sticky-background').trim(),
      });
    });

    // non-sticky text painted inside a pinned cell's horizontal band
    const overlaps = [];
    tds.forEach((td, i) => {
      if (getComputedStyle(td).position === 'sticky') return;
      const walk = (n) => {
        if (n.nodeType === 3 && n.textContent.trim()) {
          const rg = document.createRange();
          rg.selectNodeContents(n);
          const r = rg.getBoundingClientRect();
          if (!r.width) return;
          for (const s of sticky) {
            if (r.left < s.rect.right && r.right > s.rect.x)
              overlaps.push({
                fromColumn: ths[i]?.getAttribute('data-column-key') ?? null,
                overColumn: s.key,
                text: n.textContent.trim().slice(0, 30),
                textLeft: round(r.left),
                textRight: round(r.right),
                stickyBand: s.rect,
              });
          }
          return;
        }
        for (const c of n.childNodes) walk(c);
      };
      walk(td);
    });

    return {
      wrapper: {
        clientW: wrap?.clientWidth,
        scrollW: wrap?.scrollWidth,
        scrollLeft: wrap ? round(wrap.scrollLeft) : null,
      },
      tableMinWidth: getComputedStyle(table).minWidth,
      tableWidth: getComputedStyle(table).width,
      sticky,
      overlaps,
    };
  });

const result = { pageErrors };

await page.goto(`${BASE}session`, { waitUntil: 'domcontentloaded' });
await page.waitForSelector('table tbody tr', { timeout: 150000 });
await page.waitForTimeout(6000);
result.rest = await state();

// widen `name` hard so the table overflows its wrapper
const h = page.locator(
  'table thead th[data-column-key="name"] [role="separator"]',
);
if (await h.count()) {
  const box = await h.boundingBox();
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  await page.mouse.move(cx, cy);
  await page.mouse.down();
  await page.mouse.move(cx + 200, cy, { steps: 8 });
  await page.mouse.move(cx + 600, cy, { steps: 16 });
  await page.mouse.up();
  await page.waitForTimeout(1200);
  result.widened = await state();
  await page.screenshot({ path: `${ROOT}/${TAG}-overflow-sticky-widened.png` });

  await page.evaluate(() => {
    const w = document.querySelector('.astryx-table-scroll-wrapper');
    if (w) w.scrollLeft = 400;
  });
  await page.waitForTimeout(800);
  result.scrolled = await state();
  await page.screenshot({ path: `${ROOT}/${TAG}-overflow-sticky-scrolled.png` });
}

result.pageErrors = pageErrors;
fs.writeFileSync(
  `${ROOT}/${TAG}-overflow-sticky-scroll.json`,
  JSON.stringify(result, null, 2),
);
console.log(JSON.stringify(result, null, 2).slice(0, 6000));
await browser.close();
