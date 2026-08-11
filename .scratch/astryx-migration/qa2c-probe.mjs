/**
 * qa2-c structural probe: dump the box tree under a page's card body so the
 * overlap (filter row on top of the table header, pagination on top of the
 * last row) can be attributed to a concrete container.
 */
import { chromium } from '@playwright/test';

const BASE = process.env.QA_BASE ?? 'http://127.0.0.1:5930/';
const ENDPOINT = process.env.BAI_ENDPOINT ?? 'http://10.82.0.130:8090';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1100 },
  ignoreHTTPSErrors: true,
});
await ctx.addInitScript((ep) => {
  try {
    localStorage.setItem('backendaiwebui.api_endpoint', ep);
  } catch {
    /* storage unavailable */
  }
}, ENDPOINT);
const page = await ctx.newPage();
await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(9000);
const userInput = page.locator('input[placeholder*="mail" i]').first();
if (await userInput.count()) {
  await userInput.fill(process.env.BAI_EMAIL ?? 'admin@lablup.com');
  await page
    .locator('input[type="password"]')
    .first()
    .fill(process.env.BAI_PW ?? 'wJalrXUt');
  await page
    .getByRole('button', { name: /login/i })
    .first()
    .click();
}
await page.waitForTimeout(15000);
const PREFIX = new URL(page.url()).pathname.replace(/\/[^/]*$/, '');

const target = process.argv[2] ?? 'data';
const url = target.startsWith('/')
  ? new URL(target, BASE).toString()
  : new URL(PREFIX + '/' + target, BASE).toString();
await page.goto(url, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(10000);

const tree = await page.evaluate(() => {
  const card = document.querySelector('.astryx-card, .ant-card');
  if (!card) return { error: 'no card' };
  const lines = [];
  const walk = (el, depth) => {
    if (depth > 7) return;
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    lines.push(
      '  '.repeat(depth) +
        `<${el.tagName.toLowerCase()} class="${(el.className || '').toString().slice(0, 60)}"> ` +
        `y=${Math.round(r.top)}..${Math.round(r.bottom)} h=${Math.round(r.height)} ` +
        `disp=${s.display} pos=${s.position} gap=${s.rowGap} pad=${s.padding} ` +
        `mt=${s.marginTop} mb=${s.marginBottom} ovf=${s.overflow}`,
    );
    for (const c of el.children) walk(c, depth + 1);
  };
  walk(card, 0);
  return { lines };
});

console.log(tree.error ?? tree.lines.join('\n'));
await browser.close();
