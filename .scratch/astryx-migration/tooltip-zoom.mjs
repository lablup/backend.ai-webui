import fs from 'node:fs';
import { chromium } from '@playwright/test';
import { login } from './probe.mjs';

const OUT = '.scratch/astryx-migration/shots/sider-fixes';
fs.mkdirSync(OUT, { recursive: true });
const PHASE = process.env.PHASE ?? 'after';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
  deviceScaleFactor: 3,
});
const page = await ctx.newPage();
await page.goto('http://127.0.0.1:4500/', { waitUntil: 'domcontentloaded' });
await login(page);

const capture = async (tag) => {
  await page.locator('.bai-sider-shell').first().hover();
  await page.waitForTimeout(500);
  await page.locator('.bai-sider-shell button[aria-label]').first().hover();
  await page.waitForTimeout(1200);
  await page.screenshot({
    path: `${OUT}/${PHASE}-${tag}-tooltip-zoom.png`,
    clip: { x: 230, y: 45, width: 220, height: 60 },
  });
  const kbd = await page.evaluate(() => {
    const k = document.querySelector('.astryx-kbd');
    if (!k) return null;
    const inner = k.firstElementChild ?? k;
    const s = getComputedStyle(inner);
    const tip = document.querySelector('.astryx-tooltip');
    return {
      text: k.textContent,
      bg: s.backgroundColor,
      color: s.color,
      border: `${s.borderBottomWidth} ${s.borderBottomStyle} ${s.borderBottomColor}`,
      fontSize: s.fontSize,
      tooltipBg: tip ? getComputedStyle(tip).backgroundColor : null,
      tooltipColor: tip ? getComputedStyle(tip).color : null,
    };
  });
  console.log(tag, JSON.stringify(kbd, null, 1));
};

await capture('light');

await page
  .locator('button[aria-label="Dark mode"], button[aria-label="Light mode"]')
  .first()
  .click();
await page.waitForTimeout(1500);
await page.mouse.move(900, 500);
await page.waitForTimeout(400);
await capture('dark');

await browser.close();
