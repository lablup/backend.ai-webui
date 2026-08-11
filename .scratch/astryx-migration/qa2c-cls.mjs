/** qa2-c: dump the CSS text of specific StyleX atomic classes at runtime. */
import { chromium } from '@playwright/test';

const BASE = process.env.QA_BASE ?? 'http://127.0.0.1:5930/';
const CLASSES = (process.argv[2] ?? 'xkibk3,xlayyun').split(',');

const browser = await chromium.launch();
const ctx = await browser.newContext({ ignoreHTTPSErrors: true });
const page = await ctx.newPage();
await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(8000);

console.log(
  JSON.stringify(
    await page.evaluate((classes) => {
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
            const txt = r.cssText ?? '';
            for (const c of classes)
              if (txt.includes('.' + c))
                hits.push({ href: sheet.href?.slice(-60) ?? 'inline', txt });
          }
        };
        walk(rules);
      }
      return hits;
    }, CLASSES),
    null,
    1,
  ),
);
await browser.close();
