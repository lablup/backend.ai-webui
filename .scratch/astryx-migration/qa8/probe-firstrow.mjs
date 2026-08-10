/**
 * qa8 — "카드 안의 테이블이 있을 경우 좌우 패딩을 주지않고 카드를 가득차게 한거는 의도한
 * 겁니다 … 대신에 첫 row의 시작점은 다듬어야하지만".
 *
 * The inline bleed is deliberate (BAITableAstryx.css documents it). What is NOT
 * settled is where the first cell's TEXT starts relative to the card's own
 * content edge — the card title above it, the filter row above that. Measure,
 * per table route: the card's content-box left edge, the card title's left
 * edge, the header cell's left edge and the first body cell's TEXT left edge,
 * so the misalignment is a number.
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
  ['admin-users', 'admin/users'],
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
const pageErrors = [];
page.on('pageerror', (e) => pageErrors.push(e.message));

const result = {};
for (const [name, path] of ROUTES) {
  try {
    await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(11000);
    result[name] = await page.evaluate(() => {
      const card = document.querySelector('.astryx-card');
      const table = document.querySelector('table');
      if (!card || !table) return { error: 'card or table missing' };
      const cs = getComputedStyle(card);
      const cardRect = card.getBoundingClientRect();
      const contentLeft = cardRect.left + parseFloat(cs.paddingLeft || '0');

      const title = card.querySelector('[class*="heading"], h1, h2, h3');
      const th = table.querySelector('thead th');
      const td = table.querySelector('tbody td');

      // The TEXT edge, not the cell box: the cell has its own padding.
      const textLeftOf = (cell) => {
        if (!cell) return null;
        const range = document.createRange();
        range.selectNodeContents(cell);
        const r = range.getBoundingClientRect();
        return r.width ? +r.left.toFixed(1) : null;
      };

      return {
        cardPaddingInline: [cs.paddingLeft, cs.paddingRight],
        cardLeft: +cardRect.left.toFixed(1),
        cardContentLeft: +contentLeft.toFixed(1),
        titleLeft: title ? +title.getBoundingClientRect().left.toFixed(1) : null,
        tableLeft: +table.getBoundingClientRect().left.toFixed(1),
        headerCellLeft: th ? +th.getBoundingClientRect().left.toFixed(1) : null,
        headerTextLeft: textLeftOf(th),
        bodyCellLeft: td ? +td.getBoundingClientRect().left.toFixed(1) : null,
        bodyTextLeft: textLeftOf(td),
        headerCellPadding: th ? getComputedStyle(th).paddingLeft : null,
        bodyCellPadding: td ? getComputedStyle(td).paddingLeft : null,
      };
    });
  } catch (e) {
    result[name] = { error: String(e).split('\n')[0] };
  }
}

result.pageErrors = pageErrors;
fs.writeFileSync(
  `${ROOT}/${TAG}-firstrow.json`,
  JSON.stringify(result, null, 2),
);
console.log(JSON.stringify(result, null, 2));
await browser.close();
