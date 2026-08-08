/** p3-w2c: capture the full text of the launcher's React DOM-prop warning. */
import { chromium } from '@playwright/test';

const BASE = process.env.W2C_BASE ?? 'http://127.0.0.1:5870/';
const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1800, height: 1100 },
});
const page = await ctx.newPage();
const seen = new Set();
page.on('console', async (m) => {
  if (m.type() !== 'error') return;
  const args = await Promise.all(
    m.args().map((a) => a.jsonValue().catch(() => '<?>')),
  );
  const txt = args.map(String).join(' | ').slice(0, 400);
  if (!seen.has(txt)) {
    seen.add(txt);
    if (/does not recognize|Warning: Invalid|Unknown prop/i.test(txt))
      console.log('### WARN', txt);
  }
});
page.on('pageerror', (e) => console.log('### PAGEERROR', String(e).slice(0, 300)));

await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(9000);
const userInput = page.locator('input[placeholder="Email or Username"]').first();
if (await userInput.count()) {
  const ep = page.locator('input[placeholder="Endpoint"]').first();
  if ((await ep.count()) && process.env.BAI_ENDPOINT)
    await ep.fill(process.env.BAI_ENDPOINT);
  await userInput.fill(process.env.BAI_EMAIL);
  await page.locator('input[type="password"]').first().fill(process.env.BAI_PW);
  await page
    .getByRole('button', { name: /^login$/i })
    .first()
    .click();
}
await page.waitForTimeout(18000);

await page.goto(`${BASE}session/start`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(20000);
for (let i = 0; i < 3; i += 1) {
  await page
    .getByRole('button', { name: /^next$/i })
    .first()
    .click()
    .catch(() => {});
  await page.waitForTimeout(7000);
  await page.screenshot({
    path: `.scratch/astryx-migration/shots/p3-w2c/40-launcher-step${i + 2}.png`,
  });
}
console.log('### done');
await browser.close();
