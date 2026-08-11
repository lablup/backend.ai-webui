/**
 * qa8 — defect (A), targeted: drag the resize handle of the STICKY
 * (`fixed: 'left'`) `name` column on /session and measure the escape.
 *
 * Compares the pinned column (`name`, sticky) against the next non-pinned
 * column (`status`) at rest, during the drag, and after release.
 *
 * Usage: node .scratch/astryx-migration/qa8/probe-overflow-sticky-resize.mjs
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

const measure = () =>
  page.evaluate(() => {
    const round = (n) => +n.toFixed(1);
    const table = document.querySelector('table');
    const ths = [...table.querySelectorAll('thead tr th')];
    const row = table.querySelector('tbody tr');
    const tds = [...row.querySelectorAll('td')];
    // deepest text node span inside a cell -> its painted right edge
    const contentRight = (td) => {
      let max = -Infinity;
      const walk = (n) => {
        if (n.nodeType === 3 && n.textContent.trim()) {
          const rg = document.createRange();
          rg.selectNodeContents(n);
          const r = rg.getBoundingClientRect();
          if (r.width) max = Math.max(max, r.right);
        }
        for (const c of n.childNodes) walk(c);
      };
      walk(td);
      return max === -Infinity ? null : round(max);
    };
    return tds.map((td, i) => {
      const c = getComputedStyle(td);
      const r = td.getBoundingClientRect();
      const cr = contentRight(td);
      return {
        i,
        key: ths[i]?.getAttribute('data-column-key') ?? null,
        position: c.position,
        overflowX: c.overflowX,
        textOverflow: c.textOverflow,
        whiteSpace: c.whiteSpace,
        maxWidth: c.maxWidth,
        minWidth: c.minWidth,
        tdX: round(r.x),
        tdW: round(r.width),
        tdRight: round(r.right),
        scrollW: td.scrollWidth,
        clientW: td.clientWidth,
        overflowPx: round(td.scrollWidth - td.clientWidth),
        contentRight: cr,
        // > 0 => visible text paints past the cell's own border box
        textEscapeRightPx: cr == null ? null : round(cr - r.right),
        text: td.textContent?.trim().slice(0, 34) ?? '',
      };
    });
  });

const result = { pageErrors };

await page.goto(`${BASE}session`, { waitUntil: 'domcontentloaded' });
await page.waitForSelector('table tbody tr', { timeout: 150000 });
await page.waitForTimeout(6000);

result.rest = await measure();

const handle = page.locator('table thead th[data-column-key="name"] [role="separator"]');
result.nameHandleCount = await handle.count();

if (result.nameHandleCount) {
  const box = await handle.boundingBox();
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  await page.mouse.move(cx, cy);
  await page.mouse.down();
  await page.mouse.move(cx - 30, cy, { steps: 5 });
  await page.mouse.move(cx - 80, cy, { steps: 10 });
  await page.waitForTimeout(400);
  result.duringDrag = await measure();
  await page.screenshot({ path: `${ROOT}/${TAG}-overflow-sticky-dragging.png` });
  await page.mouse.up();
  await page.waitForTimeout(1000);
  result.afterDrag = await measure();
  await page.screenshot({ path: `${ROOT}/${TAG}-overflow-sticky-after.png` });
}

result.pageErrors = pageErrors;
fs.writeFileSync(
  `${ROOT}/${TAG}-overflow-sticky-resize.json`,
  JSON.stringify(result, null, 2),
);
for (const phase of ['rest', 'duringDrag', 'afterDrag']) {
  const p = result[phase];
  if (!p) continue;
  console.log('=====', phase);
  for (const c of p.slice(0, 4)) {
    console.log(
      ' ',
      (c.key ?? '?').padEnd(16),
      'pos=' + c.position.padEnd(7),
      'ovf=' + c.overflowX.padEnd(7),
      'tdW=' + String(c.tdW).padStart(6),
      'ovfPx=' + String(c.overflowPx).padStart(5),
      'textEscape=' + String(c.textEscapeRightPx).padStart(7),
      '|' + c.text.slice(0, 26),
    );
  }
}
await browser.close();
