// Ticket 12 screenshot harness — captures representative screens after the
// icon batch conversion. Run: pnpm exec node .scratch/astryx-migration/shots/12/capture.mjs <name> <url> [waitMs]
import { chromium } from '@playwright/test';

const [name, url, waitMs = '1500'] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1400, height: 900 },
  ignoreHTTPSErrors: true,
});
await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch((e) => {
  console.error('goto warning:', e.message);
});
await page.waitForTimeout(Number(waitMs));
await page.screenshot({
  path: `.scratch/astryx-migration/shots/12/${name}.png`,
  fullPage: process.env.FULL === '1',
});
console.log('saved', name);
await browser.close();
