/** Diagnostic for sweep defect D — admin → Configurations boolean rows. */
import { chromium } from '@playwright/test';
import { BASE, login } from './probe.mjs';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1200 },
});
const page = await ctx.newPage();
await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await login(page);
await page.goto(`${BASE.replace(/\/$/, '')}/admin/settings`, {
  waitUntil: 'domcontentloaded',
});
await page.waitForTimeout(9000);

console.log(
  JSON.stringify(
    await page.evaluate(() => {
      const inputs = [...document.querySelectorAll('input[type="checkbox"]')];
      const dump = inputs.slice(0, 3).map((el) => {
        const root =
          el.closest('.astryx-checkbox-input') ??
          el.closest('label') ??
          el.parentElement;
        const walk = (n, d = 0) =>
          d > 3
            ? []
            : [...n.children].flatMap((c) => {
                const cs = getComputedStyle(c);
                const b = c.getBoundingClientRect();
                return [
                  {
                    d,
                    tag: c.tagName,
                    cls: (c.className || '').toString().slice(0, 90),
                    box: `${Math.round(b.width)}x${Math.round(b.height)}`,
                    bg: cs.backgroundColor,
                    bgImage: cs.backgroundImage.slice(0, 60),
                    border: cs.borderTopWidth + ' ' + cs.borderTopColor,
                    radius: cs.borderRadius,
                    opacity: cs.opacity,
                    display: cs.display,
                  },
                  ...walk(c, d + 1),
                ];
              });
        return {
          checked: el.checked,
          disabled: el.disabled,
          ariaChecked: el.getAttribute('aria-checked'),
          rootCls: (root?.className || '').toString().slice(0, 120),
          rootHtml: (root?.outerHTML || '').slice(0, 900),
          tree: walk(root),
        };
      });
      return { count: inputs.length, dump };
    }),
    null,
    2,
  ),
);

await page.screenshot({
  path: '.scratch/astryx-migration/shots/sweep-fixes/diag-d-config.png',
  fullPage: false,
});
await browser.close();
