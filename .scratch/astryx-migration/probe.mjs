import { chromium } from '@playwright/test';

export const BASE = 'http://127.0.0.1:4500/';
const EMAIL = process.env.BAI_EMAIL;
const PW = process.env.BAI_PW;

export async function launch() {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
  const page = await ctx.newPage();
  page.on('console', (m) => {
    if (m.type() === 'error') console.log('[console.error]', m.text().slice(0, 300));
  });
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  return { browser, ctx, page };
}

export async function login(page) {
  await page.waitForTimeout(5000);
  const userInput = page.locator('input[placeholder="Email or Username"]').first();
  if (await userInput.count()) {
    const ep = page.locator('input[placeholder="Endpoint"]').first();
    if (await ep.count()) await ep.fill(process.env.BAI_ENDPOINT ?? '');
    await userInput.fill(EMAIL ?? '');
    await page.locator('input[type="password"]').first().fill(PW ?? '');
    await page.getByRole('button', { name: /^login$/i }).first().click();
  }
  await page.waitForTimeout(12000);
}
