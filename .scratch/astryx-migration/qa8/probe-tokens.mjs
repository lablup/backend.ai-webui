/**
 * qa8 group (1) — global token/theme measurements.
 *
 * Measures, in BOTH modes at 1600x1000:
 *   A. tooltip surface + text colour            (Q: dark-mode tooltip inverts)
 *   B. primary button rest vs hover background  (Q: dark hover leaves the hue)
 *   C. tab label colour at rest vs hover        (Q: dark hover label invisible)
 *   D. copy-icon glyph box                      (Q: copy icon too large)
 *
 * Usage: node .scratch/astryx-migration/qa8/probe-tokens.mjs [--tag before]
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
page.setDefaultTimeout(30000);
const pageErrors = [];
page.on('pageerror', (e) => pageErrors.push(e.message));

const css = (sel, props) =>
  page.evaluate(
    ([s, ps]) => {
      const el = document.querySelector(s);
      if (!el) return null;
      const c = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      const out = { rect: { w: +r.width.toFixed(1), h: +r.height.toFixed(1) } };
      for (const p of ps) out[p] = c.getPropertyValue(p);
      return out;
    },
    [sel, props],
  );

/**
 * Dark mode is entered through the HEADER BUTTON, not by writing a storage key
 * or forcing `color-scheme` — the app derives `data-theme` itself and any other
 * route leaves the document in light while the probe believes it is dark.
 */
async function setMode(mode) {
  await page.evaluate((m) => {
    const want = m === 'dark';
    if ((document.documentElement.dataset.theme === 'dark') === want) return;
    const b = Array.from(document.querySelectorAll('button')).find((x) =>
      /dark|theme|mode/i.test(x.getAttribute('aria-label') || x.title || ''),
    );
    if (b) b.click();
  }, mode);
  await page.waitForTimeout(2500);
  return page.evaluate(() => document.documentElement.dataset.theme ?? null);
}

const result = {};

for (const mode of ['light', 'dark']) {
  await page.goto(`${BASE}session`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);
  const applied = await setMode(mode);
  const m = (result[mode] = { appliedTheme: applied });

  // ---- A. tooltip -------------------------------------------------------
  const tipTrigger = page
    .locator('button[aria-describedby], .astryx-icon-button')
    .first();
  if (await tipTrigger.count()) {
    await tipTrigger.hover().catch(() => {});
    await page.waitForTimeout(900);
    m.tooltip = await css('.astryx-tooltip', [
      'background-color',
      'color',
      'border-radius',
      'font-size',
    ]);
  }
  await page.mouse.move(5, 5);
  await page.waitForTimeout(400);

  // ---- B. primary button rest vs hover ----------------------------------
  const primary = page
    .locator(
      'button.astryx-button[data-variant="primary"], button[class*="primary"]',
    )
    .first();
  if (await primary.count()) {
    m.primaryRest = await primary.evaluate((el) => {
      const c = getComputedStyle(el);
      return {
        bg: c.backgroundColor,
        color: c.color,
        label: el.textContent?.trim().slice(0, 24),
      };
    });
    await primary.hover();
    await page.waitForTimeout(500);
    m.primaryHover = await primary.evaluate((el) => {
      const c = getComputedStyle(el);
      return { bg: c.backgroundColor, color: c.color };
    });
  }
  await page.mouse.move(5, 5);
  await page.waitForTimeout(300);

  // ---- C. tab label rest vs hover ---------------------------------------
  const tabs = page.locator(
    '.astryx-tab-list button, [role="tab"], .bai-tab-list [role="tab"]',
  );
  const nTabs = await tabs.count();
  m.tabCount = nTabs;
  if (nTabs > 1) {
    const inactive = tabs.nth(1);
    m.tabRest = await inactive.evaluate((el) => {
      const c = getComputedStyle(el);
      return {
        color: c.color,
        bg: c.backgroundColor,
        label: el.textContent?.trim().slice(0, 24),
      };
    });
    await inactive.hover();
    await page.waitForTimeout(500);
    m.tabHover = await inactive.evaluate((el) => {
      const c = getComputedStyle(el);
      return { color: c.color, bg: c.backgroundColor };
    });
  }
  await page.mouse.move(5, 5);
  await page.waitForTimeout(300);

  // ---- D. copy icon ------------------------------------------------------
  m.copyIcon = await page.evaluate(() => {
    const svgs = [...document.querySelectorAll('svg')];
    const copy = svgs.find((s) => {
      const cls = (s.getAttribute('class') ?? '').toLowerCase();
      const parent = s.closest('button, [role="button"]');
      const lbl = (
        parent?.getAttribute('aria-label') ??
        parent?.getAttribute('title') ??
        ''
      ).toLowerCase();
      return cls.includes('copy') || lbl.includes('copy');
    });
    if (!copy) return null;
    const r = copy.getBoundingClientRect();
    const c = getComputedStyle(copy);
    const pr = copy.closest('button, [role="button"]')?.getBoundingClientRect();
    return {
      svg: { w: +r.width.toFixed(1), h: +r.height.toFixed(1) },
      fontSize: c.fontSize,
      button: pr ? { w: +pr.width.toFixed(1), h: +pr.height.toFixed(1) } : null,
    };
  });

  await page.screenshot({ path: `${ROOT}/${TAG}-tokens-${mode}.png` });
}

result.pageErrors = pageErrors;
fs.writeFileSync(
  `${ROOT}/${TAG}-tokens.json`,
  JSON.stringify(result, null, 2),
);
console.log(JSON.stringify(result, null, 2));
await browser.close();
