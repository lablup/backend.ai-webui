/**
 * qa8 item B — the card-type tab strip's LEFT edge, zoomed.
 * Captures every `.bai-tab-list--card` on /data (page tabs) and inside the
 * folder-explorer modal (info-panel tabs), plus a 4x zoom of the 60px strip
 * around each nav's left edge and a pixel column read at nav.left - 1.
 */
import { BASE, ROOT, launch, setMode, settle } from './probe-pages-lib.mjs';
import fs from 'node:fs';

const FOLDER = process.env.FOLDER ?? '6055ae8d-ea5c-4d20-ae6c-905ec08fad79';
const { browser, page, pageErrors } = await launch();
const result = {};

const describeStrips = () =>
  page.evaluate(() => {
    const info = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const c = getComputedStyle(el);
      return {
        tag: el.tagName.toLowerCase(),
        cls: (el.className?.toString?.() ?? '').slice(0, 70),
        rect: {
          x: +r.x.toFixed(1),
          y: +r.y.toFixed(1),
          w: +r.width.toFixed(1),
          h: +r.height.toFixed(1),
        },
        border: `${c.borderTopWidth} ${c.borderRightWidth} ${c.borderBottomWidth} ${c.borderLeftWidth}`,
        borderColors: `T${c.borderTopColor} R${c.borderRightColor} B${c.borderBottomColor} L${c.borderLeftColor}`,
        bg: c.backgroundColor,
        marginBlockEnd: c.marginBlockEnd,
        alignItems: c.alignItems,
        overflow: `${c.overflowX}/${c.overflowY}`,
      };
    };
    return [...document.querySelectorAll('.bai-tab-list--card')].map((nav) => ({
      nav: info(nav),
      tabs: [...nav.querySelectorAll('.astryx-tab')].map((t) => ({
        text: t.textContent?.trim().slice(0, 16),
        selected: t.getAttribute('data-selected'),
        ...info(t),
      })),
      // the flex container the nav sits in + any preceding sibling
      parent: info(nav.parentElement),
      prev: info(nav.previousElementSibling),
      // what element actually paints at (nav.left - 1, nav.top + h/2)?
      atLeftEdge: (() => {
        const r = nav.getBoundingClientRect();
        const pts = [
          ['left-1 / mid', r.left - 1, r.top + r.height / 2],
          ['left+0 / mid', r.left + 0.5, r.top + r.height / 2],
          ['left-1 / top+2', r.left - 1, r.top + 2],
          ['left-1 / bottom-1', r.left - 1, r.bottom - 1],
        ];
        return pts.map(([name, x, y]) => ({
          name,
          x: +x.toFixed(1),
          y: +y.toFixed(1),
          stack: document
            .elementsFromPoint(x, y)
            .slice(0, 4)
            .map(
              (e) =>
                `${e.tagName.toLowerCase()}.${(e.className?.toString?.() ?? '').split(' ')[0]}`,
            ),
        }));
      })(),
    }));
  });

for (const mode of ['light', 'dark']) {
  const m = (result[mode] = {});
  await page.goto(`${BASE}data`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(8000);
  await settle(page);
  m.appliedTheme = await setMode(page, mode);
  await settle(page, 4000);

  m.dataPageStrips = await describeStrips();
  for (const [i, s] of m.dataPageStrips.entries()) {
    const r = s.nav.rect;
    await page.screenshot({
      path: `${ROOT}/before-b-datapage-strip${i}-${mode}.png`,
      clip: { x: Math.max(0, r.x - 30), y: Math.max(0, r.y - 22), width: 260, height: r.h + 44 },
    });
  }

  // ---- explorer modal ----------------------------------------------------
  await page.goto(`${BASE}data?folder=${FOLDER}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(9000);
  await settle(page, 10000);
  await page.waitForTimeout(2500);
  m.explorerStrips = await describeStrips();
  for (const [i, s] of m.explorerStrips.entries()) {
    const r = s.nav.rect;
    await page.screenshot({
      path: `${ROOT}/before-b-explorer-strip${i}-${mode}.png`,
      clip: { x: Math.max(0, r.x - 30), y: Math.max(0, r.y - 22), width: 260, height: r.h + 44 },
    });
  }
}

result.pageErrors = pageErrors;
fs.writeFileSync(`${ROOT}/before-pages-b.json`, JSON.stringify(result, null, 2));
console.log('written');
await browser.close();
