// FR-3755 prototype driver: opens /cli-login in Chromium, logs in, approves, screenshots.
// usage: node drive.mjs <url> <shots-dir> [--paste]
import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';

const [url, dir, mode] = process.argv.slice(2);
const env = Object.fromEntries(
  readFileSync(new URL('../../e2e/envs/.env.playwright', import.meta.url), 'utf8')
    .split('\n').filter((l) => l && !l.startsWith('#')).map((l) => l.split('=')),
);
const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width: 1280, height: 860 } });
const page = await ctx.newPage();
const logs = [];
page.on('console', (m) => logs.push(`[console.${m.type()}] ${m.text()}`));
page.on('requestfailed', (r) => logs.push(`[requestfailed] ${r.method()} ${r.url()} ${r.failure()?.errorText}`));
page.on('response', (r) => { if (r.url().includes('/callback')) logs.push(`[response] ${r.request().method()} ${r.url()} ${r.status()}`); });

await page.goto(url);
await page.getByLabel('Email or Username').waitFor({ timeout: 30000 });
await page.waitForTimeout(800);
await page.screenshot({ path: `${dir}/1-not-logged-in.png` });
const mask = (s) => (s ? `${s.slice(0, 6)}…${s.slice(-4)}` : '');

await page.getByLabel('Email or Username').fill(env.E2E_ADMIN_EMAIL);
await page.getByLabel('Password', { exact: true }).fill(env.E2E_ADMIN_PASSWORD);
await page.getByRole('button', { name: 'Login', exact: true }).click();
await page.getByText('Sign in the Backend.AI CLI with this browser').waitFor({ timeout: 30000 });
await page.waitForTimeout(600);
if (mode === '--paste') {
  await page.screenshot({ path: `${dir}/3-paste-fallback.png` });
  const code = await page.locator('pre, code').allTextContents();
  logs.push(`[page] paste block shows id ${mask(code.join('').trim())}`);
} else {
  await page.screenshot({ path: `${dir}/2-consent.png` });
  const approve = page.getByRole('button', { name: 'Approve' });
  logs.push(`[page] Approve disabled before checkbox: ${await approve.isDisabled()}`);
  await page.getByRole('checkbox').check();
  await approve.click();
  await page.getByText(/CLI signed in|Paste the session id/).first().waitFor({ timeout: 15000 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${dir}/4-after-approve.png` });
  logs.push(`[page] result text: ${(await page.locator('[role=alert],[role=status]').allTextContents()).join(' | ')}`);
}
// re-open in same context: already-logged-in path
await page.goto(url);
await page.getByText('Sign in the Backend.AI CLI with this browser').waitFor({ timeout: 30000 });
await page.waitForTimeout(600);
await page.screenshot({ path: `${dir}/5-revisit-already-logged-in.png` });
logs.push(`[page] revisit: login form visible=${await page.getByLabel('Password', { exact: true }).isVisible().catch(() => false)}`);
console.log(logs.join('\n'));
await browser.close();
