/**
 * qa8 BATCH-3 Q-37 — what does Astryx's ghost IconButton actually declare?
 * Dumps every CSS rule whose selector mentions the ghost button, so the hover
 * wash is copied from the system rather than invented.
 */
import { launch, settle, BASE, ROOT } from './probe-b3-accent-lib.mjs';
import fs from 'node:fs';

const { browser, page, pageErrors } = await launch();
await page.goto(`${BASE}admin/environment`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(8000);
await settle(page);

const out = await page.evaluate(() => {
  const rules = [];
  for (const sheet of Array.from(document.styleSheets)) {
    let list;
    try {
      list = sheet.cssRules;
    } catch {
      continue;
    }
    const walk = (rs, layer) => {
      for (const r of Array.from(rs)) {
        if (r.cssRules && (r.constructor.name === 'CSSLayerBlockRule' || r.media)) {
          walk(r.cssRules, r.name ?? layer);
          continue;
        }
        if (!r.selectorText) continue;
        if (
          /astryx-button/.test(r.selectorText) &&
          /ghost|hover|:where/.test(r.selectorText)
        ) {
          rules.push({
            layer,
            sel: r.selectorText.slice(0, 220),
            css: r.style.cssText.slice(0, 400),
          });
        }
      }
    };
    walk(list, sheet.href ? sheet.href.split('/').pop() : 'inline');
  }

  const btn = Array.from(document.querySelectorAll('button')).find(
    (b) => b.getAttribute('aria-label') === 'Manage Apps',
  );
  const cs = btn ? getComputedStyle(btn) : null;
  const vars = {};
  if (cs) {
    for (const n of [
      '--color-text-accent',
      '--color-text-primary',
      '--color-accent',
      '--color-accent-muted',
      '--color-background-hover',
      '--color-background-muted',
    ])
      vars[n] = cs.getPropertyValue(n).trim();
  }
  return {
    rules,
    btnColor: cs?.color,
    btnVars: vars,
    themeAttr: btn?.closest('[data-astryx-theme]')?.getAttribute('data-astryx-theme'),
  };
});

out.pageErrors = pageErrors;
fs.writeFileSync(`${ROOT}/b3-accent-css.json`, JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2).slice(0, 9000));
await browser.close();
