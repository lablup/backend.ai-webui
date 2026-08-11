/**
 * qa8 SESSION (E) part 2 — the status column on a WIDER column set
 *   (/admin-session), plus the width at which the tag starts to clip.
 * qa8 SESSION (G) — the Cluster Mode block on launcher step 2, both modes:
 *   SegmentedControl track width vs its two items (legacy antd `Radio.Group`
 *   is `display:inline-block` and hugs its buttons).
 */
import { launch, setMode, settle, BASE, ROOT } from './probe-session-lib.mjs';
import fs from 'node:fs';

const { browser, page, ctx, pageErrors } = await launch();
const result = {};

const scanStatus = () =>
  page.evaluate(() => {
    const ths = Array.from(document.querySelectorAll('th'));
    const th = ths.find((t) => /^\s*Status\s*$/i.test(t.textContent ?? ''));
    if (!th) return { error: 'no Status th', headers: ths.map((t) => t.textContent?.trim()) };
    const idx = Array.from(th.parentElement.children).indexOf(th);
    const rows = Array.from(document.querySelectorAll('tbody tr'));
    const cells = rows.map((r) => r.children[idx]).filter(Boolean);
    const per = cells.slice(0, 8).map((c) => {
      const inner = c.firstElementChild;
      const badge = c.querySelector('.astryx-badge');
      return {
        text: c.textContent?.trim().slice(0, 30),
        clientW: c.clientWidth,
        scrollW: c.scrollWidth,
        innerClientW: inner?.clientWidth ?? null,
        innerScrollW: inner?.scrollWidth ?? null,
        badgeW: badge ? +badge.getBoundingClientRect().width.toFixed(1) : null,
        clipped: (inner?.scrollWidth ?? 0) > (inner?.clientWidth ?? 0) + 0.5,
      };
    });
    return {
      viewportW: window.innerWidth,
      columnCount: ths.length,
      thW: +th.getBoundingClientRect().width.toFixed(1),
      thInlineWidth: th.style.width || null,
      tableW: +(document.querySelector('table')?.getBoundingClientRect().width ?? 0).toFixed(1),
      cells: per,
      anyClipped: per.some((p) => p.clipped),
    };
  });

// ---------- (E2) admin sessions, wider column set -------------------------
result.adminSession = {};
for (const w of [1600, 1400, 1200, 1024]) {
  await page.setViewportSize({ width: w, height: 1000 });
  await page.goto(`${BASE}admin-session`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(9000);
  await settle(page, 25000);
  result.adminSession[w] = await scanStatus();
  if (w === 1600 || result.adminSession[w].anyClipped) {
    await page.screenshot({ path: `${ROOT}/before-adminsession-status-${w}.png` });
  }
}

// same sweep on the personal /session list
result.session = {};
for (const w of [1600, 1400, 1200, 1024]) {
  await page.setViewportSize({ width: w, height: 1000 });
  await page.goto(`${BASE}session`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(8000);
  await settle(page, 25000);
  result.session[w] = await scanStatus();
}

// ---------- (G) Cluster Mode block, both modes ----------------------------
await page.setViewportSize({ width: 1600, height: 1000 });
result.clusterMode = {};
for (const mode of ['light', 'dark']) {
  await page.goto(`${BASE}session/start`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(12000);
  await settle(page, 30000);
  await setMode(page, mode);
  await page.waitForTimeout(1200);
  await page.getByRole('button', { name: /^Next/i }).first().click();
  await page.waitForTimeout(8000);
  await settle(page, 30000);
  await page.evaluate(() => {
    const l = Array.from(document.querySelectorAll('label')).find((e) =>
      /^\s*Cluster Mode\s*$/i.test(e.textContent ?? ''),
    );
    l?.scrollIntoView({ block: 'center' });
  });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${ROOT}/before-clustermode-${mode}.png` });
  result.clusterMode[mode] = await page.evaluate(() => {
    const l = Array.from(document.querySelectorAll('label')).find((e) =>
      /^\s*Cluster Mode\s*$/i.test(e.textContent ?? ''),
    );
    if (!l) return { error: 'no label' };
    const item = l.closest('[data-bai-form-item]');
    const seg = item?.querySelector('[class*="segmented" i]');
    const rr = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const c = getComputedStyle(el);
      return {
        tag: el.tagName,
        cls: String(el.className).slice(0, 60),
        x: +r.x.toFixed(1),
        y: +r.y.toFixed(1),
        w: +r.width.toFixed(1),
        h: +r.height.toFixed(1),
        display: c.display,
        bg: c.backgroundColor,
        color: c.color,
        borderRadius: c.borderRadius,
        fontWeight: c.fontWeight,
        boxShadow: c.boxShadow,
      };
    };
    const items = seg
      ? Array.from(seg.querySelectorAll('button')).map((b) => ({
          ...rr(b),
          ariaChecked: b.getAttribute('aria-checked'),
          selected: /\bselected\b/.test(String(b.className)),
          visibleLabel: Array.from(b.childNodes)
            .map((n) => (n.nodeType === 3 ? n.textContent : n.textContent))
            .join('|')
            .slice(0, 60),
        }))
      : null;
    const itemsW = items ? items.reduce((a, b) => a + b.w, 0) : 0;
    return {
      label: rr(l),
      formItem: rr(item),
      segmented: rr(seg),
      items,
      itemsTotalW: +itemsW.toFixed(1),
      emptyTrackW: seg ? +(rr(seg).w - itemsW).toFixed(1) : null,
    };
  });
}

result.pageErrors = pageErrors;
fs.writeFileSync(`${ROOT}/before-session-eg.json`, JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 1));
await browser.close();
