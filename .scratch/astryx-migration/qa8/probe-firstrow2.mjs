/**
 * qa8 — first-row start point, per COLUMN.
 *
 * The first pass showed `agents` (no selection column) landing its first cell's
 * text at the card's content edge, while `session` / `admin/users` (which have
 * a selection checkbox column) reported a text edge 24px further left. Resolve
 * which element that is: measure each of the first three header/body cells —
 * the cell box, its padding, and the rect of the first *painted* child (the
 * checkbox input, or the text range) — so the answer is a column, not an
 * average.
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const BASE =
  process.env.BASE ?? 'https://to-astryx.backend-ai-webui.localhost:1357/';
const ROOT = process.env.ROOT ?? '.scratch/astryx-migration/qa8';
const TAG = process.env.TAG ?? 'before';

const ROUTES = [
  ['sessions', 'session'],
  ['agents', 'agent'],
];

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
  ignoreHTTPSErrors: true,
  storageState: `${ROOT}/state.json`,
});
const page = await ctx.newPage();
page.setDefaultNavigationTimeout(180000);
page.setDefaultTimeout(20000);

const result = {};
for (const [name, path] of ROUTES) {
  await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(11000);
  result[name] = await page.evaluate(() => {
    const card = document.querySelector('.astryx-card');
    const table = document.querySelector('table');
    if (!card || !table) return { error: 'card or table missing' };
    const cs = getComputedStyle(card);
    const cardRect = card.getBoundingClientRect();
    const cardContentLeft = +(
      cardRect.left + parseFloat(cs.paddingLeft || '0')
    ).toFixed(1);

    const describe = (cell) => {
      if (!cell) return null;
      const r = cell.getBoundingClientRect();
      const ccs = getComputedStyle(cell);
      const input = cell.querySelector('input,button,svg');
      const range = document.createRange();
      range.selectNodeContents(cell);
      const textRect = range.getBoundingClientRect();
      return {
        key: cell.getAttribute('data-column-key') ?? cell.className.slice(0, 28),
        boxLeft: +r.left.toFixed(1),
        paddingLeft: ccs.paddingLeft,
        firstControlLeft: input
          ? +input.getBoundingClientRect().left.toFixed(1)
          : null,
        textLeft: textRect.width ? +textRect.left.toFixed(1) : null,
      };
    };

    const ths = [...table.querySelectorAll('thead th')].slice(0, 3);
    const tds = [...(table.querySelector('tbody tr')?.children ?? [])].slice(
      0,
      3,
    );
    return {
      cardContentLeft,
      tableLeft: +table.getBoundingClientRect().left.toFixed(1),
      header: ths.map(describe),
      body: tds.map(describe),
    };
  });
}

fs.writeFileSync(
  `${ROOT}/${TAG}-firstrow2.json`,
  JSON.stringify(result, null, 2),
);
console.log(JSON.stringify(result, null, 2));
await browser.close();
