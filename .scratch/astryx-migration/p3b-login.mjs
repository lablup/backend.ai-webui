/**
 * Phase 3 / ticket B — one-off login that persists browser state so the
 * follow-up probe scripts start authenticated.
 *
 *   BAI_WEBUI=... BAI_ENDPOINT=... BAI_EMAIL=... BAI_PW=... \
 *     node .scratch/astryx-migration/p3b-login.mjs
 */
import { chromium } from '@playwright/test';

const BASE = process.env.BAI_WEBUI ?? 'http://127.0.0.1:5820/';
const STATE = process.env.BAI_STATE ?? '/tmp/p3b-state.json';

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
const page = await ctx.newPage();

await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(6000);
const userInput = page.locator('input[placeholder="Email or Username"]').first();
if (await userInput.count()) {
  const ep = page.locator('input[placeholder="Endpoint"]').first();
  if ((await ep.count()) && process.env.BAI_ENDPOINT)
    await ep.fill(process.env.BAI_ENDPOINT);
  await userInput.fill(process.env.BAI_EMAIL ?? '');
  await page.locator('input[type="password"]').first().fill(process.env.BAI_PW ?? '');
  await page.getByRole('button', { name: /^login$/i }).first().click();
}
await page.waitForTimeout(15000);
console.log('logged in at', page.url());
await ctx.storageState({ path: STATE });
await browser.close();
