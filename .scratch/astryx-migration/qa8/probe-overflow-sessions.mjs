/**
 * qa8 — defect (A): "resize the sessions table and cell text overlaps the
 * neighbouring column".
 *
 * Measures, at 1600x1000, on /session:
 *   1. <table> table-layout + min-width
 *   2. every <th>/<td> of row 0: overflow / text-overflow / white-space /
 *      min-width / max-width / width + rect
 *   3. the FIRST ELEMENT CHILD of each <td> (the "inner cell wrapper" a
 *      column `render()` produced) with the same properties + rect, and
 *      whether its painted box escapes the <td> box (childRight - tdRight).
 *   4. the same set again WHILE a column-resize drag is held (pointer down,
 *      moved, NOT released) — that is the reported state.
 *
 * Usage: node .scratch/astryx-migration/qa8/probe-overflow-sessions.mjs
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
page.setDefaultTimeout(30000);
const pageErrors = [];
page.on('pageerror', (e) => pageErrors.push(e.message));

const PROPS = [
  'overflow-x',
  'overflow-y',
  'text-overflow',
  'white-space',
  'min-width',
  'max-width',
  'width',
  'position',
  'display',
  'box-sizing',
];

/** Dump a table's header + first body row cell geometry & clipping props. */
const dumpTable = (tableSel) =>
  page.evaluate(
    ([sel, props]) => {
      const round = (n) => +n.toFixed(1);
      const table = document.querySelector(sel);
      if (!table) return null;
      const tc = getComputedStyle(table);
      const tr = table.getBoundingClientRect();

      const styleOf = (el) => {
        const c = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        const o = {
          rect: {
            x: round(r.x),
            w: round(r.width),
            right: round(r.right),
          },
          scrollW: el.scrollWidth,
          clientW: el.clientWidth,
        };
        for (const p of props) o[p] = c.getPropertyValue(p);
        return o;
      };

      const headRow = table.querySelector('thead tr');
      const ths = headRow ? [...headRow.querySelectorAll('th')] : [];
      const bodyRow = table.querySelector('tbody tr');
      const tds = bodyRow ? [...bodyRow.querySelectorAll('td')] : [];

      const cells = tds.map((td, i) => {
        const th = ths[i];
        const child = td.firstElementChild;
        const tdR = td.getBoundingClientRect();
        const out = {
          i,
          columnKey: th?.getAttribute('data-column-key') ?? null,
          headerText: th?.textContent?.trim().slice(0, 28) ?? null,
          th: th ? styleOf(th) : null,
          td: styleOf(td),
          text: td.textContent?.trim().slice(0, 40) ?? '',
          // does the td's own inline content overflow its content box?
          tdContentOverflowPx: round(td.scrollWidth - td.clientWidth),
        };
        if (child) {
          const cr = child.getBoundingClientRect();
          out.child = {
            tag: child.tagName.toLowerCase(),
            cls: (child.getAttribute('class') ?? '').slice(0, 60),
            ...styleOf(child),
          };
          // positive => the child's painted box escapes the td to the right
          out.childEscapeRightPx = round(cr.right - tdR.right);
        }
        return out;
      });

      return {
        table: {
          tableLayout: tc.tableLayout,
          minWidth: tc.minWidth,
          width: tc.width,
          rect: { x: round(tr.x), w: round(tr.width) },
        },
        scrollWrapper: (() => {
          const w = table.parentElement;
          if (!w) return null;
          const c = getComputedStyle(w);
          return {
            cls: (w.getAttribute('class') ?? '').slice(0, 60),
            overflowX: c.overflowX,
            clientW: w.clientWidth,
            scrollW: w.scrollWidth,
          };
        })(),
        cells,
      };
    },
    [tableSel, PROPS],
  );

const result = { pageErrors };

await page.goto(`${BASE}session`, { waitUntil: 'domcontentloaded' });
await page.waitForSelector('table tbody tr', { timeout: 120000 });
await page.waitForTimeout(6000);

result.theme = await page.evaluate(
  () => document.documentElement.dataset.theme ?? null,
);

const TABLE = 'table';
result.rest = await dumpTable(TABLE);
await page.screenshot({ path: `${ROOT}/${TAG}-overflow-sessions-rest.png` });

/* ---- resize handles ----------------------------------------------------- */

const handles = page.locator('table thead [role="separator"]');
result.handleCount = await handles.count();

if (result.handleCount > 1) {
  // Grab the handle of the SECOND column and drag it far to the LEFT so that
  // column collapses to its minimum — the reported "I already moved the left
  // column" state.
  const target = handles.nth(1);
  const box = await target.boundingBox();
  result.dragFrom = box;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 - 60, box.y + box.height / 2, {
    steps: 6,
  });
  await page.mouse.move(box.x + box.width / 2 - 200, box.y + box.height / 2, {
    steps: 12,
  });
  await page.waitForTimeout(400);

  result.duringDrag = await dumpTable(TABLE);
  await page.screenshot({
    path: `${ROOT}/${TAG}-overflow-sessions-dragging.png`,
  });

  await page.mouse.up();
  await page.waitForTimeout(800);
  result.afterDrag = await dumpTable(TABLE);
  await page.screenshot({
    path: `${ROOT}/${TAG}-overflow-sessions-after.png`,
  });
}

fs.writeFileSync(
  `${ROOT}/${TAG}-overflow-sessions.json`,
  JSON.stringify(result, null, 2),
);
console.log(
  JSON.stringify(
    {
      theme: result.theme,
      handleCount: result.handleCount,
      table: result.rest?.table,
      scrollWrapper: result.rest?.scrollWrapper,
      pageErrors: result.pageErrors,
    },
    null,
    2,
  ),
);
await browser.close();
