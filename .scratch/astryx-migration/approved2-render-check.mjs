// Live check: Environments > Images full-image-path column.
import { chromium } from '@playwright/test';

const BASE = 'http://127.0.0.1:4735/';
const OUT =
  '/home/ubuntu/Workspace/backend.ai-webui/.claude/worktrees/to-astryx/.scratch/astryx-migration/shots/approved-2';

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1600, height: 950 },
});
const page = await context.newPage();
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
page.on('console', (m) => {
  if (m.type() === 'error' && !m.text().includes('fonts.googleapis'))
    console.log('[console.error]', m.text().slice(0, 300));
});

await page.goto(BASE, { waitUntil: 'load' });
await page.waitForTimeout(3000);

const endpoint = page.getByPlaceholder('Endpoint');
if (await endpoint.isVisible().catch(() => false)) {
  await endpoint.fill(process.env.LC_ENDPOINT ?? '');
}
await page.getByPlaceholder('Email or Username').fill(process.env.LC_EMAIL ?? '');
await page.getByPlaceholder('Password').fill(process.env.LC_PASSWORD ?? '');
await page.getByRole('button', { name: 'Login', exact: true }).click();
await page.waitForTimeout(12000);
await page.screenshot({ path: `${OUT}/after-login.png` });
console.log('url after login:', page.url());

await page.goto(`${BASE}environment`, { waitUntil: 'load' });
await page.waitForTimeout(12000);
await page.screenshot({ path: `${OUT}/environments.png` });

const headers = await page.locator('th').allInnerTexts();
console.log('headers:', JSON.stringify(headers));

const rows = await page.locator('tbody tr').count().catch(() => 0);
console.log('row count:', rows);

for (let i = 0; i < Math.min(rows, 3); i++) {
  const cells = await page
    .locator('tbody tr')
    .nth(i)
    .locator('td')
    .allInnerTexts();
  console.log(`row ${i}:`, JSON.stringify(cells.slice(0, 6)));
}

await browser.close();
