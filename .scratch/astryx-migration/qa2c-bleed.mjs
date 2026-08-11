/**
 * qa2-c: identify exactly which declarations give the Astryx table scroll
 * wrapper its negative block margins (the cause of the filter-row / table /
 * pagination overlap on every table page).
 */
import { chromium } from '@playwright/test';

const BASE = process.env.QA_BASE ?? 'http://127.0.0.1:5930/';
const ENDPOINT = process.env.BAI_ENDPOINT ?? 'http://10.82.0.130:8090';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1100 },
  ignoreHTTPSErrors: true,
});
await ctx.addInitScript((ep) => {
  try {
    localStorage.setItem('backendaiwebui.api_endpoint', ep);
  } catch {
    /* storage unavailable */
  }
}, ENDPOINT);
const page = await ctx.newPage();
await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(9000);
const u = page.locator('input[placeholder*="mail" i]').first();
if (await u.count()) {
  await u.fill('admin@lablup.com');
  await page.locator('input[type="password"]').first().fill('wJalrXUt');
  await page
    .getByRole('button', { name: /login/i })
    .first()
    .click();
}
await page.waitForTimeout(15000);
const PREFIX = new URL(page.url()).pathname.replace(/\/[^/]*$/, '');
await page.goto(new URL(PREFIX + '/data', BASE).toString(), {
  waitUntil: 'domcontentloaded',
});
await page.waitForTimeout(10000);

console.log(
  JSON.stringify(
    await page.evaluate(() => {
      const w = document.querySelector('.astryx-table-scroll-wrapper');
      if (!w) return { error: 'no wrapper' };
      const s = getComputedStyle(w);
      const parent = w.parentElement;
      const ps = getComputedStyle(parent);
      return {
        classes: (w.className || '').toString(),
        margin: {
          top: s.marginTop,
          bottom: s.marginBottom,
          left: s.marginLeft,
          right: s.marginRight,
          blockStart: s.marginBlockStart,
          inlineStart: s.marginInlineStart,
        },
        vars: {
          padInlineStart: s.getPropertyValue('--container-padding-inline-start'),
          padInlineEnd: s.getPropertyValue('--container-padding-inline-end'),
          padBlockStart: s.getPropertyValue('--container-padding-block-start'),
          padBlockEnd: s.getPropertyValue('--container-padding-block-end'),
        },
        parent: {
          classes: (parent.className || '').toString(),
          display: ps.display,
          padding: ps.padding,
        },
        // Which stylesheet rules actually match this element?
        matched: (() => {
          const hits = [];
          for (const sheet of document.styleSheets) {
            let rules;
            try {
              rules = sheet.cssRules;
            } catch {
              continue;
            }
            const walk = (list) => {
              for (const r of list) {
                if (r.cssRules) {
                  walk(r.cssRules);
                  continue;
                }
                if (!r.selectorText) continue;
                let m = false;
                try {
                  m = w.matches(r.selectorText);
                } catch {
                  /* unsupported selector */
                }
                if (m && /margin/.test(r.cssText)) hits.push(r.cssText);
              }
            };
            walk(rules);
          }
          return hits;
        })(),
      };
    }),
    null,
    1,
  ),
);
await browser.close();
