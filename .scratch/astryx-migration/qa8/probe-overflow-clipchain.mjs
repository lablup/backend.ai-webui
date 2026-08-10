/**
 * qa8 — which LAYER is missing the clip?
 *
 * For the pinned (`fixed: 'left'`) cell of the sessions table, walks the whole
 * ancestor chain from the deepest text node up to the Astryx scroll wrapper and
 * records each layer's overflow / text-overflow / white-space / min-width and
 * its right edge, so the first element that actually clips (if any) is visible.
 *
 * Repeats the walk after the pinned column has been dragged down to its 60px
 * minimum — the reported state.
 *
 * Usage: node .scratch/astryx-migration/qa8/probe-overflow-clipchain.mjs
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

const chain = (colKey) =>
  page.evaluate((key) => {
    const round = (n) => +n.toFixed(1);
    const table = document.querySelector('table');
    const ths = [...table.querySelectorAll('thead tr th')];
    const idx = ths.findIndex((th) => th.getAttribute('data-column-key') === key);
    if (idx < 0) return null;
    const td = table.querySelector('tbody tr')?.children[idx];
    if (!td) return null;

    // deepest, widest text node in the cell
    let best = null;
    const walk = (n) => {
      if (n.nodeType === 3 && n.textContent.trim()) {
        const rg = document.createRange();
        rg.selectNodeContents(n);
        const r = rg.getBoundingClientRect();
        if (r.width && (!best || r.width > best.r.width))
          best = { node: n, r, text: n.textContent.trim() };
      }
      for (const c of n.childNodes) walk(c);
    };
    walk(td);
    if (!best) return null;

    const layers = [];
    let el = best.node.parentElement;
    let clipRight = Infinity;
    while (el) {
      const c = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      const clips = c.overflowX !== 'visible';
      if (clips) clipRight = Math.min(clipRight, r.right);
      layers.push({
        tag: el.tagName.toLowerCase(),
        cls: (el.getAttribute('class') ?? '').split(' ').slice(0, 3).join(' '),
        overflowX: c.overflowX,
        textOverflow: c.textOverflow,
        whiteSpace: c.whiteSpace,
        minWidth: c.minWidth,
        maxWidth: c.maxWidth,
        width: c.width,
        display: c.display,
        position: c.position,
        right: round(r.right),
        w: round(r.width),
        clips,
      });
      if (el.classList.contains('astryx-table-scroll-wrapper')) break;
      el = el.parentElement;
    }

    const tdR = td.getBoundingClientRect();
    return {
      column: key,
      text: best.text.slice(0, 40),
      textRight: round(best.r.right),
      tdRight: round(tdR.right),
      tdW: round(tdR.width),
      firstClipRight: clipRight === Infinity ? null : round(clipRight),
      // > 0 => text is actually PAINTED past the cell's own right edge
      visibleEscapeRightPx:
        clipRight === Infinity
          ? round(best.r.right - tdR.right)
          : round(Math.min(best.r.right, clipRight) - tdR.right),
      layers,
    };
  }, colKey);

const result = { pageErrors };

await page.goto(`${BASE}session`, { waitUntil: 'domcontentloaded' });
await page.waitForSelector('table tbody tr', { timeout: 150000 });
await page.waitForTimeout(6000);

result.restName = await chain('name');
result.restStatus = await chain('status');

const handle = page.locator(
  'table thead th[data-column-key="name"] [role="separator"]',
);
if (await handle.count()) {
  const box = await handle.boundingBox();
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  await page.mouse.move(cx, cy);
  await page.mouse.down();
  await page.mouse.move(cx - 30, cy, { steps: 5 });
  await page.mouse.move(cx - 80, cy, { steps: 10 });
  await page.mouse.up();
  await page.waitForTimeout(1200);
  result.narrowedName = await chain('name');
  await page.screenshot({ path: `${ROOT}/${TAG}-overflow-clipchain.png` });
}

result.pageErrors = pageErrors;
fs.writeFileSync(
  `${ROOT}/${TAG}-overflow-clipchain.json`,
  JSON.stringify(result, null, 2),
);

for (const k of ['restName', 'restStatus', 'narrowedName']) {
  const c = result[k];
  if (!c) continue;
  console.log(
    `===== ${k}  col=${c.column} tdW=${c.tdW} tdRight=${c.tdRight} textRight=${c.textRight} firstClipRight=${c.firstClipRight} visibleEscape=${c.visibleEscapeRightPx}  "${c.text}"`,
  );
  for (const l of c.layers)
    console.log(
      '   ',
      (l.tag + '.' + l.cls).slice(0, 34).padEnd(35),
      'ovf=' + l.overflowX.padEnd(8),
      'to=' + l.textOverflow.padEnd(9),
      'ws=' + l.whiteSpace.padEnd(7),
      'minW=' + l.minWidth.padEnd(7),
      'maxW=' + l.maxWidth.padEnd(7),
      'right=' + String(l.right).padStart(7),
      l.clips ? '<< CLIPS' : '',
    );
}
await browser.close();
