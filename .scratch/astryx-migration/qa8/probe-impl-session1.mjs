/**
 * qa8 IMPL — FIX 1 (app launcher icon aspect ratio) + FIX 3 (Status column
 * clipping).
 *
 *  FIX 1: open the App Launcher from the first running session on /session and
 *         report, per <img>, naturalW/H vs rendered W/H and the ratio
 *         (renderedW/renderedH) / (naturalW/naturalH). 1.000 == undistorted.
 *  FIX 3: on /session and /admin-session, at 1600 and 1200, report the Status
 *         <th> width, the first body cell's clientWidth vs scrollWidth, and the
 *         widest status-cell overflow in the visible rows.
 *
 * Usage: TAG=before node .scratch/astryx-migration/qa8/probe-impl-session1.mjs
 */
import fs from 'node:fs';
import { BASE, ROOT, launch, setMode, settle, r2 } from './probe-impl-session-lib.mjs';

const TAG = process.env.TAG ?? 'before';
const out = { tag: TAG, base: BASE, at: new Date().toISOString() };

const { browser, page, pageErrors } = await launch();

async function goto(path) {
  await page.goto(new URL(path, BASE).toString(), {
    waitUntil: 'domcontentloaded',
  });
  // `/session` redirects to `/project/<name>/session` and its query is slow;
  // wait for real rows rather than a fixed timeout.
  await page
    .waitForSelector('table tbody tr', { timeout: 90000 })
    .catch(() => {});
  await settle(page);
  await page.waitForTimeout(1500);
}

/* ------------------------------------------------------------------ FIX 3 */
async function measureStatusColumn(route, width) {
  await page.setViewportSize({ width, height: 1000 });
  await goto(route);
  // give the table's column engine a frame to redistribute
  await page.waitForTimeout(1200);
  return page.evaluate(() => {
    const table = document.querySelector('table');
    if (!table) return { error: 'no table' };
    const ths = Array.from(table.querySelectorAll('thead th'));
    const idx = ths.findIndex((th) => /status/i.test(th.textContent || ''));
    const headers = ths.map((th) => ({
      label: (th.textContent || '').trim().slice(0, 24),
      w: +th.getBoundingClientRect().width.toFixed(2),
    }));
    if (idx < 0) return { headers, error: 'no status column' };
    const th = ths[idx];
    const thStyle = getComputedStyle(th);
    const cells = Array.from(table.querySelectorAll('tbody tr')).map((tr) => {
      const td = tr.children[idx];
      if (!td) return null;
      const cs = getComputedStyle(td);
      // the cell's own content wrapper is what actually scrolls
      const inner = td.firstElementChild ?? td;
      return {
        text: (td.textContent || '').trim().slice(0, 40),
        tdClientW: td.clientWidth,
        tdScrollW: td.scrollWidth,
        innerClientW: inner.clientWidth,
        innerScrollW: inner.scrollWidth,
        overflowX: cs.overflowX,
        textOverflow: cs.textOverflow,
        padding: `${cs.paddingLeft}/${cs.paddingRight}`,
        clipped: inner.scrollWidth - inner.clientWidth,
      };
    });
    return {
      headers,
      statusIndex: idx,
      thWidth: +th.getBoundingClientRect().width.toFixed(2),
      thMinWidth: thStyle.minWidth,
      cells: cells.filter(Boolean),
      worstClip: Math.max(0, ...cells.filter(Boolean).map((c) => c.clipped)),
    };
  });
}

out.fix3 = {};
for (const route of ['/session', '/admin-session']) {
  for (const w of [1600, 1200]) {
    out.fix3[`${route}@${w}`] = await measureStatusColumn(route, w);
  }
}

/* ------------------------------------------------------------------ FIX 1 */
await page.setViewportSize({ width: 1600, height: 1000 });

async function measureAppLauncher(mode) {
  await goto('/session');
  await setMode(page, mode);
  await page.waitForTimeout(800);
  const btn = page.getByRole('button', { name: /see app dialog/i });
  const n = await btn.count();
  let opened = false;
  for (let i = 0; i < n; i++) {
    const b = btn.nth(i);
    if (await b.isDisabled().catch(() => true)) continue;
    await b.click();
    opened = true;
    break;
  }
  if (!opened) return { error: 'no enabled See App Dialog button', buttons: n };
  await page.waitForTimeout(2500);
  const res = await page.evaluate(() => {
    const dlg =
      document.querySelector('dialog[open]') ??
      document.querySelector('[role="dialog"]');
    if (!dlg) return { error: 'no dialog' };
    const imgs = Array.from(dlg.querySelectorAll('img')).map((img) => {
      const r = img.getBoundingClientRect();
      const cs = getComputedStyle(img);
      const nw = img.naturalWidth;
      const nh = img.naturalHeight;
      const rw = +r.width.toFixed(2);
      const rh = +r.height.toFixed(2);
      return {
        alt: img.alt,
        naturalW: nw,
        naturalH: nh,
        renderedW: rw,
        renderedH: rh,
        flexShrink: cs.flexShrink,
        objectFit: cs.objectFit,
        // 1.000 == the rendered box has the source's aspect ratio
        ratio:
          nw && nh && rh ? +(rw / rh / (nw / nh)).toFixed(3) : null,
      };
    });
    const btnEl = dlg.querySelector('button');
    const br = btnEl?.getBoundingClientRect();
    return {
      imgs,
      firstTileButton: br
        ? { w: +br.width.toFixed(2), h: +br.height.toFixed(2) }
        : null,
    };
  });
  await page.keyboard.press('Escape').catch(() => {});
  await page.waitForTimeout(500);
  return res;
}

out.fix1 = {};
for (const mode of ['light', 'dark']) {
  out.fix1[mode] = await measureAppLauncher(mode);
}

out.pageErrors = pageErrors;
fs.writeFileSync(
  `${ROOT}/${TAG}-impl-session1.json`,
  JSON.stringify(out, null, 2),
);
console.log(JSON.stringify(out, null, 2));
await browser.close();
