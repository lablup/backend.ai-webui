/**
 * QA2-B button-group proof: close-ups + measured radii of every
 * `.astryx-button-group` on the surfaces that carry one.
 */
import fs from 'node:fs';
import { launch, login, groupGeom, shotOf, BASE } from './qa2b-lib.mjs';

const OUT = '.scratch/astryx-migration/shots/qa2-b';
fs.mkdirSync(OUT, { recursive: true });
const TAG = process.env.TAG ?? 'after';
const DARK = process.env.DARK === '1';
const M = DARK ? 'dark' : 'light';

const { browser, page } = await launch({ dark: DARK });
await login(page);

const shotGroups = async (name) => {
  const geom = await groupGeom(page);
  console.log(`\n[${name}]`, JSON.stringify(geom));
  const groups = page.locator('.astryx-button-group');
  const n = await groups.count();
  for (let i = 0; i < n; i++) {
    const g = groups.nth(i);
    const label = (await g.getAttribute('aria-label')) ?? String(i);
    const slug = label.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    await shotOf(page, g, `${OUT}/${TAG}-group-${name}-${slug}-${M}.png`, 14);
  }
};

// deployments list — refresh + interval
await page.goto(new URL('project/default/deployments', BASE).href, {
  waitUntil: 'domcontentloaded',
});
await page.waitForTimeout(9000);
await shotGroups('deployments');

// data — refresh + interval (icon-only dropdown, auto-refresh off)
await page.goto(new URL('project/default/data', BASE).href, {
  waitUntil: 'domcontentloaded',
});
await page.waitForTimeout(9000);
await shotGroups('data');

// deployment detail — Edit + More, and the card's refresh group
await page.goto(new URL('project/default/deployments', BASE).href, {
  waitUntil: 'domcontentloaded',
});
await page.waitForTimeout(9000);
await page.locator('tbody button.astryx-link, tbody a').first().click();
await page.waitForTimeout(10000);
await shotGroups('deployment-detail');

await browser.close();
