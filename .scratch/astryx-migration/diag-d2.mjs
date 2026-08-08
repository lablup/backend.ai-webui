/** Defect D, pass 2 — every Configurations checkbox's visual box. */
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

const dump = () =>
  page.evaluate(() => {
    return [...document.querySelectorAll('.astryx-checkbox-input')].map((r) => {
      const input = r.querySelector('input[type=checkbox]');
      const boxEl = r.querySelector('.astryx-checkbox');
      const cs = boxEl ? getComputedStyle(boxEl) : null;
      const svg = boxEl?.querySelector('svg');
      const label = r.textContent.trim().slice(0, 40);
      return {
        label,
        checked: input?.checked,
        disabled: input?.disabled,
        boxClass: (boxEl?.className || '').toString().match(/astryx-\S+|disabled/g),
        bg: cs?.backgroundColor,
        border: cs ? `${cs.borderTopWidth} ${cs.borderTopStyle} ${cs.borderTopColor}` : null,
        radius: cs?.borderRadius,
        checkDisplay: svg ? getComputedStyle(svg).display : null,
        checkColor: svg ? getComputedStyle(svg).color : null,
      };
    });
  });

console.log(JSON.stringify(await dump(), null, 2));

const first = page.locator('.astryx-checkbox-input').nth(2);
if (await first.count()) {
  await first.screenshot({
    path: '.scratch/astryx-migration/shots/sweep-fixes/diag-d2-checkbox-zoom.png',
  });
}
await page.screenshot({
  path: '.scratch/astryx-migration/shots/sweep-fixes/diag-d2-config.png',
});
await browser.close();
