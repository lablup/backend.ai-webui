import fs from 'node:fs';
import { chromium } from '@playwright/test';
import { login } from './probe.mjs';

const OUT = '.scratch/astryx-migration/shots/polish-2';
fs.mkdirSync(OUT, { recursive: true });
const TAG = process.env.TAG ?? 'after';

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
const page = await ctx.newPage();
page.on('pageerror', (e) => console.log('[pageerror]', String(e).slice(0, 200)));
await page.goto('http://127.0.0.1:4500/', { waitUntil: 'domcontentloaded' });
await login(page);

const result = {};

const setMode = async (mode) => {
  const cur = await page.evaluate(
    () => document.documentElement.getAttribute('data-astryx-mode') ??
      getComputedStyle(document.documentElement).colorScheme,
  );
  if (cur !== mode) {
    await page.locator('[data-testid="button-theme"]').first().click();
    await page.waitForTimeout(1200);
  }
  return page.evaluate(
    () => getComputedStyle(document.documentElement).colorScheme,
  );
};

const measure = async () => ({
  tokens: await page.evaluate(() => {
    const cs = getComputedStyle(document.documentElement);
    const pick = [
      '--color-border',
      '--color-border-emphasized',
      '--color-error',
      '--color-success',
      '--color-warning',
      '--color-on-error',
      '--color-on-success',
      '--color-on-warning',
      '--color-on-dark',
      '--color-on-accent',
    ];
    const o = {};
    for (const k of pick) o[k] = cs.getPropertyValue(k).trim();
    return o;
  }),
  breadcrumb: await page.evaluate(() => {
    const b = document.querySelector('[data-testid="webui-breadcrumb"]');
    return b ? getComputedStyle(b).borderBottomColor : null;
  }),
  header: await page.evaluate(() => {
    const h = document.querySelector('.bai-webui-header');
    const snap = (el) => ({
      text: (el.textContent || '').trim().slice(0, 18),
      cls: String(el.className?.baseVal ?? el.className).slice(0, 40),
      color: getComputedStyle(el).color,
    });
    const kids = [...h.querySelectorAll('*')].filter(
      (e) =>
        e.tagName === 'svg' ||
        [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()),
    );
    return {
      root: { color: getComputedStyle(h).color, bg: getComputedStyle(h).backgroundColor },
      kids: kids.slice(0, 8).map(snap),
    };
  }),
});

result.light = await measure();
result.light.mode = await page.evaluate(
  () => getComputedStyle(document.documentElement).colorScheme,
);
await page.screenshot({ path: `${OUT}/${TAG}-header-light.png`, clip: { x: 0, y: 0, width: 1600, height: 110 } });

// ---- collapsed rail (light)
const shell = page.locator('.bai-sider-shell').first();
await shell.hover();
await page.waitForTimeout(500);
await page.locator('button.bai-sider-toggle').first().click();
await page.waitForTimeout(900);
result.rail = await page.evaluate(() => {
  const nav = document.querySelector('.bai-sider');
  const nr = nav.getBoundingClientRect();
  return [...document.querySelectorAll('.astryx-side-nav-item')].map((it) => {
    const r = it.getBoundingClientRect();
    const svg = it.querySelector('svg');
    const sr = svg?.getBoundingClientRect();
    return {
      label: (it.getAttribute('aria-label') || it.textContent || '').trim().slice(0, 18),
      x: +r.x.toFixed(1),
      offCenter: sr ? +(sr.x + sr.width / 2 - (nr.x + nr.width / 2)).toFixed(2) : null,
    };
  });
});
await shell.hover();
await page.waitForTimeout(500);
result.toggleCollapsed = await page.evaluate(() => {
  const b = document.querySelector('button.bai-sider-toggle');
  const r = b.getBoundingClientRect();
  const s = getComputedStyle(b);
  return { w: +r.width.toFixed(2), h: +r.height.toFixed(2), radius: s.borderRadius, aspect: s.aspectRatio };
});
await page.screenshot({ path: `${OUT}/${TAG}-rail-collapsed-light.png`, clip: { x: 0, y: 0, width: 420, height: 1000 } });

// ---- dark mode
await page.locator('button.bai-sider-toggle').first().click();
await page.waitForTimeout(800);
await setMode('dark');
result.dark = await measure();
result.dark.mode = await page.evaluate(
  () => getComputedStyle(document.documentElement).colorScheme,
);
await page.screenshot({ path: `${OUT}/${TAG}-header-dark.png`, clip: { x: 0, y: 0, width: 1600, height: 110 } });
await shell.hover();
await page.waitForTimeout(500);
await page.locator('button.bai-sider-toggle').first().click();
await page.waitForTimeout(900);
await shell.hover();
await page.waitForTimeout(500);
result.toggleCollapsedDark = await page.evaluate(() => {
  const b = document.querySelector('button.bai-sider-toggle');
  const r = b.getBoundingClientRect();
  return { w: +r.width.toFixed(2), h: +r.height.toFixed(2) };
});
await page.screenshot({ path: `${OUT}/${TAG}-rail-collapsed-dark.png`, clip: { x: 0, y: 0, width: 420, height: 1000 } });

// back to light + expanded
await page.locator('button.bai-sider-toggle').first().click();
await page.waitForTimeout(800);
await setMode('light');

fs.writeFileSync(`${OUT}/${TAG}.json`, JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
await browser.close();
