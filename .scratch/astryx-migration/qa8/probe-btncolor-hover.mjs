/**
 * qa8 group — HOVER wash of the BAINameActionCell action buttons.
 *
 * `.bai-nac-action-button-{default,danger}:hover` paint
 * `var(--color-background-{blue,red})` with `!important`; legacy antd painted
 * `token.colorInfoBg` / `token.colorErrorBg`. Measures the rest→hover pair in
 * BOTH modes at 1600x1000 on /session (SessionInfoCell has both a default and
 * a danger action in the same row).
 *
 * Usage: node .scratch/astryx-migration/qa8/probe-btncolor-hover.mjs
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const BASE =
  process.env.BASE ?? 'https://to-astryx.backend-ai-webui.localhost:1357/';
const ROOT = process.env.ROOT ?? '.scratch/astryx-migration/qa8';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
  ignoreHTTPSErrors: true,
  storageState: `${ROOT}/state.json`,
});
const page = await ctx.newPage();
page.setDefaultNavigationTimeout(180000);

async function setMode(mode) {
  await page.evaluate((m) => {
    const want = m === 'dark';
    if ((document.documentElement.dataset.theme === 'dark') === want) return;
    const b = Array.from(document.querySelectorAll('button')).find((x) =>
      /dark|theme|mode/i.test(x.getAttribute('aria-label') || x.title || ''),
    );
    if (b) b.click();
  }, mode);
  await page.waitForTimeout(2200);
  const applied = await page.evaluate(
    () => document.documentElement.dataset.theme ?? null,
  );
  if (applied !== mode) throw new Error(`theme toggle did not take: ${applied}`);
  return applied;
}

const read = (loc) =>
  loc.evaluate((el) => {
    const c = getComputedStyle(el);
    return { color: c.color, bg: c.backgroundColor };
  });

const out = {};
for (const mode of ['light', 'dark']) {
  await page.goto(`${BASE}session`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(12000);
  const applied = await setMode(mode);
  const m = (out[mode] = { appliedTheme: applied });

  for (const [name, sel] of [
    ['default', '.bai-nac-action-button-default'],
    ['danger', '.bai-nac-action-button-danger'],
  ]) {
    const loc = page.locator(sel).first();
    if (!(await loc.count())) {
      m[name] = null;
      continue;
    }
    const rest = await read(loc);
    await loc.hover();
    await page.waitForTimeout(600);
    const hover = await read(loc);
    await page.mouse.move(5, 5);
    await page.waitForTimeout(400);
    m[name] = { rest, hover };
  }
}

fs.writeFileSync(`${ROOT}/before-btncolor-hover.json`, JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
await browser.close();
