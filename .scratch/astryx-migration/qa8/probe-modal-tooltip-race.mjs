/**
 * qa8 modal group — item (E), race variant.
 *
 * The steady-state probes found the AutoMount tooltip correctly anchored.
 * `Tooltip` writes `anchor-name` on the trigger from a LAYOUT EFFECT that
 * reads `wrapper.firstElementChild` (`Tooltip/Tooltip.tsx:244-280`), and
 * `useLayer`'s trigger ref is re-run on every remount — so a hover that lands
 * before/around that commit would open a popover with no resolvable anchor,
 * which `useLayer`'s own comment says "pins the popover to the viewport corner
 * because styles.base zeroes the UA margins".
 *
 * This hovers at several delays after the dialog opens, and also right after a
 * form re-render (switching the usage mode), looking for a frame where the
 * layer lands at the viewport origin.
 *
 * Usage: node .scratch/astryx-migration/qa8/probe-modal-tooltip-race.mjs
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const BASE =
  process.env.BASE ?? 'https://to-astryx.backend-ai-webui.localhost:1357/';
const ROOT = process.env.ROOT ?? '.scratch/astryx-migration/qa8';
const TAG = process.env.TAG ?? 'before';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
  ignoreHTTPSErrors: true,
  storageState: `${ROOT}/state.json`,
});
const page = await ctx.newPage();
page.setDefaultNavigationTimeout(180000);
page.setDefaultTimeout(20000);
const pageErrors = [];
page.on('pageerror', (e) => pageErrors.push(e.message));

const tipInfo = () =>
  page.evaluate(() => {
    const tip = [...document.querySelectorAll('[role="tooltip"]')].find((t) => {
      try {
        return t.matches(':popover-open');
      } catch {
        return false;
      }
    });
    if (!tip) return null;
    const r = tip.getBoundingClientRect();
    const c = getComputedStyle(tip);
    const pa = c.getPropertyValue('position-anchor').trim();
    const anchored = pa
      ? [...document.querySelectorAll('[style*="anchor-name"]')].some((el) =>
          (el.style.anchorName ?? '').includes(pa),
        )
      : false;
    return {
      x: +r.x.toFixed(1),
      y: +r.y.toFixed(1),
      w: +r.width.toFixed(1),
      positionAnchor: pa,
      anchorElementExists: anchored,
      positionArea: c.getPropertyValue('position-area').trim(),
      atViewportOrigin: r.x < 4 && r.y < 4,
    };
  });

const out = { runs: [] };

for (const delay of [0, 120, 350, 800, 2500]) {
  try {
    await page.goto(`${BASE}data`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(12000);
    await page.getByRole('button', { name: /create folder/i }).first().click();
    await page.waitForTimeout(delay);
    const trigger = page
      .locator('dialog[open] button:has(svg.lucide-circle-question-mark)')
      .first();
    await trigger.hover({ timeout: 6000, force: true });
    await page.waitForTimeout(700);
    out.runs.push({ delay, tip: await tipInfo() });
  } catch (e) {
    out.runs.push({ delay, error: String(e).split('\n')[0] });
  }
  await page.keyboard.press('Escape').catch(() => {});
  await page.waitForTimeout(500);
}

// Re-render case: toggle the usage mode, which re-renders the radio list (and
// therefore the tooltip's trigger), then hover immediately.
try {
  await page.goto(`${BASE}data`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(12000);
  await page.getByRole('button', { name: /create folder/i }).first().click();
  await page.waitForTimeout(2500);
  await page.locator('[data-testid="model-usage-mode"]').click().catch(async () => {
    await page.getByText(/^Models$/).first().click();
  });
  await page.waitForTimeout(150);
  await page
    .locator('dialog[open] button:has(svg.lucide-circle-question-mark)')
    .first()
    .hover({ timeout: 6000, force: true });
  await page.waitForTimeout(700);
  out.afterRerender = await tipInfo();
} catch (e) {
  out.afterRerender = { error: String(e).split('\n')[0] };
}

out.pageErrors = pageErrors;
fs.writeFileSync(
  `${ROOT}/${TAG}-modal-tooltip-race.json`,
  JSON.stringify(out, null, 2),
);
console.log(JSON.stringify(out, null, 2));
await browser.close();
