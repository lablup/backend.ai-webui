import fs from 'node:fs';
import { chromium } from '@playwright/test';
import { login } from './probe.mjs';

const OUT = '.scratch/astryx-migration/shots/polish-2';
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
  deviceScaleFactor: 6,
});
const page = await ctx.newPage();
await page.goto('http://127.0.0.1:4500/', { waitUntil: 'domcontentloaded' });
await login(page);

const shell = page.locator('.bai-sider-shell').first();
await shell.hover();
await page.waitForTimeout(600);
const btn = page.locator('button.bai-sider-toggle').first();
await btn.screenshot({ path: `${OUT}/zoom-toggle-expanded.png` });

// full paint box incl. any pseudo/shadow
const box = await btn.boundingBox();
console.log('EXPANDED box', box);
await page.screenshot({
  path: `${OUT}/zoom-toggle-expanded-ctx.png`,
  clip: { x: box.x - 14, y: box.y - 14, width: box.width + 28, height: box.height + 28 },
});

// what does the inner content look like?
const inner = await page.evaluate(() => {
  const b = document.querySelector('button.bai-sider-toggle');
  const out = [];
  const walk = (el, d) => {
    const s = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    out.push({
      d,
      tag: el.tagName,
      cls: String(el.className?.baseVal ?? el.className).slice(0, 60),
      w: +r.width.toFixed(2),
      h: +r.height.toFixed(2),
      radius: s.borderRadius,
      bg: s.backgroundColor,
      border: `${s.borderWidth} ${s.borderColor}`,
      display: s.display,
      outline: `${s.outlineWidth} ${s.outlineStyle} ${s.outlineColor}`,
      boxShadow: s.boxShadow,
      transform: s.transform,
      scale: s.scale,
    });
    for (const c of el.children) walk(c, d + 1);
  };
  walk(b, 0);
  // pseudo elements
  for (const p of ['::before', '::after']) {
    const ps = getComputedStyle(b, p);
    out.push({
      d: 'pseudo' + p,
      content: ps.content,
      w: ps.width,
      h: ps.height,
      radius: ps.borderRadius,
      bg: ps.backgroundColor,
      inset: `${ps.top}/${ps.right}/${ps.bottom}/${ps.left}`,
      position: ps.position,
      border: `${ps.borderWidth} ${ps.borderColor}`,
    });
  }
  return out;
});
console.log('INNER', JSON.stringify(inner, null, 2));

// collapse and repeat
await btn.click();
await page.waitForTimeout(900);
await shell.hover();
await page.waitForTimeout(600);
const btn2 = page.locator('button.bai-sider-toggle').first();
const box2 = await btn2.boundingBox();
console.log('COLLAPSED box', box2);
await btn2.screenshot({ path: `${OUT}/zoom-toggle-collapsed.png` });
await page.screenshot({
  path: `${OUT}/zoom-toggle-collapsed-ctx.png`,
  clip: { x: box2.x - 14, y: box2.y - 14, width: box2.width + 28, height: box2.height + 28 },
});

await browser.close();
