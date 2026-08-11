/** Probe the Chat page DOM to locate the composer + its clipping ancestor. */
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const BASE = 'http://127.0.0.1:4735';
const env = Object.fromEntries(
  fs
    .readFileSync(
      path.join(import.meta.dirname, '../../../react/.env.development.local'),
      'utf8',
    )
    .split('\n')
    .filter(Boolean)
    .map((l) => {
      const i = l.indexOf('=');
      return [l.slice(0, i), l.slice(i + 1)];
    }),
);

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(5000);
const email = page.getByPlaceholder(/Email or Username/i).first();
if (await email.isVisible().catch(() => false)) {
  await email.fill(env.VITE_DEFAULT_EMAIL);
  await page
    .getByPlaceholder(/^Password$/i)
    .first()
    .fill(env.VITE_DEFAULT_PASSWORD);
  const ep = page.getByPlaceholder(/^Endpoint$/i).first();
  if (await ep.isVisible().catch(() => false))
    await ep.fill(env.VITE_DEFAULT_API_ENDPOINT);
  await page.locator('button:has-text("Login")').first().click();
}
await page.waitForTimeout(10000);
await page.goto(`${BASE}/chat`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(9000);

const info = await page.evaluate(() => {
  const el = Array.from(document.querySelectorAll('*')).find(
    (e) =>
      e.getAttribute('placeholder')?.includes('Type your message') ||
      e.getAttribute('data-placeholder')?.includes('Type your message') ||
      (e.getAttribute('aria-label') || '').includes('Type your message'),
  );
  if (!el) {
    return {
      found: false,
      sample: Array.from(document.querySelectorAll('[class*=chat i]'))
        .slice(0, 20)
        .map((e) => e.tagName + '.' + e.className),
    };
  }
  const chain = [];
  for (let n = el; n && n !== document.body; n = n.parentElement) {
    const cs = getComputedStyle(n);
    const b = n.getBoundingClientRect();
    chain.push({
      tag: n.tagName.toLowerCase(),
      cls: (n.className || '').toString().slice(0, 100),
      top: Math.round(b.top),
      bottom: Math.round(b.bottom),
      h: Math.round(b.height),
      clientH: n.clientHeight,
      scrollH: n.scrollHeight,
      of: cs.overflow,
      flex: cs.flex,
      minH: cs.minHeight,
      pos: cs.position,
    });
  }
  return { found: true, chain };
});

console.log(JSON.stringify(info, null, 1));
await browser.close();
