import fs from 'node:fs';
import { chromium } from '@playwright/test';
import { login } from './probe.mjs';

const OUT = '.scratch/astryx-migration/shots/polish-2';
fs.mkdirSync(OUT, { recursive: true });
const TAG = process.env.TAG ?? 'after';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
  deviceScaleFactor: 3,
});
const page = await ctx.newPage();
page.on('pageerror', (e) => console.log('[pageerror]', String(e).slice(0, 200)));
await page.goto('http://127.0.0.1:4500/', { waitUntil: 'domcontentloaded' });
await login(page);

// admin scope -> users
await page.goto('http://127.0.0.1:4500/admin/users', {
  waitUntil: 'domcontentloaded',
});
await page.waitForTimeout(9000);
console.log('url', page.url());

const grp = page.locator('.astryx-button-group').first();
await grp.waitFor({ timeout: 20000 });
const box = await grp.boundingBox();
console.log('GROUP box', box);

const geom = await page.evaluate(() => {
  const g = document.querySelector('.astryx-button-group');
  if (!g) return null;
  const gr = g.getBoundingClientRect();
  const kids = [...g.children].map((c) => {
    const r = c.getBoundingClientRect();
    const s = getComputedStyle(c);
    return {
      tag: c.tagName,
      cls: String(c.className).slice(0, 60),
      x: +r.x.toFixed(2),
      right: +r.right.toFixed(2),
      w: +r.width.toFixed(2),
      h: +r.height.toFixed(2),
      radius: s.borderRadius,
      bg: s.backgroundColor,
    };
  });
  // gaps between consecutive rendered buttons
  const btns = kids.filter((k) => k.w > 0);
  const gaps = [];
  for (let i = 1; i < btns.length; i++)
    gaps.push(+(btns[i].x - btns[i - 1].right).toFixed(2));
  return { group: { w: +gr.width.toFixed(2), h: +gr.height.toFixed(2) }, kids, gaps };
});
console.log('GEOM', JSON.stringify(geom, null, 2));

await page.screenshot({
  path: `${OUT}/${TAG}-users-buttongroup-light.png`,
  clip: { x: box.x - 16, y: box.y - 12, width: box.width + 32, height: box.height + 24 },
});

// open the More menu
if (process.env.OPEN_MENU !== '0') {
  const trigger = page.locator('.astryx-button-group button').last();
  await trigger.click();
  await page.waitForTimeout(900);
  const menuVisible = await page
    .getByText(/bulk create/i)
    .first()
    .isVisible()
    .catch(() => false);
  console.log('MENU opened:', menuVisible);
  await page.screenshot({
    path: `${OUT}/${TAG}-users-menu-open-light.png`,
    clip: { x: Math.max(0, box.x - 260), y: box.y - 12, width: 560, height: 260 },
  });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
}

// dark
await page.locator('[data-testid="button-theme"]').first().click();
await page.waitForTimeout(1500);
const box2 = await grp.boundingBox();
await page.screenshot({
  path: `${OUT}/${TAG}-users-buttongroup-dark.png`,
  clip: { x: box2.x - 16, y: box2.y - 12, width: box2.width + 32, height: box2.height + 24 },
});
await page.locator('[data-testid="button-theme"]').first().click();
await page.waitForTimeout(1200);

await browser.close();
