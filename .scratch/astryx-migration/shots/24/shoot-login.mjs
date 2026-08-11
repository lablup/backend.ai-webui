// Ticket 24 login-screen shot runner. Usage: node shoot-login.mjs <prefix>
// Captures the REAL login screen from the app dev server (no backend needed —
// the login panel renders before any authenticated request), light + dark.
// Serve first (ticket-24 port policy, 5705-5714):
//   cd react && pnpm exec vite --port 5707 --strictPort --host 127.0.0.1
import { chromium } from '@playwright/test';

const prefix = process.argv[2] ?? 'shot';
const outDir = new URL('.', import.meta.url).pathname;
const base = 'http://127.0.0.1:5707/';

const browser = await chromium.launch();
for (const scheme of ['light', 'dark']) {
  const ctx = await browser.newContext({
    viewport: { width: 1100, height: 900 },
    colorScheme: scheme,
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.addInitScript((mode) => {
    // The app owns light/dark itself (localStorage), not the OS preference.
    localStorage.setItem('backendaiwebui.settings.themeMode', `"${mode}"`);
  }, scheme);
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  // The login panel is a BAIModal; wait for its Login button.
  await page
    .locator('button', { hasText: /^Login$/ })
    .first()
    .waitFor({ timeout: 60_000 })
    .catch(() => {});
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${outDir}${prefix}-login-${scheme}.png` });

  // Second shot: the "Advanced settings" section expanded (endpoint field +
  // the endpoint-history dropdown trigger + the info IconButton).
  const advanced = page.locator('text=Advanced settings').first();
  if (await advanced.count()) {
    await advanced.click().catch(() => {});
    await page.waitForTimeout(800);
    await page.screenshot({
      path: `${outDir}${prefix}-login-advanced-${scheme}.png`,
    });
  }
  if (errors.length) {
    console.log(`[${prefix} login ${scheme}] page errors:`);
    for (const e of errors.slice(0, 5)) console.log('  ' + e.split('\n')[0]);
  }
  await ctx.close();
}
await browser.close();
console.log('done:', prefix);
