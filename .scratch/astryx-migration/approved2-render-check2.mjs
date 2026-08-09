// Live check part 2: MyEnvironment (CustomizedImageList) + Users > Credentials.
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

await page.goto(BASE, { waitUntil: 'load' });
await page.waitForTimeout(3000);
const endpoint = page.getByPlaceholder('Endpoint');
if (await endpoint.isVisible().catch(() => false)) {
  await endpoint.fill(process.env.LC_ENDPOINT ?? '');
}
await page
  .getByPlaceholder('Email or Username')
  .fill(process.env.LC_EMAIL ?? '');
await page.getByPlaceholder('Password').fill(process.env.LC_PASSWORD ?? '');
await page.getByRole('button', { name: 'Login', exact: true }).click();
await page.waitForTimeout(12000);
const project = new URL(page.url()).pathname.split('/')[2];
console.log('project:', project);

const visit = async (path, shot) => {
  await page.goto(`${BASE}${path}`, { waitUntil: 'load' });
  await page.waitForTimeout(10000);
  await page.screenshot({ path: `${OUT}/${shot}.png` });
  console.log(`--- ${path}`);
  console.log('  headers:', JSON.stringify(await page.locator('th').allInnerTexts()));
  const rows = await page.locator('tbody tr').count().catch(() => 0);
  console.log('  rows:', rows);
  for (let i = 0; i < Math.min(rows, 2); i++) {
    const cells = await page
      .locator('tbody tr')
      .nth(i)
      .locator('td')
      .allInnerTexts();
    console.log(`  row ${i}:`, JSON.stringify(cells.slice(0, 8)));
  }
};

await visit('admin/users', 'users');

// Credentials tab on the Users page
const credTab = page.getByText('Credentials', { exact: true }).first();
if (await credTab.isVisible().catch(() => false)) {
  await credTab.click();
  await page.waitForTimeout(8000);
  await page.screenshot({ path: `${OUT}/credentials.png` });
  console.log('--- credentials tab');
  console.log('  headers:', JSON.stringify(await page.locator('th').allInnerTexts()));
  const rows = await page.locator('tbody tr').count().catch(() => 0);
  console.log('  rows:', rows);
  for (let i = 0; i < Math.min(rows, 2); i++) {
    console.log(
      `  row ${i}:`,
      JSON.stringify(
        await page.locator('tbody tr').nth(i).locator('td').allInnerTexts(),
      ),
    );
  }
} else {
  console.log('credentials tab not found');
}

await browser.close();
