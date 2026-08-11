/** audit-1 — log in and persist storage state for reuse by every later probe. */
import { chromium } from '@playwright/test';

const BASE = process.env.BASE ?? 'http://127.0.0.1:5950/';
const ROOT =
  '/home/ubuntu/Workspace/backend.ai-webui/.claude/worktrees/agent-a5c43b155842c4f7b/.scratch/astryx-migration';

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
const page = await ctx.newPage();
page.setDefaultNavigationTimeout(180000);
page.setDefaultTimeout(60000);
page.on('console', (m) => {
  if (m.type() === 'error') console.log('[console.error]', m.text().slice(0, 200));
});
await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(9000);
const user = page.locator('input[placeholder="Email or Username"]').first();
if (await user.count()) {
  console.log('login form present');
  await page
    .getByRole('button', { name: /^login$/i })
    .first()
    .click();
} else console.log('no login form; url=', page.url());
await page.waitForTimeout(20000);
console.log('after-login url', page.url());
const hrefs = await page.evaluate(() => [
  ...new Set(
    Array.from(document.querySelectorAll('a[href]'))
      .map((a) => a.getAttribute('href'))
      .filter((h) => h && h.startsWith('/')),
  ),
]);
console.log('NAV', JSON.stringify(hrefs));
await ctx.storageState({ path: `${ROOT}/audit1-state.json` });
await page.screenshot({ path: `${ROOT}/shots/audit-1/00-login-landing.png` });
await browser.close();
