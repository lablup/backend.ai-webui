/**
 * qa8 batch3 — open each launcher dropdown and dump what the popup renders.
 *
 * READ-ONLY: opens popups, presses Escape. Never submits.
 *
 * Usage: node .scratch/astryx-migration/qa8/probe-b3-select-open.mjs
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const BASE =
  process.env.BASE ?? 'https://to-astryx.backend-ai-webui.localhost:1357/';
const ROOT = process.env.ROOT ?? '.scratch/astryx-migration/qa8';
const TAG = process.env.TAG ?? 'b3-open';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
  ignoreHTTPSErrors: true,
  storageState: `${ROOT}/state.json`,
});
const page = await ctx.newPage();
page.setDefaultNavigationTimeout(180000);
page.setDefaultTimeout(30000);
const pageErrors = [];
page.on('pageerror', (e) => pageErrors.push(e.message));

await page.goto(`${BASE}session/start`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(14000);
// step 1 -> Environments & Resource Allocation
await page.getByRole('button', { name: /^next/i }).first().click();
await page.waitForTimeout(6000);

const result = { url: page.url(), popups: {} };

const dumpPopup = () =>
  page.evaluate(() => {
    const list = document.querySelector('[role="listbox"]');
    if (!list) return { found: false };
    const r = list.getBoundingClientRect();
    const opts = [...list.querySelectorAll('[role="option"]')];
    const groups = [...list.querySelectorAll('[role="group"]')];
    return {
      found: true,
      rect: {
        x: Math.round(r.x),
        y: Math.round(r.y),
        w: Math.round(r.width),
        h: Math.round(r.height),
      },
      optionCount: opts.length,
      groupCount: groups.length,
      groupLabels: groups.map((g) => g.getAttribute('aria-label')).slice(0, 8),
      totalImgs: list.querySelectorAll('img').length,
      totalBadges: list.querySelectorAll(
        '[class*="badge"], .astryx-badge, [class*="token"]',
      ).length,
      options: opts.slice(0, 8).map((o) => {
        const or = o.getBoundingClientRect();
        const imgs = [...o.querySelectorAll('img')];
        return {
          text: o.textContent?.trim().slice(0, 120),
          imgCount: imgs.length,
          imgSrc: imgs[0]?.getAttribute('src')?.slice(0, 90) ?? null,
          imgNatural: imgs[0]
            ? { w: imgs[0].naturalWidth, h: imgs[0].naturalHeight }
            : null,
          imgRect: imgs[0]
            ? {
                w: +imgs[0].getBoundingClientRect().width.toFixed(1),
                h: +imgs[0].getBoundingClientRect().height.toFixed(1),
              }
            : null,
          badgeCount: o.querySelectorAll('[class*="badge"], .astryx-badge')
            .length,
          markCount: o.querySelectorAll('mark').length,
          rect: { w: +or.width.toFixed(1), h: +or.height.toFixed(1) },
          htmlHead: o.innerHTML.slice(0, 400),
        };
      }),
    };
  });

const openAndDump = async (key, locator, shotName) => {
  try {
    await locator.click({ timeout: 8000 });
    await page.waitForTimeout(1800);
    result.popups[key] = await dumpPopup();
    await page.screenshot({ path: `${ROOT}/${TAG}-${shotName}.png` });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(800);
  } catch (e) {
    result.popups[key] = { error: String(e).slice(0, 200) };
  }
};

// index into the visible listbox triggers on this step
const triggers = page.locator('[aria-haspopup="listbox"]:visible');
const n = await triggers.count();
result.visibleTriggerCount = n;
result.visibleTriggerTexts = [];
for (let i = 0; i < n; i++) {
  result.visibleTriggerTexts.push(
    (await triggers.nth(i).textContent())?.trim().slice(0, 80),
  );
}

for (let i = 0; i < n; i++) {
  await openAndDump(
    `trigger${i}:${result.visibleTriggerTexts[i]}`,
    triggers.nth(i),
    `t${i}`,
  );
}

result.pageErrors = pageErrors;
fs.writeFileSync(`${ROOT}/${TAG}.json`, JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2).slice(0, 12000));
await browser.close();
