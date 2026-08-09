/**
 * qa2-d layout measurement — why is the composer clipped / narrow?
 */
import { chromium } from '@playwright/test';

const BASE = process.env.QA2D_BASE ?? 'http://127.0.0.1:5940/';
const MOCK_ORIGIN = 'http://qa2d-mock.test';
const MOCK_MODEL = 'qa2-d-mock-model';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
});
const page = await ctx.newPage();

await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(8000);
const userInput = page.locator('input[placeholder="Email or Username"]').first();
if (await userInput.count()) {
  const ep = page.locator('input[placeholder="Endpoint"]').first();
  if (await ep.count()) await ep.fill(process.env.BAI_ENDPOINT);
  await userInput.fill(process.env.BAI_EMAIL);
  await page.locator('input[type="password"]').first().fill(process.env.BAI_PW);
  await page.getByRole('button', { name: /^login$/i }).first().click();
}
await page.waitForTimeout(18000);
const PREFIX =
  new URL(page.url()).pathname.match(/^\/project\/[^/]+/)?.[0] ?? '';

await page.route('**/admin/gql', async (route) => {
  const response = await route.fetch();
  let body = await response.text();
  body = body.replace(
    /"endpointUrl":\s*(null|"[^"]*")/g,
    `"endpointUrl":"${MOCK_ORIGIN}/"`,
  );
  await route.fulfill({ response, body });
});
const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': '*',
  'access-control-allow-methods': '*',
};
await page.route(`${MOCK_ORIGIN}/**`, async (route) => {
  const r = route.request();
  if (r.method() === 'OPTIONS')
    return route.fulfill({ status: 204, headers: CORS });
  if (new URL(r.url()).pathname.endsWith('/models'))
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: CORS,
      body: JSON.stringify({ object: 'list', data: [{ id: MOCK_MODEL }] }),
    });
  return route.fulfill({ status: 200, contentType: 'text/event-stream', headers: CORS, body: 'data: [DONE]\n\n' });
});

await page.goto(`${BASE.replace(/\/$/, '')}${PREFIX}/chat`, {
  waitUntil: 'domcontentloaded',
});
await page.waitForTimeout(15000);

const info = await page.evaluate(() => {
  const editable = document.querySelector('[aria-label="Type your message here..."]');
  if (!editable) return { error: 'no composer' };
  const chain = [];
  let el = editable;
  for (let i = 0; i < 10 && el; i += 1) {
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    chain.push({
      tag: el.tagName.toLowerCase(),
      cls: (el.className || '').toString().slice(0, 70),
      rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
      display: cs.display,
      flex: cs.flex,
      alignItems: cs.alignItems,
      minHeight: cs.minHeight,
      overflow: cs.overflow,
      width: cs.width,
    });
    el = el.parentElement;
  }
  return { chain, innerHeight: window.innerHeight };
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
