import fs from 'node:fs';
import { launch, login } from './probe.mjs';

const OUT = '.scratch/astryx-migration/shots/sider-fixes';
fs.mkdirSync(OUT, { recursive: true });
const PHASE = process.env.PHASE ?? 'after';

const { browser, page } = await launch();
await login(page);

const setCollapsed = async (want) => {
  await page.locator('.bai-sider-shell').first().hover();
  await page.waitForTimeout(500);
  const btn = page.locator('.bai-sider-toggle').first();
  const isCollapsed = (await btn.getAttribute('aria-label')) === 'Expand';
  if (isCollapsed !== want) {
    await btn.click();
    await page.waitForTimeout(1000);
  }
  await page.mouse.move(1000, 600);
  await page.waitForTimeout(600);
};

const gotoAdmin = async () => {
  await page.goto(new URL('/admin/users', page.url()).href, {
    waitUntil: 'domcontentloaded',
  });
  await page.waitForTimeout(7000);
};

await gotoAdmin();
await setCollapsed(false);
await page.screenshot({
  path: `${OUT}/${PHASE}-light-admin-expanded.png`,
  clip: { x: 0, y: 0, width: 340, height: 640 },
});
await setCollapsed(true);
await page.screenshot({
  path: `${OUT}/${PHASE}-light-admin-collapsed.png`,
  clip: { x: 0, y: 0, width: 140, height: 640 },
});

// dark
await page
  .locator('button[aria-label="Dark mode"], button[aria-label="Light mode"]')
  .first()
  .click();
await page.waitForTimeout(1500);
await page.screenshot({
  path: `${OUT}/${PHASE}-dark-admin-collapsed.png`,
  clip: { x: 0, y: 0, width: 140, height: 640 },
});
await setCollapsed(false);
await page.screenshot({
  path: `${OUT}/${PHASE}-dark-admin-expanded.png`,
  clip: { x: 0, y: 0, width: 340, height: 640 },
});

await browser.close();
console.log('done admin states', PHASE);
