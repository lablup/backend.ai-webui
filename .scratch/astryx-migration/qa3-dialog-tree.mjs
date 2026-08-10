import { chromium } from '@playwright/test';
const BASE = process.env.BAI_BASE ?? 'http://127.0.0.1:6052/';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
const page = await ctx.newPage();
await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(8000);
console.log(
  await page.evaluate(() => {
    const dlg = document.querySelector('dialog.astryx-dialog');
    const lines = [];
    const walk = (el, d) => {
      if (d > 11) return;
      const b = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      lines.push(
        '  '.repeat(d) +
          `${el.tagName}${el.className ? '.' + String(el.className).split(' ').filter((c) => !/^x[0-9a-z]{5,}$/.test(c)).join('.') : ''} ` +
          `box=(${b.x.toFixed(0)},${b.y.toFixed(0)} ${b.width.toFixed(0)}x${b.height.toFixed(0)}) pad=${s.padding} mar=${s.margin} gap=${s.gap} disp=${s.display} align=${s.alignItems} font=${s.fontSize}/${s.lineHeight}`,
      );
      [...el.children].forEach((c) => walk(c, d + 1));
    };
    walk(dlg, 0);
    return lines.join('\n');
  }),
);
await browser.close();
