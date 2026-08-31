// FR-3791 PROTOTYPE — verify pick mode rides react-grab's selection UI.
// react-grab's capture layer fails Playwright actionability, so use raw
// mouse coordinates captured before activating pick mode.
import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://fr3791-pins.jongeun.10-82-0-159.sslip.io/', {
  waitUntil: 'domcontentloaded',
});
await page.waitForSelector('[data-bai-review-overlay]', {
  state: 'attached',
  timeout: 30000,
});
await page.waitForFunction(() => !!window.__REACT_GRAB__, null, {
  timeout: 20000,
});
await page.waitForTimeout(4000);

const box = await page
  .locator('button', { hasText: 'Create Folder' })
  .first()
  .boundingBox();
const cx = box.x + box.width / 2;
const cy = box.y + box.height / 2;

await page.evaluate(() => {
  const sr = document.querySelector('[data-bai-review-overlay]').shadowRoot;
  sr.querySelector('.toggle').click();
  sr.querySelector('[data-act="pick"]').click();
});
await page.waitForTimeout(500);
const active = await page.evaluate(() => window.__REACT_GRAB__.isActive());

await page.mouse.move(cx, cy, { steps: 8 });
await page.waitForTimeout(900);
await page.screenshot({ path: 'proto-scripts/shots/3-grab-hover.png' });
await page.mouse.click(cx, cy);
await page.waitForTimeout(1000);

const result = await page.evaluate(() => {
  const sr = document.querySelector('[data-bai-review-overlay]').shadowRoot;
  return {
    grabStillActive: window.__REACT_GRAB__.isActive(),
    composeVisible: sr.querySelector('.compose').style.display === 'block',
    pathlabel: sr.querySelector('.pathlabel').textContent,
  };
});
await page.screenshot({ path: 'proto-scripts/shots/4-grab-compose.png' });
console.log(JSON.stringify({ active, ...result }, null, 2));
await browser.close();
