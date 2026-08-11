/**
 * qa8 SESSION (A) — "My Total Resource Usage" panel padding on /session.
 * qa8 SESSION (E) — status column default width vs the status tag's needed width.
 *
 * Usage: node .scratch/astryx-migration/qa8/probe-session-a.mjs
 */
import { launch, setMode, settle, BASE, ROOT } from './probe-session-lib.mjs';
import fs from 'node:fs';

const { browser, page, pageErrors } = await launch();
const result = {};

for (const mode of ['light', 'dark']) {
  await page.goto(`${BASE}session`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(7000);
  await settle(page);
  const applied = await setMode(page, mode);
  await page.waitForTimeout(1500);
  await settle(page);
  const m = (result[mode] = { appliedTheme: applied });

  // ---------- (A) the resource card -------------------------------------
  m.card = await page.evaluate(() => {
    const heads = Array.from(document.querySelectorAll('*')).filter(
      (e) =>
        e.children.length === 0 &&
        /My Total Resource Usage/i.test(e.textContent ?? ''),
    );
    const title = heads[0];
    if (!title) return { error: 'title not found' };
    const card = title.closest('.bai-card');
    if (!card) return { error: 'no .bai-card ancestor' };
    const rr = (el) => {
      const r = el.getBoundingClientRect();
      return {
        x: +r.x.toFixed(1),
        y: +r.y.toFixed(1),
        w: +r.width.toFixed(1),
        h: +r.height.toFixed(1),
        bottom: +r.bottom.toFixed(1),
      };
    };
    const cs = getComputedStyle(card);
    // chain from card down to the deepest last visible descendant
    const chain = [];
    let el = card;
    for (let i = 0; i < 8 && el; i++) {
      const c = getComputedStyle(el);
      chain.push({
        depth: i,
        tag: el.tagName,
        cls: String(el.className).slice(0, 90),
        rect: rr(el),
        padding: `${c.paddingTop} ${c.paddingRight} ${c.paddingBottom} ${c.paddingLeft}`,
        gap: c.rowGap,
        display: c.display,
      });
      el = el.firstElementChild;
    }
    // the very last painted descendant inside the card
    const all = Array.from(card.querySelectorAll('*')).filter((n) => {
      const r = n.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    });
    const lowest = all.reduce(
      (acc, n) =>
        n.getBoundingClientRect().bottom >
        (acc?.getBoundingClientRect().bottom ?? -Infinity)
          ? n
          : acc,
      null,
    );
    const titleRow = title.closest('.bai-card__head') ?? title.parentElement;
    return {
      card: rr(card),
      cardPadding: `${cs.paddingTop} ${cs.paddingRight} ${cs.paddingBottom} ${cs.paddingLeft}`,
      cardBorderRadius: cs.borderRadius,
      chain,
      titleRow: rr(titleRow),
      lowestDescendant: {
        tag: lowest?.tagName,
        cls: String(lowest?.className).slice(0, 90),
        rect: lowest ? rr(lowest) : null,
      },
      gapBelowContent: lowest
        ? +(
            card.getBoundingClientRect().bottom -
            lowest.getBoundingClientRect().bottom
          ).toFixed(1)
        : null,
      gapAboveTitle: +(
        (titleRow?.getBoundingClientRect().top ?? 0) -
        card.getBoundingClientRect().top
      ).toFixed(1),
    };
  });

  // ---------- (E) status column ------------------------------------------
  m.statusColumn = await page.evaluate(() => {
    const ths = Array.from(document.querySelectorAll('th'));
    const th = ths.find((t) => /^\s*Status\s*$/i.test(t.textContent ?? ''));
    if (!th) return { error: 'no Status th', headers: ths.map((t) => t.textContent?.trim()) };
    const idx = Array.from(th.parentElement.children).indexOf(th);
    const rr = (el) => {
      const r = el.getBoundingClientRect();
      return { w: +r.width.toFixed(1), h: +r.height.toFixed(1) };
    };
    const rows = Array.from(document.querySelectorAll('tbody tr'));
    const cells = rows
      .map((r) => r.children[idx])
      .filter(Boolean)
      .slice(0, 6);
    const cs = getComputedStyle(th);
    return {
      th: {
        ...rr(th),
        padding: `${cs.paddingTop} ${cs.paddingRight} ${cs.paddingBottom} ${cs.paddingLeft}`,
        whiteSpace: cs.whiteSpace,
        inlineStyleWidth: th.style.width || null,
        colWidthAttr: th.getAttribute('width'),
      },
      colgroupWidth:
        document.querySelector('table colgroup')?.children[idx]?.style?.width ??
        null,
      cells: cells.map((c) => {
        const cst = getComputedStyle(c);
        const tag =
          c.querySelector('[class*="tag" i],[class*="Tag"],[class*="badge" i]') ??
          c.firstElementChild;
        const tr = tag?.getBoundingClientRect();
        const inner = c.firstElementChild;
        return {
          cellW: +c.getBoundingClientRect().width.toFixed(1),
          cellPad: `${cst.paddingLeft} / ${cst.paddingRight}`,
          cellOverflow: cst.overflow,
          text: c.textContent?.trim().slice(0, 40),
          tagCls: String(tag?.className).slice(0, 80),
          tagW: tr ? +tr.width.toFixed(1) : null,
          tagH: tr ? +tr.height.toFixed(1) : null,
          tagScrollW: tag ? tag.scrollWidth : null,
          tagClientW: tag ? tag.clientWidth : null,
          innerScrollW: inner ? inner.scrollWidth : null,
          innerClientW: inner ? inner.clientWidth : null,
          cellScrollW: c.scrollWidth,
          cellClientW: c.clientWidth,
          clipped: c.scrollWidth > c.clientWidth,
        };
      }),
    };
  });

  await page.screenshot({
    path: `${ROOT}/before-session-panel-${mode}.png`,
    clip: { x: 200, y: 60, width: 1400, height: 620 },
  });
}

result.pageErrors = pageErrors;
fs.writeFileSync(
  `${ROOT}/before-session-a.json`,
  JSON.stringify(result, null, 2),
);
console.log(JSON.stringify(result, null, 2));
await browser.close();
