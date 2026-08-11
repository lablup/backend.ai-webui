/**
 * qa8 — defect (B): "Nested Table text overflow. Example: session scheduling
 * history" — a long step name ("ReservedBatchSessionValidator") runs over the
 * next column's value ("SUCCESS").
 *
 * Path: /session -> first session name link -> session detail ->
 *       "Session Scheduling History" button -> modal (BAISchedulingHistoryTable)
 *       -> expand a row -> nested BAISubStepNodes table.
 *
 * Measures, for EVERY table on screen (outer + nested), the same properties as
 * probe-overflow-sessions.mjs so the two defects can be compared directly.
 *
 * Usage: node .scratch/astryx-migration/qa8/probe-overflow-nested.mjs
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
  'text-overflow',
  'white-space',
  'min-width',
  'max-width',
  'width',
  'position',
];

/** Dump every <table> in the document (outer + nested). */
const dumpAllTables = () =>
  page.evaluate((props) => {
    const round = (n) => +n.toFixed(1);
    const styleOf = (el) => {
      const c = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      const o = {
        rect: { x: round(r.x), w: round(r.width), right: round(r.right) },
        scrollW: el.scrollWidth,
        clientW: el.clientWidth,
      };
      for (const p of props) o[p] = c.getPropertyValue(p);
      return o;
    };

    return [...document.querySelectorAll('table')].map((table, ti) => {
      const tc = getComputedStyle(table);
      const tr = table.getBoundingClientRect();
      const depth = (() => {
        let d = 0;
        let p = table.parentElement;
        while (p) {
          if (p.tagName === 'TABLE') d++;
          p = p.parentElement;
        }
        return d;
      })();
      const headRow = table.querySelector('thead tr');
      const ths = headRow ? [...headRow.querySelectorAll('th')] : [];
      // pick the body row with the LONGEST first-cell text — that is the row
      // whose step name overflows.
      const bodyRows = [...table.querySelectorAll(':scope > tbody > tr')];
      const bodyRow =
        bodyRows.length === 0
          ? null
          : bodyRows.reduce((a, b) =>
              (b.cells[0]?.textContent ?? '').length >
              (a.cells[0]?.textContent ?? '').length
                ? b
                : a,
            );
      const tds = bodyRow ? [...bodyRow.children].filter(
        (n) => n.tagName === 'TD',
      ) : [];

      return {
        ti,
        depth,
        headers: ths.map((th) => th.textContent?.trim().slice(0, 22)),
        table: {
          tableLayout: tc.tableLayout,
          minWidth: tc.minWidth,
          width: tc.width,
          rect: { x: round(tr.x), w: round(tr.width) },
        },
        cells: tds.map((td, i) => {
          const th = ths[i];
          const tdR = td.getBoundingClientRect();
          const child = td.firstElementChild;
          const out = {
            i,
            columnKey: th?.getAttribute('data-column-key') ?? null,
            headerText: th?.textContent?.trim().slice(0, 22) ?? null,
            td: styleOf(td),
            text: td.textContent?.trim().slice(0, 46) ?? '',
            tdContentOverflowPx: round(td.scrollWidth - td.clientWidth),
          };
          if (child) {
            const cr = child.getBoundingClientRect();
            out.child = {
              tag: child.tagName.toLowerCase(),
              cls: (child.getAttribute('class') ?? '').slice(0, 40),
              ...styleOf(child),
            };
            out.childEscapeRightPx = round(cr.right - tdR.right);
          }
          return out;
        }),
      };
    });
  }, PROPS);

const result = { pageErrors, steps: [] };
const log = (s) => {
  result.steps.push(s);
  console.log('·', s);
};

await page.goto(`${BASE}session`, { waitUntil: 'domcontentloaded' });
await page.waitForSelector('table tbody tr', { timeout: 120000 });
await page.waitForTimeout(5000);
log('session list loaded');

// --- open the first session's detail -------------------------------------
// The session name is an Astryx Link rendered as a <button>, not an <a>.
const nameLink = page
  .locator('table tbody tr td button.astryx-link, table tbody tr td a')
  .first();
await nameLink.click();
await page.waitForTimeout(6000);
result.detailUrl = page.url();
log(`detail url: ${result.detailUrl}`);

// --- open the scheduling history modal ------------------------------------
const schedBtn = page
  .locator(
    'button[aria-label*="Scheduling" i], button[title*="Scheduling" i], button:has-text("Scheduling")',
  )
  .first();
result.schedBtnCount = await schedBtn.count();
if (!result.schedBtnCount) {
  result.buttons = await page.evaluate(() =>
    [...document.querySelectorAll('button')]
      .map(
        (b) =>
          `${b.getAttribute('aria-label') ?? ''}|${b.getAttribute('title') ?? ''}|${(b.textContent ?? '').trim().slice(0, 24)}`,
      )
      .filter(Boolean),
  );
} else {
  await schedBtn.click();
  await page.waitForTimeout(6000);
  log('scheduling history modal opened');
  await page.screenshot({ path: `${ROOT}/${TAG}-overflow-nested-modal.png` });
  result.outerOnly = await dumpAllTables();

  // --- expand a row -> nested table --------------------------------------
  const expandBtns = page.locator(
    'button[aria-label*="Expand" i], [role="dialog"] tbody tr td:first-child button, dialog tbody tr td:first-child button',
  );
  result.expandBtnCount = await expandBtns.count();
  // expand ALL rows so at least one has a long step name
  const n = Math.min(result.expandBtnCount, 8);
  for (let i = 0; i < n; i++) {
    await expandBtns.nth(i).click().catch(() => {});
    await page.waitForTimeout(600);
  }
  await page.waitForTimeout(3000);
  log(`expanded ${n} rows`);
  await page.screenshot({
    path: `${ROOT}/${TAG}-overflow-nested-expanded.png`,
    fullPage: false,
  });
  result.tables = await dumpAllTables();

  // ---- inject the candidate fix and re-measure the NESTED table ----------
  await page.evaluate(() => {
    const s = document.createElement('style');
    s.textContent = `@layer components {
  .bai-table-astryx-dim-layer thead th { overflow: hidden; }
  .bai-table-astryx-dim-layer tbody td:not([colspan]) { overflow: hidden; }
}`;
    document.head.appendChild(s);
  });
  await page.waitForTimeout(800);
  result.tablesAfterFix = await dumpAllTables();
  await page.screenshot({
    path: `${ROOT}/after-overflow-nested-fixed.png`,
  });
}

result.pageErrors = pageErrors;
fs.writeFileSync(
  `${ROOT}/${TAG}-overflow-nested.json`,
  JSON.stringify(result, null, 2),
);
console.log(
  JSON.stringify(
    {
      detailUrl: result.detailUrl,
      schedBtnCount: result.schedBtnCount,
      expandBtnCount: result.expandBtnCount,
      tableCount: result.tables?.length,
      buttons: result.buttons?.slice(0, 40),
      pageErrors,
    },
    null,
    2,
  ),
);
await browser.close();
