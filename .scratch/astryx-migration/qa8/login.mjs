/** qa8 — log in and persist storage state for reuse by the probes. */
import { chromium } from '@playwright/test';

const BASE =
  process.env.BASE ?? 'https://to-astryx.backend-ai-webui.localhost:1357/';
const ROOT = process.env.ROOT ?? '.scratch/astryx-migration/qa8';
const EMAIL = process.env.EMAIL ?? 'admin@lablup.com';
const PASSWORD = process.env.PASSWORD ?? 'wJalrXUt';
const ENDPOINT = process.env.ENDPOINT ?? 'http://10.82.0.130:8090';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
  ignoreHTTPSErrors: true,
});
const page = await ctx.newPage();
page.setDefaultNavigationTimeout(180000);
page.setDefaultTimeout(60000);
page.on('pageerror', (e) => console.log('PAGEERROR', e.message));
await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(9000);

const user = page.locator('input[placeholder="Email or Username"]').first();
if (await user.count()) {
  // The endpoint field lives under the "Advanced" disclosure; expand if collapsed.
  const endpointInput = page.locator('input[placeholder="Endpoint"]').first();
  if (!(await endpointInput.isVisible().catch(() => false))) {
    await page
      .getByText(/advanced/i)
      .first()
      .click();
    await page.waitForTimeout(500);
  }
  await endpointInput.fill(ENDPOINT);
  await user.fill(EMAIL);
  await page.locator('input[type="password"]').first().fill(PASSWORD);
  console.log('filled', {
    email: await user.inputValue(),
    endpoint: await endpointInput.inputValue(),
  });
  await page
    .getByRole('button', { name: /^login$/i })
    .first()
    .click();
} else console.log('no login form; url=', page.url());

await page.waitForTimeout(25000);
console.log('after-login url', page.url());
console.log(
  'logged-in?',
  (await page.locator('.bai-sider, [class*="side-nav"]').count()) > 0,
);
await ctx.storageState({ path: `${ROOT}/state.json` });
await page.screenshot({ path: `${ROOT}/00-landing.png` });
await browser.close();
