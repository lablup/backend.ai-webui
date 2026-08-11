/**
 * QA2-B: `AstryxFormMultiSelector` proof.
 * admin/agent?tab=resource-groups -> edit a resource group -> "Allowed session
 * types", which is `AstryxFormMultiSelector` (static options).
 */
import fs from 'node:fs';
import { launch, login, shotOf, BASE } from './qa2b-lib.mjs';

const OUT = '.scratch/astryx-migration/shots/qa2-b';
fs.mkdirSync(OUT, { recursive: true });
const TAG = process.env.TAG ?? 'after';
const DARK = process.env.DARK === '1';
const M = DARK ? 'dark' : 'light';

const { browser, page } = await launch({ dark: DARK });
await login(page);
await page.goto(new URL('admin/agent?tab=resourceGroup', BASE).href, {
  waitUntil: 'domcontentloaded',
});
await page.waitForTimeout(10000);
console.log('url', page.url());
const tabs = await page.locator('.astryx-tab').allTextContents();
console.log('tabs', tabs);
const rgTab = page
  .locator('.astryx-tab')
  .filter({ hasText: /Resource Group/i })
  .first();
if (await rgTab.count()) {
  await rgTab.click();
  await page.waitForTimeout(8000);
}
console.log('rows', await page.locator('tbody tr').count());
const labels = await page
  .locator('tbody tr')
  .first()
  .locator('button')
  .evaluateAll((bs) => bs.map((b) => b.getAttribute('aria-label') ?? (b.textContent ?? '').trim().slice(0, 24)));
console.log('row buttons', labels);
const editBtn = page
  .locator('tbody tr')
  .first()
  .locator('button[aria-label*="dit" i]')
  .first();
if (await editBtn.count()) {
  await editBtn.click();
  await page.waitForTimeout(8000);
  const info = await page.evaluate(() =>
    [...document.querySelectorAll('.astryx-multi-selector')].map((el) => ({
      trigger: (el.querySelector('button')?.textContent ?? '').trim().slice(0, 120),
    })),
  );
  console.log('MULTISELECTORS', JSON.stringify(info));
  const ms = page.locator('.astryx-multi-selector').first();
  if (await ms.count()) {
    await shotOf(page, ms, `${OUT}/${TAG}-formmultiselector-sessiontypes-${M}.png`, 10);
  }
  await page.screenshot({ path: `${OUT}/${TAG}-resourcegroup-modal-${M}.png` });
}
await browser.close();
