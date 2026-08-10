/**
 * qa8 SESSION (B) app-launcher icon aspect ratio,
 *                (C) SessionActionButtons control height,
 *                (D) Session Type value vs its info IconButton y-centres.
 *
 * Read-only: opens the detail drawer and the App launcher dialog, closes with
 * Escape. Never clicks a launch/terminate confirm.
 *
 * Usage: node .scratch/astryx-migration/qa8/probe-session-bcd.mjs
 */
import { launch, setMode, settle, BASE, ROOT } from './probe-session-lib.mjs';
import fs from 'node:fs';

const { browser, page, pageErrors } = await launch();
const result = {};

const rr = () => {};

for (const mode of ['light', 'dark']) {
  await page.goto(`${BASE}session`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(7000);
  await settle(page);
  const applied = await setMode(page, mode);
  await page.waitForTimeout(1200);
  await settle(page);
  const m = (result[mode] = { appliedTheme: applied });

  // open the detail drawer on the first RUNNING session
  const opened = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('tbody tr'));
    const row = rows.find((r) => /RUNNING/.test(r.textContent ?? '')) ?? rows[0];
    if (!row) return null;
    const link = row.querySelector('a, [role="link"], button');
    if (!link) return null;
    link.click();
    return row.textContent?.slice(0, 60);
  });
  m.openedRow = opened;
  await page.waitForTimeout(4000);
  await settle(page);

  await page.screenshot({ path: `${ROOT}/before-session-drawer-${mode}.png` });

  // ---------- (C) action buttons in the drawer ---------------------------
  m.actionButtons = await page.evaluate(() => {
    const groups = Array.from(
      document.querySelectorAll('[class*="button-group" i], .astryx-button-group'),
    );
    const pick =
      groups.find((g) => g.querySelectorAll('button').length >= 3) ?? groups[0];
    if (!pick) {
      return {
        error: 'no button group',
        candidates: Array.from(document.querySelectorAll('[class*="group" i]'))
          .slice(0, 12)
          .map((g) => String(g.className).slice(0, 80)),
      };
    }
    const gr = pick.getBoundingClientRect();
    const gs = getComputedStyle(pick);
    return {
      groupCls: String(pick.className).slice(0, 120),
      group: {
        w: +gr.width.toFixed(1),
        h: +gr.height.toFixed(1),
        gap: gs.gap,
      },
      buttons: Array.from(pick.querySelectorAll('button')).map((b) => {
        const r = b.getBoundingClientRect();
        const c = getComputedStyle(b);
        const svg = b.querySelector('svg');
        const sr = svg?.getBoundingClientRect();
        return {
          label: b.getAttribute('aria-label') ?? b.textContent?.trim(),
          w: +r.width.toFixed(1),
          h: +r.height.toFixed(1),
          padding: `${c.paddingTop} ${c.paddingRight} ${c.paddingBottom} ${c.paddingLeft}`,
          fontSize: c.fontSize,
          minHeight: c.minHeight,
          minWidth: c.minWidth,
          borderRadius: c.borderRadius,
          dataSize: b.getAttribute('data-size'),
          cls: String(b.className).slice(0, 110),
          svg: sr
            ? { w: +sr.width.toFixed(1), h: +sr.height.toFixed(1) }
            : null,
        };
      }),
    };
  });

  // ---------- (D) Session Type row ---------------------------------------
  m.sessionType = await page.evaluate(() => {
    const labels = Array.from(document.querySelectorAll('*')).filter(
      (e) =>
        e.children.length === 0 && /^\s*Session Type\s*$/i.test(e.textContent ?? ''),
    );
    const lab = labels[0];
    if (!lab) return { error: 'label not found' };
    // the value container is the label's next sibling (MetadataListItem)
    let value = lab.nextElementSibling;
    if (!value) value = lab.parentElement?.nextElementSibling;
    if (!value) return { error: 'no value node', labCls: String(lab.className) };
    const cs = getComputedStyle(value);
    const mid = (el) => {
      const r = el.getBoundingClientRect();
      return {
        cls: String(el.className).slice(0, 90),
        tag: el.tagName,
        x: +r.x.toFixed(1),
        y: +r.y.toFixed(1),
        w: +r.width.toFixed(1),
        h: +r.height.toFixed(1),
        cy: +(r.y + r.height / 2).toFixed(2),
        display: getComputedStyle(el).display,
        verticalAlign: getComputedStyle(el).verticalAlign,
      };
    };
    const kids = Array.from(value.children).map(mid);
    const labR = lab.getBoundingClientRect();
    return {
      valueCls: String(value.className).slice(0, 110),
      valueDisplay: cs.display,
      valueAlignItems: cs.alignItems,
      valueGap: cs.gap,
      valueLineHeight: cs.lineHeight,
      valueRect: mid(value),
      labelRect: {
        y: +labR.y.toFixed(1),
        h: +labR.height.toFixed(1),
        cy: +(labR.y + labR.height / 2).toFixed(2),
      },
      children: kids,
      deltaCy:
        kids.length >= 2 ? +(kids[1].cy - kids[0].cy).toFixed(2) : null,
      text: value.textContent?.trim().slice(0, 60),
    };
  });

  // For the same alignment question on a row that IS wrapped in a BAIFlex:
  m.statusRow = await page.evaluate(() => {
    const labels = Array.from(document.querySelectorAll('*')).filter(
      (e) => e.children.length === 0 && /^\s*Status\s*$/i.test(e.textContent ?? ''),
    );
    const lab = labels.find((l) => l.closest('[class*="metadata" i]')) ?? labels[0];
    if (!lab) return { error: 'no status label' };
    const value = lab.nextElementSibling ?? lab.parentElement?.nextElementSibling;
    if (!value) return { error: 'no value' };
    const cs = getComputedStyle(value);
    const kids = Array.from(value.querySelectorAll(':scope > * > *')).map((el) => {
      const r = el.getBoundingClientRect();
      return {
        tag: el.tagName,
        cls: String(el.className).slice(0, 70),
        h: +r.height.toFixed(1),
        cy: +(r.y + r.height / 2).toFixed(2),
      };
    });
    return {
      valueCls: String(value.className).slice(0, 110),
      display: cs.display,
      alignItems: cs.alignItems,
      kids,
    };
  });

  // ---------- (B) app launcher dialog ------------------------------------
  const appBtnClicked = await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll('button')).find((x) =>
      /app dialog|see app|apps/i.test(x.getAttribute('aria-label') ?? ''),
    );
    if (!b) return null;
    b.click();
    return b.getAttribute('aria-label');
  });
  m.appBtnClicked = appBtnClicked;
  await page.waitForTimeout(3500);
  await settle(page);
  await page.screenshot({ path: `${ROOT}/before-session-apps-${mode}.png` });

  m.appIcons = await page.evaluate(() => {
    const dlg =
      document.querySelector('dialog[open]') ??
      document.querySelector('[role="dialog"]');
    const scope = dlg ?? document;
    const imgs = Array.from(scope.querySelectorAll('img'));
    return {
      dialog: dlg
        ? {
            tag: dlg.tagName,
            cls: String(dlg.className).slice(0, 90),
            w: +dlg.getBoundingClientRect().width.toFixed(1),
          }
        : null,
      imgs: imgs.map((img) => {
        const r = img.getBoundingClientRect();
        const c = getComputedStyle(img);
        const parent = img.parentElement;
        const pr = parent?.getBoundingClientRect();
        const pc = parent ? getComputedStyle(parent) : null;
        const btn = img.closest('button');
        const br = btn?.getBoundingClientRect();
        return {
          src: (img.getAttribute('src') ?? '').slice(-48),
          natural: { w: img.naturalWidth, h: img.naturalHeight },
          naturalRatio: img.naturalHeight
            ? +(img.naturalWidth / img.naturalHeight).toFixed(3)
            : null,
          rendered: { w: +r.width.toFixed(2), h: +r.height.toFixed(2) },
          renderedRatio: r.height ? +(r.width / r.height).toFixed(3) : null,
          objectFit: c.objectFit,
          width: c.width,
          height: c.height,
          maxWidth: c.maxWidth,
          maxHeight: c.maxHeight,
          aspectRatio: c.aspectRatio,
          alignSelf: c.alignSelf,
          flex: `${c.flexGrow} ${c.flexShrink} ${c.flexBasis}`,
          inlineStyle: img.getAttribute('style'),
          imgCls: String(img.className).slice(0, 90),
          parent: pr
            ? {
                tag: parent.tagName,
                cls: String(parent.className).slice(0, 90),
                w: +pr.width.toFixed(1),
                h: +pr.height.toFixed(1),
                display: pc.display,
                alignItems: pc.alignItems,
                fontSize: pc.fontSize,
              }
            : null,
          button: br
            ? { w: +br.width.toFixed(1), h: +br.height.toFixed(1) }
            : null,
        };
      }),
    };
  });

  await page.keyboard.press('Escape');
  await page.waitForTimeout(800);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
}

result.pageErrors = pageErrors;
fs.writeFileSync(
  `${ROOT}/before-session-bcd.json`,
  JSON.stringify(result, null, 2),
);
console.log(JSON.stringify(result, null, 2));
await browser.close();
