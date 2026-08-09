/**
 * QA2-B multi-select trigger proof.
 *
 * admin/users -> row "More actions" -> Edit -> the "Projects" field, which is
 * `ProjectSelect mode="multiple"` -> `BAISelect` -> Astryx `MultiSelector`.
 * Before the fix the trigger read "2 selected"; after it names the projects.
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

await page.goto(new URL('admin/users', BASE).href, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(9000);
await page
  .locator('tbody tr')
  .first()
  .locator('button[aria-label="More actions"]')
  .first()
  .click();
await page.waitForTimeout(1800);
await page.locator('[role="menuitem"]').filter({ hasText: /^Edit$/ }).first().click();
await page.waitForTimeout(9000);

const info = await page.evaluate(() =>
  [...document.querySelectorAll('.astryx-multi-selector, .astryx-complex-selector')].map(
    (el) => ({
      kind: String(el.className).split(' ')[0],
      trigger: (el.querySelector('button')?.textContent ?? '').trim().slice(0, 140),
    }),
  ),
);
console.log('USER-MODAL', JSON.stringify(info, null, 1));

const ms = page.locator('.astryx-multi-selector').first();
await shotOf(page, ms, `${OUT}/${TAG}-multiselector-projects-${M}.png`, 10);
await page.screenshot({ path: `${OUT}/${TAG}-user-modal-${M}.png` });
await browser.close();
