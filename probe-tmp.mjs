import { chromium } from '@playwright/test';

const WEBUI = process.env.WEBUI ?? 'http://127.0.0.1:4757';
const OUT = '/home/ubuntu/.claude/jobs/aa8eb1b7/tmp/shots';
const log = (...a) => console.log('[probe]', ...a);

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto(WEBUI, { waitUntil: 'load' });
await page.waitForTimeout(10000);
const basePath = new URL(page.url()).pathname;

// What the palette now emits for a settings hit.
await page.goto(
  `${WEBUI}/usersettings?settings=general&setting=userSettings.AutoLogout`,
  { waitUntil: 'load' },
);
await page.waitForTimeout(9000);
log('palette hit resolved to', page.url());
log(
  'modal open:',
  await page.getByTestId('user-settings-modal').isVisible().catch(() => false),
);
await page.screenshot({ path: `${OUT}/50-palette-setting.png` });

// Legacy notification link, with a page already visited in this session.
await page.goto(`${WEBUI}${basePath}`, { waitUntil: 'load' });
await page.waitForTimeout(7000);
await page.evaluate(() => {
  const a = document.createElement('a');
  a.id = 'probe-nav';
  a.href = '/usersettings?tab=logs';
  a.textContent = 'go';
  document.body.appendChild(a);
});
await page.goto(`${WEBUI}/usersettings?tab=logs`, { waitUntil: 'load' });
await page.waitForTimeout(8000);
log('legacy hard-nav resolved to', page.url());

await browser.close();
