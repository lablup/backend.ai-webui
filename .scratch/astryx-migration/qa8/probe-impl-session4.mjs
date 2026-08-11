/**
 * qa8 IMPL — FIX 2, wrapper coverage: `AstryxFormSelector` (the
 * `react/src/components/astryxFormControls.tsx` adapter) is what most
 * `Form.Item`-hosted selects go through, and none of the direct call sites
 * measured in probe-impl-session2 exercise it.
 *
 * Target: /admin/resource-policy -> "Create" -> the "Default for Unspecified"
 * AstryxFormSelector (declared WITHOUT `hasSearch`, so the overlay condition
 * `placement == null && !hasSearch` was live).
 *
 * Read-only: the modal is opened and dismissed with Escape. Nothing submits.
 *
 * Usage: TAG=before node .scratch/astryx-migration/qa8/probe-impl-session4.mjs
 */
import fs from 'node:fs';
import { BASE, ROOT, launch, settle } from './probe-impl-session-lib.mjs';

const TAG = process.env.TAG ?? 'before';
const out = { tag: TAG, base: BASE, at: new Date().toISOString() };

const { browser, page, pageErrors } = await launch();

await page.goto(new URL('/admin/resource-policy', BASE).toString(), {
  waitUntil: 'domcontentloaded',
});
await page.waitForSelector('table tbody tr', { timeout: 90000 }).catch(() => {});
await settle(page);
await page.waitForTimeout(2000);

// The first primary "create" button on the Keypair resource-policy card.
await page
  .getByRole('button', { name: /create|add/i })
  .first()
  .click();
await page.waitForTimeout(3500);

const combos = page.locator('[role="combobox"]');
const n = await combos.count();
let opened = null;
for (let i = 0; i < n; i++) {
  const c = combos.nth(i);
  const bb = await c.boundingBox();
  if (!bb || bb.width === 0) continue;
  const t = ((await c.textContent()) ?? '').trim();
  if (/^(UNLIMITED|LIMITED)$/.test(t)) {
    await c.scrollIntoViewIfNeeded();
    await c.click();
    opened = t;
    break;
  }
}
out.opened = opened;
await page.waitForTimeout(900);

out.measure = opened
  ? await page.evaluate(() => {
      const trigger = Array.from(
        document.querySelectorAll('[role="combobox"][aria-expanded="true"]'),
      ).find((el) => el.getBoundingClientRect().width > 0);
      if (!trigger) return { error: 'no expanded combobox' };
      const lb = document.getElementById(trigger.getAttribute('aria-controls'));
      if (!lb) return { error: 'no listbox' };
      const tr = trigger.getBoundingClientRect();
      const pr = lb.getBoundingClientRect();
      let mbs = '0px';
      let el = lb;
      for (let i = 0; i < 5 && el; i++) {
        const v = getComputedStyle(el).marginBlockStart;
        if (v !== '0px' && v !== 'auto') {
          mbs = v;
          break;
        }
        el = el.parentElement;
      }
      return {
        triggerBottom: +tr.bottom.toFixed(2),
        panelTop: +pr.top.toFixed(2),
        delta: +(pr.top - tr.bottom).toFixed(2),
        marginBlockStart: mbs,
      };
    })
  : { error: `no UNLIMITED/LIMITED combobox among ${n}` };

await page.keyboard.press('Escape').catch(() => {});
out.pageErrors = pageErrors;
fs.writeFileSync(
  `${ROOT}/${TAG}-impl-session4.json`,
  JSON.stringify(out, null, 2),
);
console.log(JSON.stringify(out, null, 2));
await browser.close();
