/**
 * Visit one live app path and dump console/page errors + a form census.
 *   BAI_PASSWORD=… node .scratch/astryx-migration/live-probe-page.mjs /data
 */
import { chromium } from '@playwright/test';

const APP = process.env.APP ?? 'http://127.0.0.1:4920';
const PATHNAME = process.argv[2] ?? '/data';
const CLICK = process.argv[3];
const ENDPOINT = process.env.BAI_ENDPOINT ?? 'http://10.82.0.130:8090';
const EMAIL = process.env.BAI_EMAIL ?? 'admin@lablup.com';
const PASSWORD = process.env.BAI_PASSWORD ?? '';
const SHOT = process.env.SHOT;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1600, height: 1100 } });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(`console: ${m.text().slice(0, 400)}`);
});

await page.goto(`${APP}/`, { waitUntil: 'networkidle' });
await page.waitForTimeout(6000);
const endpoint = page.getByPlaceholder('Endpoint');
if (await endpoint.count()) {
  if (!(await endpoint.first().inputValue())) await endpoint.first().fill(ENDPOINT);
}
const email = page.getByPlaceholder(/Email or Username/i);
if (await email.count()) {
  if (!(await email.first().inputValue())) await email.first().fill(EMAIL);
  const pw = page.getByPlaceholder(/^Password$/i).first();
  if (!(await pw.inputValue())) await pw.fill(PASSWORD);
  await page.getByRole('button', { name: /^Login$/i }).first().click();
  await page.waitForTimeout(12000);
}
await page.goto(`${APP}/session/start`, { waitUntil: 'networkidle' });
await page.waitForTimeout(6000);
const m = new URL(page.url()).pathname.match(/^\/project\/[^/]+/);
const root = m ? m[0] : '';

errors.length = 0;
await page.goto(`${APP}${PATHNAME.startsWith('/admin') ? '' : root}${PATHNAME}`, {
  waitUntil: 'networkidle',
});
await page.waitForTimeout(8000);
if (CLICK) {
  await page
    .locator('button, a[role="button"]')
    .filter({ hasText: new RegExp(CLICK, 'i') })
    .first()
    .click({ force: true, timeout: 20000 })
    .catch((e) => console.log(`(click: ${e.message.split('\n')[0]})`));
  await page.waitForTimeout(6000);
}
const census = await page.evaluate(() => {
  const items = [...document.querySelectorAll('[data-bai-form-item]')];
  return {
    url: decodeURIComponent(location.pathname),
    items: items.length,
    antdItems: document.querySelectorAll('.ant-form-item').length,
    layouts: [...new Set(items.map((i) => i.dataset.layout))],
    labelColWidths: items
      .map((i) => i.querySelector('[data-bai-form-item-label-col]'))
      .filter(Boolean)
      .map((c) => Math.round(c.getBoundingClientRect().width)),
    labels: items
      .map((i) => i.querySelector('[data-bai-form-item-label]')?.textContent?.trim())
      .filter(Boolean),
    colonShown: items.filter((i) => {
      const l = i.querySelector('[data-bai-form-item-label]');
      if (!l) return false;
      const s = getComputedStyle(l, '::after');
      return s.content === '":"' && s.visibility !== 'hidden';
    }).length,
    errorBoundary: document.body.innerText.includes('An error has occurred'),
  };
});
console.log(JSON.stringify(census, null, 1));
console.log('--- errors ---');
console.log(errors.slice(0, 12).join('\n') || '(none)');
if (SHOT) await page.screenshot({ path: SHOT, fullPage: true });
await browser.close();
