/**
 * qa8 SESSION (D) — Session Type tag vs its info IconButton y-centres.
 * qa8 SESSION (E) — status column width vs the widest status tag, incl. the
 *                   Finished tab (TERMINATED / CANCELLED) and every status label.
 *
 * (D) note: the info IconButton only renders for a BATCH session with a
 * startup_command, and the shared cluster currently has none. The DOM shape is
 * reproduced CLIENT-SIDE ONLY by cloning the Status row's own ghost/sm
 * IconButton into the Session Type <dd> — identical components, identical
 * sizes, no request and no mutation. The `statusRow` block below is the
 * untouched control: the same pair inside a BAIFlex.
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
  await page.waitForTimeout(1200);
  await settle(page);
  const m = (result[mode] = { appliedTheme: applied });

  // ---------------- (E) status column, Running tab -------------------------
  const statusScan = () =>
    page.evaluate(() => {
      const ths = Array.from(document.querySelectorAll('th'));
      const th = ths.find((t) => /^\s*Status\s*$/i.test(t.textContent ?? ''));
      if (!th) return { error: 'no Status th' };
      const idx = Array.from(th.parentElement.children).indexOf(th);
      const cs = getComputedStyle(th);
      const rows = Array.from(document.querySelectorAll('tbody tr'));
      const cells = rows.map((r) => r.children[idx]).filter(Boolean);
      const per = cells.map((c) => {
        const inner = c.firstElementChild;
        const badge = c.querySelector('.astryx-badge');
        return {
          text: c.textContent?.trim().slice(0, 40),
          cellW: +c.getBoundingClientRect().width.toFixed(1),
          cellClientW: c.clientWidth,
          cellScrollW: c.scrollWidth,
          innerClientW: inner?.clientWidth ?? null,
          innerScrollW: inner?.scrollWidth ?? null,
          badgeW: badge ? +badge.getBoundingClientRect().width.toFixed(1) : null,
          badgeScrollW: badge?.scrollWidth ?? null,
          overflowing: c.scrollWidth > c.clientWidth + 0.5,
          innerOverflowing: inner
            ? inner.scrollWidth > inner.clientWidth + 0.5
            : null,
          textTruncatedCss: inner ? getComputedStyle(inner).textOverflow : null,
        };
      });
      return {
        headerCount: ths.length,
        thW: +th.getBoundingClientRect().width.toFixed(1),
        thInlineWidth: th.style.width || null,
        thPad: `${cs.paddingLeft}/${cs.paddingRight}`,
        tableW: +(
          document.querySelector('table')?.getBoundingClientRect().width ?? 0
        ).toFixed(1),
        cells: per,
        maxNeeded: Math.max(...per.map((p) => p.innerScrollW ?? 0)),
      };
    });

  m.statusRunning = await statusScan();

  // Finished tab -> TERMINATED / CANCELLED
  await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll('button')).find(
      (x) => /^\s*Finished\s*$/i.test(x.textContent ?? ''),
    );
    b?.click();
  });
  await page.waitForTimeout(5000);
  await settle(page);
  m.statusFinished = await statusScan();
  await page.screenshot({
    path: `${ROOT}/before-status-finished-${mode}.png`,
    clip: { x: 260, y: 470, width: 1000, height: 400 },
  });

  // widest possible status label, measured in the SAME badge style
  m.badgeWidthProbe = await page.evaluate(() => {
    const badge = document.querySelector('.astryx-badge');
    if (!badge) return null;
    const clone = badge.cloneNode(true);
    clone.style.position = 'absolute';
    clone.style.visibility = 'hidden';
    clone.style.whiteSpace = 'nowrap';
    document.body.appendChild(clone);
    const out = {};
    for (const label of [
      'RUNNING',
      'PENDING',
      'PREPARING',
      'TERMINATING',
      'TERMINATED',
      'CANCELLED',
      'SCHEDULED',
      'RESTARTING',
      'PULLING',
    ]) {
      // replace only the text node, keep icon children
      const textNodes = Array.from(clone.childNodes).filter(
        (n) => n.nodeType === 3 || n.tagName === 'SPAN',
      );
      clone.textContent = label;
      out[label] = +clone.getBoundingClientRect().width.toFixed(1);
      void textNodes;
    }
    clone.remove();
    return out;
  });

  // back to Running
  await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll('button')).find(
      (x) => /^\s*Running\s*$/i.test(x.textContent ?? ''),
    );
    b?.click();
  });
  await page.waitForTimeout(4000);
  await settle(page);

  // ---------------- (D) session detail drawer ------------------------------
  await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('tbody tr'));
    const row = rows.find((r) => /RUNNING/.test(r.textContent ?? '')) ?? rows[0];
    row?.querySelector('a, [role="link"], button')?.click();
  });
  await page.waitForTimeout(4500);
  await settle(page);

  m.sessionTypeRow = await page.evaluate(() => {
    const findDd = (labelText) => {
      const dt = Array.from(document.querySelectorAll('dt')).find((e) =>
        new RegExp(`^\\s*${labelText}\\s*$`, 'i').test(e.textContent ?? ''),
      );
      return dt ? { dt, dd: dt.nextElementSibling } : null;
    };
    const typePair = findDd('Session Type');
    const statusPair = findDd('Status');
    if (!typePair?.dd) return { error: 'no Session Type dd' };
    const cy = (el) => {
      const r = el.getBoundingClientRect();
      return {
        tag: el.tagName,
        cls: String(el.className).slice(0, 60),
        y: +r.y.toFixed(2),
        h: +r.height.toFixed(2),
        cy: +(r.y + r.height / 2).toFixed(2),
        display: getComputedStyle(el).display,
        verticalAlign: getComputedStyle(el).verticalAlign,
        text: el.textContent?.trim().slice(0, 24),
      };
    };

    // control: the untouched Status row (BAIFlex-wrapped pair)
    const statusFlex = statusPair?.dd?.firstElementChild;
    const control = statusFlex
      ? {
          wrapperCls: String(statusFlex.className).slice(0, 60),
          display: getComputedStyle(statusFlex).display,
          alignItems: getComputedStyle(statusFlex).alignItems,
          children: Array.from(statusFlex.children).map(cy),
        }
      : null;

    const ddCS = getComputedStyle(typePair.dd);
    const before = {
      ddDisplay: ddCS.display,
      ddAlignItems: ddCS.alignItems,
      ddLineHeight: ddCS.lineHeight,
      ddFontSize: ddCS.fontSize,
      children: Array.from(typePair.dd.children).map(cy),
    };

    // CLIENT-SIDE ONLY reproduction of the batch case: clone the Status row's
    // ghost/sm IconButton and append it next to the type badge.
    let after = null;
    const srcBtn = statusPair?.dd?.querySelector('button');
    if (srcBtn) {
      const clone = srcBtn.cloneNode(true);
      clone.setAttribute('data-qa8-clone', '1');
      typePair.dd.appendChild(clone);
      after = {
        children: Array.from(typePair.dd.children).map(cy),
      };
      after.deltaCy =
        after.children.length >= 2
          ? +(
              after.children[after.children.length - 1].cy -
              after.children[0].cy
            ).toFixed(2)
          : null;
      clone.remove();
    }
    return { before, after, control, dd: cy(typePair.dd), dt: cy(typePair.dt) };
  });

  await page.screenshot({ path: `${ROOT}/before-sessiontype-${mode}.png` });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(600);
}

result.pageErrors = pageErrors;
fs.writeFileSync(`${ROOT}/before-session-de.json`, JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 1));
await browser.close();
