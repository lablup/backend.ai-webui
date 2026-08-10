// Dump the OPEN Astryx user-menu popover's DOM + computed styles so the
// probe can be scoped correctly (the page carries several closed
// `.astryx-dropdown-menu`s — the notification one is first in document order).
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const DARK = process.env.DARK === '1';
const BASE = process.env.BAI_BASE ?? 'http://127.0.0.1:6060/';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
  colorScheme: DARK ? 'dark' : 'light',
});
const page = await ctx.newPage();
await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await page.waitForSelector('[data-testid="user-dropdown-button"]', { timeout: 90000 });
await page.waitForTimeout(4000);
if (DARK) {
  await page.getByRole('button', { name: /^dark mode$/i }).first().click();
  await page.waitForTimeout(1200);
}
await page.locator('[data-testid="user-dropdown-button"]').first().click();
await page.waitForTimeout(1000);

const out = await page.evaluate(() => {
  const menus = [...document.querySelectorAll('.astryx-dropdown-menu')];
  const open = menus.find((m) => m.getBoundingClientRect().width > 0);
  const pop = open?.closest('[popover]') ?? null;
  const dump = (el, depth = 0, acc = []) => {
    if (!el || depth > 4) return acc;
    const s = getComputedStyle(el);
    const b = el.getBoundingClientRect();
    acc.push({
      depth,
      tag: el.tagName,
      cls: String(el.className).slice(0, 90),
      attrs: [...el.attributes].map((a) => a.name).join(','),
      x: +b.x.toFixed(1),
      y: +b.y.toFixed(1),
      w: +b.width.toFixed(1),
      h: +b.height.toFixed(1),
      display: s.display,
      bg: s.backgroundColor,
      border: s.border,
      borderTop: s.borderTop,
      shadow: s.boxShadow.slice(0, 120),
      radius: s.borderRadius,
      pad: s.padding,
      gap: s.gap,
      font: `${s.fontSize}/${s.lineHeight}`,
      color: s.color,
      opacity: s.opacity,
      text: (el.textContent ?? '').trim().slice(0, 24),
    });
    for (const c of el.children) dump(c, depth + 1, acc);
    return acc;
  };
  return {
    menuCount: menus.length,
    popTag: pop?.tagName ?? null,
    popCls: String(pop?.className ?? ''),
    tree: dump(pop ?? open),
  };
});

fs.writeFileSync('/tmp/qa4-menu-dom.json', JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1).slice(0, 12000));
await browser.close();
