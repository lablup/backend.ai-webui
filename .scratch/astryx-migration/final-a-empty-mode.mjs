/**
 * Confirm the class names `bai-slider--empty` targets actually exist in the
 * rendered Astryx Slider (thumb + the filled-track sibling), since that rule
 * replaces antd's `styles={{ handle, track }}` slot API.
 */
import { chromium } from '@playwright/test';

const BASE = process.env.BAI_BASE ?? 'http://127.0.0.1:6001';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1700, height: 1100 } });
await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(9000);
const ui = page.locator('input[placeholder="Email or Username"]').first();
if (await ui.count()) {
  await page
    .locator('input[placeholder="Endpoint"]')
    .first()
    .fill('http://10.82.0.130:8090');
  await ui.fill('admin@lablup.com');
  await page.locator('input[type="password"]').first().fill('wJalrXUt');
  await page.getByRole('button', { name: /^login$/i }).first().click();
}
await page.waitForTimeout(20000);
await page.goto(`${BASE}/session/start?step=1`, {
  waitUntil: 'domcontentloaded',
});
await page.waitForTimeout(20000);

console.log(
  JSON.stringify(
    await page.evaluate(() => {
      const w = document.querySelector('.bai-slider');
      if (!w) return 'no slider';
      const track = w.querySelector('.astryx-slider-track');
      const thumb = w.querySelector('.astryx-slider-thumb');
      return {
        trackFound: !!track,
        thumbFound: !!thumb,
        // the rule targets `.astryx-slider-track + *` = the filled track
        filledTrackIsNextSibling: !!track?.nextElementSibling,
        filledTrackStyle: track?.nextElementSibling
          ? track.nextElementSibling.style.cssText.slice(0, 80)
          : null,
        thumbRole: thumb?.getAttribute('role'),
      };
    }),
    null,
    1,
  ),
);
await browser.close();
