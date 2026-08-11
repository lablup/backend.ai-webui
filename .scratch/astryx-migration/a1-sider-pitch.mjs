/** approved-1 — where does the admin rail's 890px of content come from? */
import { chromium } from '@playwright/test';

const BASE = process.env.BASE ?? 'http://127.0.0.1:5960/';
const ROOT = process.env.ROOT;

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
  storageState: `${ROOT}/a1-state.json`,
});
const page = await ctx.newPage();
page.setDefaultNavigationTimeout(120000);
await page.goto(`${BASE}admin/settings`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(14000);

const out = await page.evaluate(() => {
  const nav = document.querySelector('.astryx-side-nav');
  const col = Array.from(nav.children).find((el) =>
    el.querySelector('.astryx-side-nav-item'),
  );
  const colCs = getComputedStyle(col);
  const item = nav.querySelector('.astryx-side-nav-item');
  const iCs = getComputedStyle(item);
  const sections = Array.from(nav.querySelectorAll('.astryx-side-nav-section'));
  return {
    col: {
      paddingBlockStart: colCs.paddingBlockStart,
      paddingBlockEnd: colCs.paddingBlockEnd,
      gap: colCs.rowGap,
      display: colCs.display,
      clientH: col.clientHeight,
      scrollH: col.scrollHeight,
    },
    item: {
      h: Math.round(item.getBoundingClientRect().height),
      marginBlock: `${iCs.marginBlockStart}/${iCs.marginBlockEnd}`,
      fontSize: iCs.fontSize,
      lineHeight: iCs.lineHeight,
    },
    sections: sections.map((s) => {
      const cs = getComputedStyle(s);
      const head = s.firstElementChild;
      return {
        h: Math.round(s.getBoundingClientRect().height),
        padTop: cs.paddingBlockStart,
        headH: head ? Math.round(head.getBoundingClientRect().height) : null,
        headText: head ? (head.innerText || '').trim().slice(0, 18) : null,
        rowGap: cs.rowGap,
        items: s.querySelectorAll('.astryx-side-nav-item').length,
      };
    }),
  };
});
console.log(JSON.stringify(out, null, 1));
await browser.close();
